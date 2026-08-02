"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Send, ShoppingBag, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Aurora, Grid } from "@/components/landing/backgrounds";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OverviewView } from "@/components/dashboard/views/overview-view";
import { Avatar } from "@/components/dashboard/customers-list";
import { useLang } from "@/components/dashboard/lang-provider";
import { SIDEBAR_NAV } from "@/lib/data";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function FloatingCard({
  className,
  children,
  float = "animate-float",
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  float?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={cn("absolute z-20 hidden lg:block", className)}
    >
      <div className={cn(reduce ? "" : float)}>{children}</div>
    </motion.div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const { t } = useLang();

  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-40 lg:pb-32">
      <Aurora />
      <Grid className="mask-radial-fade" />

      <Container className="relative">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pe-4 ps-1.5 text-xs font-medium text-muted backdrop-blur-md transition-colors duration-300 hover:border-primary/40 hover:text-foreground"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4] px-2.5 py-1 text-[11px] font-semibold text-white">
                <Sparkles className="size-3" />
                {t("landing.hero.badgeNew")}
              </span>
              {t("landing.hero.badgeText")}
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </a>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            className="mt-8 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            {t("landing.hero.title")}
            <br className="hidden sm:block" /> {t("landing.hero.titleFor")}{" "}
            <span className="text-gradient">{t("landing.hero.titleAccent")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
            className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg"
          >
            {t("landing.hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
            className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
          >
            <Button size="xl" className="w-full sm:w-auto" asChild>
              <a href="#pricing">
                {t("landing.hero.ctaPrimary")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </a>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <a href="#dashboard">
                <Play className="size-4 fill-current" />
                {t("landing.hero.ctaSecondary")}
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.36 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          >
            <div className="flex -space-x-2.5 rtl:space-x-reverse">
              <Avatar initials="NA" index={0} />
              <Avatar initials="OS" index={1} />
              <Avatar initials="HK" index={2} />
              <Avatar initials="MR" index={3} />
              <Avatar initials="LI" index={4} />
            </div>
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <span className="flex items-center gap-1 text-xs text-amber-300">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </span>
              <p className="text-xs text-muted">
                {t("landing.hero.trusted").replace("{n}", "2,000+")}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Dashboard preview */}
        <motion.div
          id="dashboard"
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
          className="relative mx-auto mt-20 max-w-6xl sm:mt-28"
        >
          <div
            aria-hidden
            className="absolute -inset-x-8 -top-10 -z-10 h-72 rounded-full bg-[radial-gradient(closest-side,rgba(79,70,229,0.32),transparent)] blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 start-1/3 -z-10 h-64 w-2/3 rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.22),transparent)] blur-3xl"
          />

          <FloatingCard
            className="-start-24 top-16 xl:-start-32"
            delay={0.7}
            float="animate-float"
          >
            <div className="w-64 rounded-2xl border border-white/10 bg-[#0d1017]/90 p-3.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-cyan-500/15 text-cyan-300">
                  <Send className="size-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Noor Al-Amiri</p>
                  <p className="text-[10px] text-muted">{t("landing.hero.floatViaTelegram")}</p>
                </div>
                <span className="ms-auto flex items-center gap-1 text-[10px] text-emerald-300">
                  <CheckCheck className="size-3" /> {t("landing.hero.floatAiHandled")}
                </span>
              </div>
              <div className="space-y-2">
                <div className="ms-auto w-fit max-w-[85%] rounded-xl rounded-tr-sm bg-[#1e2a4a] px-3 py-1.5 text-[11px] text-indigo-100">
                  {t("landing.hero.floatMsg1")}
                </div>
                <div className="w-fit max-w-[85%] rounded-xl rounded-tl-sm bg-white/[0.06] px-3 py-1.5 text-[11px] text-foreground">
                  {t("landing.hero.floatMsg2")}
                </div>
                <div className="ms-auto w-fit rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                  ✓ {t("landing.hero.floatOrderCreated")}
                </div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="-end-20 bottom-24 xl:-end-28"
            delay={0.85}
            float="animate-float-delayed"
          >
            <div className="w-60 rounded-2xl border border-white/10 bg-[#0d1017]/90 p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white shadow-glow-primary">
                  <ShoppingBag className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t("landing.hero.floatNewOrder")}</p>
                  <p className="text-[10px] text-muted">AR-2841 · 2 items</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2">
                <span className="text-[11px] text-muted">{t("landing.hero.floatTotal")}</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">68,000 د.ع</span>
              </div>
              <Badge variant="success" className="mt-2.5 w-full justify-center">
                {t("landing.hero.floatRevenue")}
              </Badge>
            </div>
          </FloatingCard>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1 }}
          >
            <DashboardShell
              url="app.arpha.ai/overview"
              viewTitle={t("landing.hero.overviewTitle")}
              items={SIDEBAR_NAV}
            >
              <OverviewView />
            </DashboardShell>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
