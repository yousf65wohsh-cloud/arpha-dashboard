"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { PricingTier } from "@/types";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/landing/section-heading";
import { Stagger, StaggerItem } from "@/components/landing/scroll-reveal";
import { useLang } from "@/components/dashboard/lang-provider";
import { PRICING_TIERS } from "@/lib/data";
import { formatIQD } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

function PricingCard({ tier, billing }: { tier: PricingTier; billing: Billing }) {
  const { t, lang } = useLang();
  const price = billing === "monthly" ? tier.priceMonthly : tier.priceYearly;
  return (
    <StaggerItem className="h-full">
      <div
        className={cn(
          "relative flex h-full flex-col rounded-3xl p-7 transition-all duration-500",
          tier.highlighted
            ? "border border-primary/40 bg-gradient-to-b from-[#4f46e5]/20 via-surface/90 to-surface/90 shadow-glow-primary lg:-translate-y-3"
            : "border border-white/[0.07] bg-surface/60 backdrop-blur-sm hover:border-white/[0.14] hover:bg-surface",
        )}
      >
        {tier.highlighted && (
          <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-glow-primary rtl:translate-x-1/2">
            <Sparkles className="size-3" />
            {t("landing.pricing.mostPopular")}
          </span>
        )}

        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {t(`landing.pricing.${tier.id}.name`)}
          </h3>
          <p className="mt-1.5 text-sm text-muted">
            {t(`landing.pricing.${tier.id}.tagline`)}
          </p>
        </div>

        <div className="mt-6 flex items-end gap-1.5">
          <div className="relative h-14 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={billing}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -22, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="block text-5xl font-semibold tabular-nums tracking-tight text-foreground"
              >
                {formatIQD(price, lang)}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="pb-1.5 text-sm text-muted">
            {t("landing.pricing.perMonth")}
            {billing === "yearly" ? ` · ${t("landing.pricing.billedYearly")}` : ""}
          </span>
        </div>

        <ul className="mt-7 flex flex-1 flex-col gap-3">
          {Array.from({ length: tier.featureCount }).map((_, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
              <span
                className={cn(
                  "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full",
                  tier.highlighted
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-white/[0.07] text-muted",
                )}
              >
                <Check className="size-3" />
              </span>
              {t(`landing.pricing.${tier.id}.f${i + 1}`)}
            </li>
          ))}
        </ul>

        <Button
          size="lg"
          className="mt-8 w-full"
          variant={tier.highlighted ? "default" : "outline"}
          asChild
        >
          <a href="#">
            {t(`landing.pricing.${tier.id}.cta`)}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </a>
        </Button>
      </div>
    </StaggerItem>
  );
}

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const { t } = useLang();

  return (
    <section id="pricing" className="relative scroll-mt-24 py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute start-1/2 top-24 -z-10 h-96 w-[56rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(79,70,229,0.14),transparent)] blur-3xl"
      />
      <Container>
        <SectionHeading
          eyebrow={t("landing.pricing.eyebrow")}
          title={t("landing.pricing.title")}
          description={t("landing.pricing.description")}
        />

        <div className="mt-12 flex justify-center">
          <div className="relative flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-md">
            {(["monthly", "yearly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBilling(option)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-[13px] font-medium transition-colors duration-300",
                  billing === option ? "text-white" : "text-muted hover:text-foreground",
                )}
              >
                {billing === option && (
                  <motion.span
                    layoutId="billing-pill"
                    transition={{ type: "spring", stiffness: 350, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-[#6366f1] to-[#4f46e5]"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {t(`landing.pricing.${option}`)}
                  {option === "yearly" && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        billing === "yearly"
                          ? "bg-white/20 text-white"
                          : "bg-emerald-500/15 text-emerald-300",
                      )}
                    >
                      -20%
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Stagger className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-5">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} billing={billing} />
          ))}
        </Stagger>

        <p className="mt-10 text-center text-sm text-muted">
          {t("landing.pricing.note")}
        </p>
      </Container>
    </section>
  );
}
