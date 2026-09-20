"use client";

import { AlertTriangle, ArrowUpRight, Bell, CheckCircle2, Minus } from "lucide-react";
import { useGrowthForecast, useSmartAlerts } from "@/lib/hooks";
import { comma } from "@/lib/format";
import { Panel, PanelHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";

const trendLabel = {
  accelerating: "Accelerating",
  slowing: "Slowing",
  steady: "Steady",
};

export function IntelligencePanel() {
  const forecast = useGrowthForecast();
  const alerts = useSmartAlerts();

  return (
    <Panel>
      <PanelHeader
        title="Audience intelligence"
        description="Trend projections and signals from your latest syncs"
        action={<Bell className="size-4 text-indigo-lift" />}
      />
      <div className="grid gap-5 px-6 pb-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-3">Follower forecast</p>
              <p className="mt-1 text-xs text-ink-3">
                {forecast.data ? `${trendLabel[forecast.data.trend]} · ${forecast.data.daily_net_average >= 0 ? "+" : ""}${forecast.data.daily_net_average}/day` : "Calculating"}
              </p>
            </div>
            {forecast.data ? <ArrowUpRight className="size-4 text-positive" /> : null}
          </div>
          {forecast.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {forecast.data?.projections.map((projection) => (
                <div key={projection.days} className="rounded-xl border border-hairline bg-white/[0.025] p-3">
                  <p className="text-[11px] text-ink-3">{projection.days} days</p>
                  <p className="mt-2 tnum text-lg font-semibold text-ink">{comma(projection.projected_followers)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-[11px] uppercase tracking-wider text-ink-3">Smart alerts</p>
          {alerts.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : alerts.data?.alerts.length ? (
            <div className="space-y-2">
              {alerts.data.alerts.slice(0, 3).map((alert, index) => {
                const positive = alert.severity === "positive";
                const Icon = positive ? CheckCircle2 : AlertTriangle;
                return (
                  <div key={`${alert.kind}-${index}`} className="flex items-start gap-2.5 rounded-xl border border-hairline bg-white/[0.025] p-2.5">
                    <Icon className={`mt-0.5 size-4 shrink-0 ${positive ? "text-positive" : "text-amber-300"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink">{alert.title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-3">{alert.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-hairline bg-white/[0.025] p-3 text-xs text-ink-3">
              <Minus className="size-4" /> No unusual signals detected.
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}