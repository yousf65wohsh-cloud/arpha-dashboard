"use client";

import { useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DashboardViewId } from "@/types";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/scroll-reveal";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OverviewView } from "@/components/dashboard/views/overview-view";
import { OrdersView } from "@/components/dashboard/views/orders-view";
import { AnalyticsView } from "@/components/dashboard/views/analytics-view";
import { CustomersView } from "@/components/dashboard/views/customers-view";
import { AiUsageView } from "@/components/dashboard/views/ai-usage-view";
import { RevenueView } from "@/components/dashboard/views/revenue-view";
import { CalendarView } from "@/components/dashboard/views/calendar-view";
import { DASHBOARD_VIEWS, SIDEBAR_NAV } from "@/lib/data";
import { useLang } from "@/components/dashboard/lang-provider";
import { cn } from "@/lib/utils";

const VIEWS: Record<DashboardViewId, ComponentType> = {
  overview: OverviewView,
  orders: OrdersView,
  analytics: AnalyticsView,
  customers: CustomersView,
  "ai-usage": AiUsageView,
  revenue: RevenueView,
  calendar: CalendarView,
};

export function DashboardShowcase() {
  const [active, setActive] = useState<DashboardViewId>("overview");
  const { t } = useLang();
  const meta = DASHBOARD_VIEWS.find((v) => v.id === active) ?? DASHBOARD_VIEWS[0];
  const ActiveView = VIEWS[active];

  return (
    <section id="dashboard-preview" className="relative scroll-mt-24 py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute start-1/2 top-1/3 -z-10 h-[30rem] w-[60rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.1),transparent)] blur-3xl"
      />
      <Container>
        <SectionHeading
          eyebrow={t("landing.showcase.eyebrow")}
          title={t("landing.showcase.title")}
          description={t("landing.showcase.description")}
        />

        <Reveal className="mt-14">
          <div className="hide-scrollbar -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="mx-auto flex w-max items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-md">
              {DASHBOARD_VIEWS.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActive(view.id)}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-colors duration-300 sm:px-4",
                    active === view.id
                      ? "text-white"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {active === view.id && (
                    <motion.span
                      layoutId="view-pill"
                      transition={{ type: "spring", stiffness: 350, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-b from-[#6366f1] to-[#4f46e5] shadow-[0_8px_24px_-8px_rgba(79,70,229,0.8)]"
                    />
                  )}
                  <span className="relative z-10">{t(view.label)}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="relative mx-auto max-w-6xl">
            <div
              aria-hidden
              className="absolute -inset-x-10 -top-8 -z-10 h-64 rounded-full bg-[radial-gradient(closest-side,rgba(79,70,229,0.2),transparent)] blur-3xl"
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <DashboardShell url={meta.url} viewTitle={t(meta.label)} items={SIDEBAR_NAV}>
                  <ActiveView />
                </DashboardShell>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
