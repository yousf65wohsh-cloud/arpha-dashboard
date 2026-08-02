"use client";

import Link from "next/link";
import {
  Bot,
  MessageSquareText,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { StatCard } from "@/components/shell/stat-card";
import { EmptyState, LoadingState } from "@/components/shell/states";
import { SalesChart } from "@/components/shell/sales-chart";
import { useOverviewCounts } from "@/hooks/use-orders";
import { useCustomerCount } from "@/hooks/use-customers";
import { useUsageSummary } from "@/hooks/use-usage";
import { useReport } from "@/hooks/use-report";
import { useOrders } from "@/hooks/use-orders";
import { useConversations } from "@/hooks/use-conversations";
import { useStore } from "@/hooks/use-store";
import { formatIQD, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/lib/supabase/database.types";

const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
  confirmed: "bg-sky-500/10 text-sky-500 ring-sky-500/20",
  rejected: "bg-rose-500/10 text-rose-500 ring-rose-500/20",
  delivered: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
  cancelled: "bg-muted text-muted-foreground ring-border",
};

export default function OverviewPage() {
  const { lang, t } = useLang();
  const { store } = useStore();
  const { counts, loading: countsLoading } = useOverviewCounts();
  const { count: customerCount } = useCustomerCount();
  const { summary } = useUsageSummary();
  const { report } = useReport({ granularity: "monthly" });
  const { orders } = useOrders();
  const { conversations } = useConversations();

  const revenue =
    report?.totals.revenue ?? counts.revenue ?? 0;

  return (
    <div>
      <PageHeader title={t("overview.title")} subtitle={t("overview.subtitle")} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label={t("overview.todayOrders")}
          value={formatNumber(counts.today, lang)}
          icon={ShoppingBag}
          loading={countsLoading}
        />
        <StatCard
          label={t("overview.pendingOrders")}
          value={formatNumber(counts.pending, lang)}
          icon={TrendingUp}
          loading={countsLoading}
        />
        <StatCard
          label={t("overview.revenue")}
          value={formatIQD(revenue, lang)}
          icon={TrendingUp}
          loading={countsLoading}
        />
        <StatCard
          label={t("overview.totalCustomers")}
          value={formatNumber(customerCount, lang)}
          icon={Users}
          loading={countsLoading}
        />
        <StatCard
          label={t("usage.messages")}
          value={formatNumber(summary?.messages ?? 0, lang)}
          icon={Bot}
          loading={!summary}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-foreground">{t("overview.salesChart")}</h2>
          {report ? (
            <SalesChart data={report.series.map((p) => ({ label: p.bucket, revenue: p.revenue, orders: p.orders }))} />
          ) : (
            <LoadingState />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-medium text-foreground">{t("overview.aiUsage")}</h2>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {formatNumber(summary?.tokens ?? 0, lang)}
            </p>
            <p className="text-xs text-muted-foreground">{t("usage.tokens")}</p>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">{t("overview.subscription")}</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {summary?.currentPlan?.name ?? store?.name ?? t("shell.storeName")}
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-4 w-full">
              <Link href="/dashboard/usage">{t("overview.viewAll")}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">{t("overview.topProducts")}</h2>
            <Link href="/dashboard/reports" className="text-xs text-muted-foreground hover:text-foreground">
              {t("overview.viewAll")}
            </Link>
          </div>
          {!report ? (
            <LoadingState />
          ) : report.topProducts.length === 0 ? (
            <EmptyState label={t("reports.empty")} />
          ) : (
            <ul className="space-y-3">
              {report.topProducts.slice(0, 5).map((p) => (
                <li key={p.productId} className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-foreground">{p.name}</span>
                  <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    {p.quantity} × {formatIQD(p.revenue / Math.max(p.quantity, 1), lang)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">{t("overview.latestOrders")}</h2>
            <Link href="/dashboard/orders" className="text-xs text-muted-foreground hover:text-foreground">
              {t("overview.viewAll")}
            </Link>
          </div>
          {!orders ? (
            <LoadingState />
          ) : orders.length === 0 ? (
            <EmptyState label={t("orders.empty")} />
          ) : (
            <ul className="space-y-3">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {o.customer?.name ?? t("orders.noCustomer")}
                    </p>
                    <p className="text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className={ORDER_STATUS_TONE[o.status]}>{t(`orders.status.${o.status}`)}</Badge>
                    <span className="text-sm font-medium">{formatIQD(o.total ?? 0, lang)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">{t("overview.latestConversations")}</h2>
            <Link href="/dashboard/conversations" className="text-xs text-muted-foreground hover:text-foreground">
              {t("overview.viewAll")}
            </Link>
          </div>
          {!conversations ? (
            <LoadingState />
          ) : conversations.length === 0 ? (
            <EmptyState label={t("conv.empty")} hint={t("conv.emptyHint")} />
          ) : (
            <ul className="space-y-3">
              {conversations.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MessageSquareText className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">
                        {c.customer?.name ?? t("conv.customer")}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                    </div>
                  </div>
                  {c.unreadCount > 0 ? (
                    <Badge className="bg-primary text-primary-foreground">{c.unreadCount}</Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
