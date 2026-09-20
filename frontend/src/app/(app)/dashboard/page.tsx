"use client";

import {
  BookMarked,
  Copy,
  Eye,
  GitCommitHorizontal,
  GitFork,
  Globe,
  // `Lock` alone collides with the DOM's Web Locks API type.
  Lock as LockIcon,
  Star,
  CheckCircle2,
  Clock3,
  TriangleAlert,
  UserMinus,
  UserRoundCheck,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ContributionHeatmap } from "@/components/dashboard/heatmap";
import { FollowerGrowthChart } from "@/components/dashboard/charts";
import { KpiGrid, type Kpi } from "@/components/dashboard/kpi";
import { TopRepos } from "@/components/dashboard/top-repos";
import { LastSynced } from "@/components/shell/topbar";
import { Panel, PanelHeader } from "@/components/ui/card";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/overlays";
import { Button } from "@/components/ui/button";
import { PageHeading, Skeleton } from "@/components/ui/primitives";
import { comma, formatDateTime } from "@/lib/format";
import {
  useAudienceQuality,
  useContributionYear,
  useContributions,
  useFollowerStats,
  useFollowerGrowth,
  useProfile,
  useReposOverview,
  useRepositoryOpportunityRadar,
  useSyncRuns,
} from "@/lib/hooks";

/**
 * Recharts is ~120kB of the dashboard's JavaScript and neither of these charts is
 * visible on first paint — they sit below the KPI rows and the heatmap. Loading
 * them on their own chunk lets the numbers at the top render while the chart code
 * is still arriving. `ssr: false` because Recharts measures the DOM to size itself
 * and has nothing useful to render on the server anyway.
 */
const ContributionsByYear = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.ContributionsByYear),
  { ssr: false, loading: () => <Skeleton className="mx-6 mb-6 h-64" /> },
);
const LanguageDonut = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.LanguageDonut),
  { ssr: false, loading: () => <Skeleton className="mx-6 mb-6 h-64" /> },
);

import { AiInsightsCard } from "@/components/dashboard/ai-insights-card";
import { ExportBadgeModal } from "@/components/dashboard/export-badge-modal";
import { IntelligencePanel } from "@/components/dashboard/intelligence-panel";

