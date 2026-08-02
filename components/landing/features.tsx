"use client";

import { ArrowUpRight } from "lucide-react";
import type { Feature } from "@/types";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/landing/section-heading";
import { Stagger, StaggerItem } from "@/components/landing/scroll-reveal";
import { useLang } from "@/components/dashboard/lang-provider";
import { FEATURES } from "@/lib/data";
import { cn } from "@/lib/utils";

const ACCENTS = {
  primary: {
    chip: "bg-indigo-500/12 text-indigo-300 ring-indigo-500/25",
    glow: "group-hover:shadow-[0_30px_80px_-30px_rgba(79,70,229,0.45)]",
    line: "from-[#6366f1]",
  },
  success: {
    chip: "bg-emerald-500/12 text-emerald-300 ring-emerald-500/25",
    glow: "group-hover:shadow-[0_30px_80px_-30px_rgba(34,197,94,0.4)]",
    line: "from-[#22c55e]",
  },
  accent: {
    chip: "bg-cyan-500/12 text-cyan-300 ring-cyan-500/25",
    glow: "group-hover:shadow-[0_30px_80px_-30px_rgba(6,182,212,0.4)]",
    line: "from-[#06b6d4]",
  },
  warning: {
    chip: "bg-amber-500/12 text-amber-300 ring-amber-500/25",
    glow: "group-hover:shadow-[0_30px_80px_-30px_rgba(245,158,11,0.4)]",
    line: "from-[#f59e0b]",
  },
  danger: {
    chip: "bg-red-500/12 text-red-300 ring-red-500/25",
    glow: "group-hover:shadow-[0_30px_80px_-30px_rgba(239,68,68,0.4)]",
    line: "from-[#ef4444]",
  },
} as const;

function FeatureCard({ feature }: { feature: Feature }) {
  const a = ACCENTS[feature.accent];
  const { t } = useLang();
  return (
    <StaggerItem className="h-full">
      <div
        className={cn(
          "group relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-surface/50 p-6",
          "transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-surface",
          a.glow,
        )}
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            a.line,
          )}
        />
        <span
          className={cn(
            "grid size-11 place-items-center rounded-xl ring-1 transition-transform duration-500 group-hover:scale-110",
            a.chip,
          )}
        >
          <feature.icon className="size-5" />
        </span>
        <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">
          {t(`landing.features.${feature.id}.title`)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t(`landing.features.${feature.id}.description`)}
        </p>
        <ArrowUpRight className="absolute end-5 top-5 size-4 text-muted opacity-0 transition-all duration-300 group-hover:opacity-100" />
      </div>
    </StaggerItem>
  );
}

export function Features() {
  const { t } = useLang();
  return (
    <section id="features" className="relative scroll-mt-24 py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute start-1/2 top-0 -z-10 h-96 w-[52rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(79,70,229,0.12),transparent)] blur-3xl"
      />
      <Container>
        <SectionHeading
          eyebrow={t("landing.features.eyebrow")}
          title={t("landing.features.title")}
          description={t("landing.features.description")}
        />

        <Stagger className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}

          <StaggerItem className="h-full">
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-[#4f46e5] via-[#5b3fd6] to-[#0e7490] p-6 shadow-glow-primary transition-all duration-500 hover:-translate-y-1">
              <div
                aria-hidden
                className="absolute -end-16 -top-16 size-48 rounded-full bg-white/10 blur-2xl"
              />
              <div className="relative">
                <span className="text-sm font-medium text-indigo-200">
                  {t("landing.features.ctaEyebrow")}
                </span>
                <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-white">
                  {t("landing.features.ctaTitle")}
                </h3>
              </div>
              <div className="relative mt-6">
                <Button
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15"
                  asChild
                >
                  <a href="#pricing">
                    {t("landing.features.ctaButton")}
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  );
}
