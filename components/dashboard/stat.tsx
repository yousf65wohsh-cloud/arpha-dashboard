"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/dashboard/sparkline";

const ACCENTS = {
  primary: { icon: "text-indigo-400 bg-indigo-500/12 ring-indigo-500/25", line: "#6366f1" },
  accent: { icon: "text-cyan-400 bg-cyan-500/12 ring-cyan-500/25", line: "#06b6d4" },
  success: { icon: "text-emerald-400 bg-emerald-500/12 ring-emerald-500/25", line: "#22c55e" },
  warning: { icon: "text-amber-400 bg-amber-500/12 ring-amber-500/25", line: "#f59e0b" },
  danger: { icon: "text-red-400 bg-red-500/12 ring-red-500/25", line: "#ef4444" },
} as const;

interface StatProps {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  accent?: keyof typeof ACCENTS;
  sparkline?: number[];
  className?: string;
}

export function Stat({
  label,
  value,
  delta,
  icon: Icon,
  accent = "primary",
  sparkline,
  className,
}: StatProps) {
  const a = ACCENTS[accent];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface/80 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-surface",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg ring-1",
              a.icon,
            )}
          >
            <Icon className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted">{label}</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-foreground">
              {value}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
          <TrendingUp className="size-3" />
          {delta}
        </span>
      </div>
      {sparkline && (
        <div className="mt-3 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
          <Sparkline data={sparkline} color={a.line} height={32} />
        </div>
      )}
    </div>
  );
}
