"use client";

import {
  ArrowRight,
  Github,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Magnetic } from "@/components/motion/primitives";
import { Button } from "@/components/ui/button";
import { DashboardMockup } from "./mockup";

function Headline() {
  return (
    <h1 className="text-[clamp(2.5rem,min(5.2vw,7.4vh),4.5rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
      <span className="block pb-1">
        <span className="text-gradient mr-[0.22em] inline-block">GitHub</span>
        <span className="text-gradient inline-block">forgets.</span>
      </span>
      <span className="block pb-1">
        <span className="text-gradient-brand mr-[0.22em] inline-block">GitPulse</span>
        <span className="text-gradient-brand inline-block">doesn&apos;t.</span>
      </span>
    </h1>
  );
}

function Pillars() {
  const pillars = [
    {
      icon: Users,
      title: "Audience tracking",
      body: "Every follower, unfollower and re-follow — who, and exactly when.",
    },
    {
      icon: LineChart,
      title: "Repo traffic & stats",
      body: "Views and clones recorded daily, kept long after GitHub drops them.",
    },
    {
      icon: Sparkles,
      title: "AI repo analysis",
      body: "Reads your repository structure and writes the report.",
      soon: true,
    },
  ];

  return (
    <ul className="mt-7 grid gap-4 border-t border-hairline pt-5 sm:grid-cols-3 lg:mt-8 lg:pt-6">
      {pillars.map(({ icon: Icon, title, body, soon }) => (
        <li key={title}>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-indigo-2/25 bg-indigo-2/10 text-indigo-lift">
              <Icon className="size-3.5" />
            </span>
            {soon && (
              <span className="rounded-full border border-hairline bg-glass px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-ink-3 uppercase">
                Soon
              </span>
            )}
          </div>
          <p className="text-[13px] font-medium text-ink">{title}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{body}</p>
        </li>
      ))}
    </ul>
  );
}

export function Hero() {
  return (
    <section className="relative isolate flex min-h-dvh items-center pt-24 pb-12 lg:pt-20 lg:pb-10">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8">
        {/* ── Left ── */}
        <div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-glass py-1.5 pr-3.5 pl-1.5 backdrop-blur-xl">
              <span className="flex items-center gap-1 rounded-full bg-indigo-2/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-lift uppercase">
                <ShieldCheck className="size-3" />
                v2
              </span>
              <span className="text-[13px] text-ink-2">
                Your GitHub history, kept on purpose
              </span>
            </span>
          </div>

          <div className="mt-6 lg:mt-7">
            <Headline />
          </div>

          <p className="mt-5 max-w-xl text-[clamp(13.5px,1.9vh,15.5px)] leading-[1.65] text-ink-3 lg:mt-6">
            See <span className="text-ink-2">who followed you, who left, and when</span> —
            all on one dashboard. GitHub keeps only{" "}
            <span className="text-ink-2">14 days</span> of repository traffic; GitPulse
            records views and clones <span className="text-ink-2">every day</span> and
            builds the full history it never gave you. Next up:{" "}
            <span className="text-ink">AI that reads your repos and writes the analysis.</span>
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 lg:mt-8">
            <Magnetic>
              <Button asChild variant="primary" size="lg">
                <Link href="/login">
                  Login with GitHub
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild variant="secondary" size="lg">
                <Link href="/login">
                  Open dashboard
                </Link>
              </Button>
            </Magnetic>
            <Button asChild variant="secondary" size="lg">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="size-4" />
                View source
              </a>
            </Button>
          </div>

          <Pillars />
        </div>

        {/* ── Right ── */}
        <DashboardMockup />
      </div>
    </section>
  );
}