export default function DashboardPage() {
  const profile = useProfile();
  const stats = useFollowerStats();
  const growth = useFollowerGrowth();
  const repos = useReposOverview();
  const contrib = useContributions();
  const syncRuns = useSyncRuns();
  const audienceQuality = useAudienceQuality();
  const opportunityRadar = useRepositoryOpportunityRadar();
  const dashboardError = [
    profile,
    stats,
    growth,
    repos,
    contrib,
    syncRuns,
    audienceQuality,
    opportunityRadar,
  ].find((query) => query.isError)?.error;

  // Default to the most recent year we actually have data for — not `new Date()`,
  // which would 404 in January before the first sync of the year.
  const availableYears = useMemo(
    () => (contrib.data?.years ?? []).map((y) => y.year).sort((a, b) => b - a),
    [contrib.data],
  );
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? availableYears[0];

  const yearData = useContributionYear(activeYear);

  const kpis: Kpi[] = [
    {
      label: "Followers",
      value: stats.data?.total_followers,
      icon: Users,
      tone: "brand",
      sub: "People following you",
    },
    {
      label: "Following",
      value: profile.data?.following,
      icon: UserRoundCheck,
      tone: "brand",
      sub: "Accounts you follow",
    },
    {
      label: "Lost followers",
      value: stats.data?.total_unfollowed_events,
      icon: UserMinus,
      tone: "negative",
      sub: "Unfollowed and not returned",
    },
  ];

  // Kept as its own row of three. Folding these into the audience row made six
  // cards, which wrapped and left "Private repos" orphaned on a line of its own.
  const countKpis: Kpi[] = [
    {
      label: "Repositories",
      value: repos.data?.total_repos,
      icon: BookMarked,
      tone: "brand",
      sub: "Owned by you",
    },
    {
      label: "Public repos",
      value: repos.data?.public_repos,
      icon: Globe,
      tone: "positive",
      sub: "Visible to everyone",
    },
    {
      label: "Private repos",
      value: repos.data?.private_repos,
      icon: LockIcon,
      tone: "negative",
      sub: "Visible only to you",
    },
  ];

  const repoKpis: Kpi[] = [
    {
      label: "Total stars",
      value: repos.data?.total_stars,
      icon: Star,
      tone: "brand",
      sub: repos.data ? `across ${comma(repos.data.total_repos)} repos` : undefined,
    },
    {
      label: "Forks",
      value: repos.data?.total_forks,
      icon: GitFork,
      sub: repos.data ? `${comma(repos.data.total_watchers)} watchers` : undefined,
    },
    {
      label: "Repository views",
      value: repos.data?.total_views,
      icon: Eye,
      // Say what the window actually is — this is accumulated history, not GitHub's 14 days.
      sub: repos.data
        ? `${comma(repos.data.total_views_unique)} unique · ${repos.data.traffic_days_recorded}d recorded`
        : undefined,
    },
    {
      label: "Clones",
      value: repos.data?.total_clones,
      icon: Copy,
      sub: repos.data ? `${comma(repos.data.total_clones_unique)} unique` : undefined,
    },
    {
      label: "Commits",
      value: repos.data?.total_commits,
      icon: GitCommitHorizontal,
      // All-time, with the last-52-weeks figure as context rather than as the headline.
      sub: repos.data
        ? `${comma(repos.data.total_commits_year)} in the last year`
        : undefined,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeading
        title="Overview"
        description="Your audience, repositories and contribution history — all from the last sync."
        action={
          <div className="flex items-center gap-3">
            <ExportBadgeModal />
            <LastSynced at={repos.data?.synced_at} />
          </div>
        }
      />

      {dashboardError && (
        <div
          role="alert"
          className="rounded-xl border border-negative/30 bg-negative/10 px-4 py-3 text-sm text-negative"
        >
          Dashboard data could not be loaded. Check that the backend and MongoDB connection are
          available, then refresh this page.
        </div>
      )}

      {profile.data && (
        <div className="rounded-2xl border border-hairline bg-glass p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={profile.data.avatar_url}
                alt={profile.data.login}
                width={64}
                height={64}
                className="size-16 rounded-full ring-1 ring-hairline"
                unoptimized
              />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-3">
                  Signed in as
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-ink">
                  {profile.data.name || profile.data.login}
                </h2>
                <p className="text-sm text-ink-3">@{profile.data.login}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-ink-3">
              {profile.data.company && (
                <span className="rounded-full border border-hairline bg-white/[0.02] px-3 py-1.5">
                  {profile.data.company}
                </span>
              )}
              {profile.data.location && (
                <span className="rounded-full border border-hairline bg-white/[0.02] px-3 py-1.5">
                  {profile.data.location}
                </span>
              )}
              {profile.data.blog && (
                <a
                  href={profile.data.blog.startsWith("http") ? profile.data.blog : `https://${profile.data.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-hairline bg-white/[0.02] px-3 py-1.5 transition hover:border-hairline-strong hover:text-ink"
                >
                  Website
                </a>
              )}
            </div>
          </div>

          {profile.data.bio && (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-3">{profile.data.bio}</p>
          )}
        </div>
      )}

      <AiInsightsCard />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Audience quality"
            description="Health score for followers and engagement quality"
            action={
              <span className="text-[11px] font-medium text-ink-3">
                {audienceQuality.data ? `${audienceQuality.data.score}/100` : "—"}
              </span>
            }
          />
          {audienceQuality.isLoading ? (
            <div className="px-6 pb-6">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : audienceQuality.data ? (
            <div className="space-y-5 px-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink-3">Overall score</p>
                  <p className="mt-2 text-3xl font-semibold text-ink">{audienceQuality.data.score}</p>
                </div>
                <div className="rounded-full border border-hairline bg-white/[0.025] px-3 py-1 text-[11px] font-medium text-ink">
                  {audienceQuality.data.status}
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-hairline bg-white/[0.025]">
                <div
                  className="h-2 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500"
                  style={{ width: `${audienceQuality.data.score}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-ink-3">
                <div>
                  <p>Retention</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{audienceQuality.data.retention_rate}%</p>
                </div>
                <div>
                  <p>Net growth</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{audienceQuality.data.net_growth >= 0 ? "+" : ""}{audienceQuality.data.net_growth}</p>
                </div>
                <div>
                  <p>Followers</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{comma(audienceQuality.data.total_followers)}</p>
                </div>
              </div>
              <ul className="space-y-2 text-[12px] text-ink-3">
                {audienceQuality.data.recommendations.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Panel>

        <Panel>
          <PanelHeader
            title="Repository opportunity radar"
            description="Where your project portfolio has the strongest traction"
            action={
              <span className="text-[11px] font-medium text-ink-3">
                {opportunityRadar.data?.top_pick ? `${opportunityRadar.data.top_pick.score}/100` : "—"}
              </span>
            }
          />
          {opportunityRadar.isLoading ? (
            <div className="px-6 pb-6">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : opportunityRadar.data?.opportunities.length ? (
            <div className="space-y-4 px-6 pb-6">
              {opportunityRadar.data.opportunities.slice(0, 3).map((repo) => (
                <div key={repo.name} className="rounded-xl border border-hairline bg-white/[0.025] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{repo.name}</p>
                      <p className="mt-1 text-[11px] text-ink-3">{repo.description}</p>
                    </div>
                    <span className="rounded-full border border-hairline px-2 py-1 text-[10px] font-medium text-ink-3">
                      {repo.quality}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-ink-3">
                    <span>Score</span>
                    <span className="tnum font-medium text-ink">{repo.score}/100</span>
                  </div>
                  <div className="mt-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500"
                      style={{ width: `${repo.score}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-ink-3">
                    <div>
                      <p>Stars</p>
                      <p className="tnum mt-1 text-sm font-semibold text-ink">{comma(repo.stars)}</p>
                    </div>
                    <div>
                      <p>Views</p>
                      <p className="tnum mt-1 text-sm font-semibold text-ink">{comma(repo.views_all_time)}</p>
                    </div>
                    <div>
                      <p>Forks</p>
                      <p className="tnum mt-1 text-sm font-semibold text-ink">{comma(repo.forks)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 pb-6 text-[12px] text-ink-3">No repository momentum detected yet.</div>
          )}
        </Panel>
      </div>

      <IntelligencePanel />

      <Panel>
        <PanelHeader
          title="Audience growth"
          description="Daily follower movement over the last 90 days"
          action={
            <div className="text-right">
              <p className="tnum text-sm font-semibold text-ink">
                {growth.data ? `${growth.data.net >= 0 ? "+" : ""}${growth.data.net}` : "—"} net
              </p>
              <p className="text-[11px] text-ink-3">
                {growth.data ? `${growth.data.retention_rate}% retention` : "Loading"}
              </p>
            </div>
          }
        />
        <FollowerGrowthChart points={growth.data?.points} loading={growth.isLoading} />
      </Panel>

      <Panel>
        <PanelHeader
          title="Sync health"
          description="Recent data refreshes and their outcomes"
          action={
            <span className="text-[11px] text-ink-3">
              {syncRuns.data?.length ?? 0} recent runs
            </span>
          }
        />
        <div className="divide-y divide-hairline px-6 pb-2">
          {syncRuns.isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : syncRuns.data?.length ? (
            syncRuns.data.slice(0, 5).map((run) => (
              <div key={run.run_id} className="flex items-center gap-3 py-3 text-[12px]">
                {run.status === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-positive" />
                ) : run.status === "failed" ? (
                  <TriangleAlert className="size-4 shrink-0 text-negative" />
                ) : (
                  <Clock3 className="size-4 shrink-0 text-amber-300" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium capitalize text-ink">{run.status} sync</p>
                  <p className="truncate text-ink-3">
                    {formatDateTime(run.started_at)}
                    {run.error ? ` · ${run.error}` : ""}
                  </p>
                </div>
                <span className="tnum shrink-0 text-ink-3">
                  {run.duration_ms != null ? `${(run.duration_ms / 1000).toFixed(1)}s` : "—"}
                </span>
              </div>
            ))
          ) : (
            <p className="py-5 text-[12px] text-ink-3">No sync runs recorded yet.</p>
          )}
        </div>
      </Panel>

      <KpiGrid kpis={kpis} loading={stats.isLoading || repos.isLoading} />
      <KpiGrid kpis={countKpis} loading={repos.isLoading} />

      {/* Contribution heatmap */}
      <Panel>
        <PanelHeader
          title="Contributions"
          description={
            yearData.data
              ? `${comma(yearData.data.total_contributions)} contributions in ${activeYear}`
              : "Commits, issues, pull requests and reviews"
          }
          action={
            availableYears.length > 0 && (
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button variant="secondary" size="sm">
                    {activeYear ?? "—"}
                  </Button>
                </DropdownTrigger>
                <DropdownContent>
                  {availableYears.map((y) => (
                    <DropdownItem key={y} onSelect={() => setYear(y)} selected={y === activeYear}>
                      {y}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              </Dropdown>
            )
          }
        />
        <ContributionHeatmap
          weeks={yearData.data?.weeks}
          loading={contrib.isLoading || yearData.isLoading}
        />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Contributions by year"
            description="Split by commits, reviews, issues and pull requests"
          />
          <ContributionsByYear years={contrib.data?.years} loading={contrib.isLoading} />
        </Panel>

        <Panel>
          <PanelHeader
            title="Languages"
            description="Share of code across every repository you own"
          />
          <LanguageDonut languages={repos.data?.top_languages} loading={repos.isLoading} />
        </Panel>
      </div>

      <KpiGrid kpis={repoKpis} loading={repos.isLoading} />

      <Panel>
        <PanelHeader
          title="Top repositories"
          description="Ranked by stars"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/repositories">View all</Link>
            </Button>
          }
        />
        <TopRepos repos={repos.data?.most_starred} loading={repos.isLoading} />
      </Panel>
    </div>
  );
}
