"use client";

import {
  ExternalLink,
  Eye,
  CheckCircle2,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  AlertTriangle,
  Star,
  Users,
} from "lucide-react";
import { StarHistory } from "@/components/dashboard/charts";
import { Button } from "@/components/ui/button";
import { Dialog, DrawerContent } from "@/components/ui/overlays";
import { Badge } from "@/components/ui/primitives";
import { bytes, comma, formatDate, languageColor } from "@/lib/format";
import { useRepoAnalysis, useStarHistory } from "@/lib/hooks";
import type { Repo } from "@/lib/types";

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-white/[0.03] p-3.5">
      <div className="flex items-center gap-1.5 text-ink-3">
        <Icon className="size-3" />
        <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="tnum mt-1.5 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

export function RepoDrawer({ repo, onClose }: { repo: Repo | null; onClose: () => void }) {
  const { data: stars, isLoading } = useStarHistory(repo?.name ?? null);
  const analysis = useRepoAnalysis(repo?.name ?? null);

  const langs = repo
    ? Object.entries(repo.languages).sort((a, b) => b[1] - a[1]).slice(0, 6)
    : [];
  const langTotal = langs.reduce((s, [, v]) => s + v, 0);

  return (
    <Dialog open={!!repo} onOpenChange={(o) => !o && onClose()}>
      {repo && (
        <DrawerContent title={repo.name} description={repo.description || "No description"}>
          <div className="space-y-6 p-6">
            <div className="flex flex-wrap gap-2">
              {repo.is_private && <Badge tone="warning">Private</Badge>}
              {repo.is_fork && <Badge tone="neutral">Fork</Badge>}
              {repo.is_archived && <Badge tone="neutral">Archived</Badge>}
              {repo.topics.slice(0, 4).map((t) => (
                <Badge key={t} tone="brand">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat icon={Star} label="Stars" value={comma(repo.stars)} />
              <Stat icon={GitFork} label="Forks" value={comma(repo.forks)} />
              <Stat icon={GitCommitHorizontal} label="Commits" value={comma(repo.commits_total)} />
              <Stat icon={GitBranch} label="Branches" value={comma(repo.branches)} />
              <Stat
                icon={Eye}
                label={`Views (${repo.traffic_days_recorded}d)`}
                value={comma(repo.views_all_time)}
              />
              <Stat icon={Users} label="Watchers" value={comma(repo.watchers)} />
            </div>

            <section className="rounded-xl border border-hairline bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[13px] font-semibold text-ink">Repository health</h3>
                  <p className="mt-1 text-[11px] text-ink-3">
                    A transparent score based on discoverability, activity, and adoption.
                  </p>
                </div>
                {analysis.data && (
                  <div className="text-right">
                    <p className="tnum text-2xl font-semibold text-indigo-lift">
                      {analysis.data.score}
                    </p>
                    <p className="text-[10px] font-medium text-ink-3">{analysis.data.label}</p>
                  </div>
                )}
              </div>
              {analysis.isLoading ? (
                <div className="mt-4 h-2 animate-pulse rounded-full bg-white/[0.08]" />
              ) : analysis.data ? (
                <>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-indigo-lift transition-[width] duration-700"
                      style={{ width: `${analysis.data.score}%` }}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {analysis.data.strengths.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-300">
                          <CheckCircle2 className="size-3.5" /> Strengths
                        </p>
                        <ul className="space-y-1 text-[11px] text-ink-2">
                          {analysis.data.strengths.map((item) => <li key={item}>• {item}</li>)}
                        </ul>
                      </div>
                    )}
                    {analysis.data.risks.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-300">
                          <AlertTriangle className="size-3.5" /> Risks
                        </p>
                        <ul className="space-y-1 text-[11px] text-ink-2">
                          {analysis.data.risks.map((item) => <li key={item}>• {item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                  {analysis.data.actions.length > 0 && (
                    <div className="mt-4 border-t border-hairline pt-3">
                      <p className="mb-2 text-[11px] font-medium text-ink-2">Recommended next steps</p>
                      <ul className="space-y-1 text-[11px] text-ink-3">
                        {analysis.data.actions.map((item) => <li key={item}>• {item}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 text-[11px] text-rose-300">Analysis is unavailable right now.</p>
              )}
            </section>

            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-ink">Star history</h3>
              <StarHistory points={stars} loading={isLoading} />
            </div>

            {langs.length > 0 && (
              <div>
                <h3 className="mb-3 text-[13px] font-semibold text-ink">Languages</h3>
                {/* Composition bar — 2px gaps so segments never touch. */}
                <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
                  {langs.map(([name, v]) => (
                    <span
                      key={name}
                      style={{
                        width: `${(v / langTotal) * 100}%`,
                        background: languageColor(name),
                      }}
                    />
                  ))}
                </div>
                <ul className="mt-3 space-y-1.5">
                  {langs.map(([name, v]) => (
                    <li key={name} className="flex items-center gap-2.5 text-[12px]">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: languageColor(name) }}
                        aria-hidden
                      />
                      <span className="text-ink-2">{name}</span>
                      <span className="tnum ml-auto text-ink-3">
                        {((v / langTotal) * 100).toFixed(1)}% · {bytes(v)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {repo.referrers.length > 0 && (
              <div>
                <h3 className="mb-3 text-[13px] font-semibold text-ink">Top referrers</h3>
                <ul className="space-y-1.5">
                  {repo.referrers.slice(0, 5).map((r) => (
                    <li
                      key={r.referrer}
                      className="flex items-center justify-between text-[12px]"
                    >
                      <span className="truncate text-ink-2">{r.referrer}</span>
                      <span className="tnum shrink-0 text-ink-3">
                        {comma(r.count)} · {comma(r.uniques)} unique
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-hairline pt-5">
              <span className="text-[12px] text-ink-3">
                Created {formatDate(repo.created_at)}
              </span>
              <Button asChild variant="secondary" size="sm">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  Open on GitHub
                </a>
              </Button>
            </div>
          </div>
        </DrawerContent>
      )}
    </Dialog>
  );
}
