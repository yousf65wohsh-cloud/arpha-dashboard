"use client";

import { Check, Gem, Rocket, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/dashboard-data";
import { useLang } from "@/components/dashboard/lang-provider";
import { formatIQD } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PLAN_ICON = [Sparkles, Rocket, Gem] as const;
const PLAN_ACCENT = [
  { icon: "text-cyan-300 bg-cyan-500/12 ring-cyan-500/25", bar: "from-[#06b6d4] to-[#0e7490]" },
  { icon: "text-indigo-300 bg-indigo-500/12 ring-indigo-500/25", bar: "from-[#6366f1] to-[#4f46e5]" },
  { icon: "text-amber-300 bg-amber-500/12 ring-amber-500/25", bar: "from-[#f59e0b] to-[#b45309]" },
] as const;

export function PlansView() {
  const { t, lang } = useLang();
  return (
    <div>
      <div className="mb-5 text-center">
        <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("plans.heading")}
        </p>
        <p className="mx-auto mt-2 max-w-md text-[13px] text-muted">
          {t("plans.subheading")}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {PLANS.map((plan, i) => {
          const Icon = PLAN_ICON[i];
          const accent = PLAN_ACCENT[i];
          const highlighted = !!plan.current;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-surface/80 p-5 shadow-card backdrop-blur-sm transition-all duration-300",
                highlighted
                  ? "border-indigo-500/40 shadow-[0_24px_80px_-24px_rgba(79,70,229,0.5)]"
                  : "border-white/[0.07] hover:border-white/[0.14]",
              )}
            >
              {highlighted && (
                <span className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                  <Badge variant="primary">{t("plans.current")}</Badge>
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className={cn("grid size-10 place-items-center rounded-xl ring-1", accent.icon)}>
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{t(plan.nameKey)}</p>
                  <p className="text-[11px] text-muted">{t(plan.taglineKey)}</p>
                </div>
              </div>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight text-foreground">{formatIQD(plan.price * 1000, lang)}</span>
                <span className="text-[12px] text-muted">{t("plans.perMonth")}</span>
              </div>

              <div className={cn("mt-4 h-1 rounded-full bg-gradient-to-r opacity-70", accent.bar)} />

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f, i) => (
                  <li key={f} className="flex items-start gap-2.5 text-[12.5px] text-muted">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                      <Check className="size-2.5" />
                    </span>
                    {t(plan.featureKeys[i])}
                  </li>
                ))}
              </ul>

              <Button
                variant={highlighted ? "outline" : "default"}
                className="mt-6 w-full"
                disabled={highlighted}
              >
                {highlighted ? t("plans.current") : t(plan.ctaKey)}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[12px] text-muted">
        {t("plans.footer")}
      </p>
    </div>
  );
}
