"use client";

import { Brain, CheckCircle2, AlertTriangle, Info, Lightbulb, Sparkles } from "lucide-react";
import { useAiInsights } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/primitives";

export function AiInsightsCard() {
  const { data: ai, isLoading } = useAiInsights();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-hairline bg-glass p-5 backdrop-blur-xl">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (!ai) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-hairline bg-glass/60 p-5 backdrop-blur-xl transition-all hover:border-hairline-strong">
      <div className="flex items-center justify-between border-b border-hairline pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
            <Brain className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              AI Audience Insights
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/20">
                <Sparkles className="size-2.5" />
                Live Analysis
              </span>
            </h3>
            <p className="text-xs text-ink-3">Retention: {ai.retention_rate}% · Follower/Following Ratio: {ai.follower_ratio}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ai.insights.map((item, idx) => {
          let Icon = Info;
          let iconColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
          if (item.type === "positive") {
            Icon = CheckCircle2;
            iconColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
          } else if (item.type === "warning") {
            Icon = AlertTriangle;
            iconColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
          } else if (item.type === "recommendation") {
            Icon = Lightbulb;
            iconColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
          }

          return (
            <div key={idx} className="rounded-xl border border-hairline bg-white/[0.02] p-3.5 flex items-start gap-3">
              <div className={`p-1.5 rounded-lg border shrink-0 ${iconColor}`}>
                <Icon className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-ink mb-0.5">{item.title}</h4>
                <p className="text-[11.5px] leading-relaxed text-ink-3">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
