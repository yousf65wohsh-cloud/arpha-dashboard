"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/landing/section-heading";
import { Stagger, StaggerItem } from "@/components/landing/scroll-reveal";
import { useLang } from "@/components/dashboard/lang-provider";
import { PIPELINE_STEPS } from "@/lib/data";
import { cn } from "@/lib/utils";

const ACCENTS = {
  primary: { chip: "bg-indigo-500/12 text-indigo-300 ring-indigo-500/25", dot: "bg-[#6366f1]" },
  accent: { chip: "bg-cyan-500/12 text-cyan-300 ring-cyan-500/25", dot: "bg-[#06b6d4]" },
  success: { chip: "bg-emerald-500/12 text-emerald-300 ring-emerald-500/25", dot: "bg-[#22c55e]" },
  warning: { chip: "bg-amber-500/12 text-amber-300 ring-amber-500/25", dot: "bg-[#f59e0b]" },
  danger: { chip: "bg-red-500/12 text-red-300 ring-red-500/25", dot: "bg-[#ef4444]" },
} as const;

export function HowItWorks() {
  const { t } = useLang();
  return (
    <section id="how-it-works" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute start-0 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.12),transparent)] blur-3xl"
      />
      <Container>
        <SectionHeading
          eyebrow={t("landing.how.eyebrow")}
          title={t("landing.how.title")}
          description={t("landing.how.description")}
        />

        <div className="relative mt-16">
          {/* Connector line */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-[#6366f1]/0 via-[#06b6d4]/40 to-[#22c55e]/0 xl:block" />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-7 hidden size-2 rounded-full bg-[#06b6d4] shadow-[0_0_12px_2px_rgba(6,182,212,0.6)] xl:block"
            animate={{ left: ["2%", "96%", "2%"] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />

          <Stagger className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:gap-6">
            {PIPELINE_STEPS.map((step) => {
              const a = ACCENTS[step.accent];
              return (
                <StaggerItem key={step.step}>
                  <div className="group relative text-center xl:pt-20 xl:text-start">
                    {/* Node */}
                    <div className="relative z-10 mx-auto mb-5 flex size-14 items-center justify-center xl:absolute xl:start-0 xl:top-0 xl:mx-0">
                      <span
                        className={cn(
                          "grid size-14 place-items-center rounded-2xl ring-1 transition-transform duration-500 group-hover:scale-110",
                          a.chip,
                        )}
                      >
                        <step.icon className="size-6" />
                      </span>
                      <span className="absolute -end-1.5 -top-1.5 grid size-6 place-items-center rounded-full border border-white/10 bg-surface text-[10px] font-bold text-muted shadow-card">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {t(`landing.how.${step.id}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {t(`landing.how.${step.id}.description`)}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
