"use client";

import { useState } from "react";
import { Download, Code, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/overlays";
import { api } from "@/lib/api";

export function ExportBadgeModal() {
  const [copied, setCopied] = useState(false);
  const badgeUrl = api.badgeUrl();
  const markdownSnippet = `![GitPulse Audience](${badgeUrl})`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <Download className="size-3.5" />
          Export & Badge
        </Button>
      </DialogTrigger>
      <DialogContent 
        title="Data Export & Profile Badge"
        description="Download historical snapshot logs or embed a live audience badge in your GitHub README."
      >
        <div className="space-y-5 p-6 pt-2">
          {/* CSV & JSON Export */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">Export Audience Data</h4>
            <p className="text-xs text-ink-3">Download your complete follower history, lost followers log, and snapshot history.</p>
            <div className="flex gap-2 pt-1">
              <Button asChild variant="secondary" size="sm" className="flex-1">
                <a href={api.exportUrl("csv")} download>
                  <Download className="size-3.5 mr-1.5" />
                  Download CSV
                </a>
              </Button>
              <Button asChild variant="secondary" size="sm" className="flex-1">
                <a href={api.exportUrl("json")} download>
                  <Download className="size-3.5 mr-1.5" />
                  Download JSON
                </a>
              </Button>
            </div>
          </div>

          <div className="h-px bg-hairline" />

          {/* GitHub README Badge */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">Live Profile README Badge</h4>
            <p className="text-xs text-ink-3">Embed this live SVG badge into your personal GitHub profile README.md:</p>

            <div className="p-3 bg-black/40 rounded-xl border border-hairline flex items-center justify-center my-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={badgeUrl} alt="GitPulse Audience Badge Preview" className="h-9" />
            </div>

            <div className="flex items-center gap-2 bg-black/50 p-2.5 rounded-lg border border-hairline">
              <Code className="size-4 text-ink-3 shrink-0" />
              <code className="text-[11px] text-ink-2 truncate flex-1 font-mono">{markdownSnippet}</code>
              <Button size="sm" variant="ghost" onClick={copyToClipboard} className="h-7 px-2">
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
