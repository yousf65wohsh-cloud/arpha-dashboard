"use client";

import { DollarSign, MessagesSquare, ShoppingBag, Users } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { TrendAreaChart } from "@/components/dashboard/trend-area-chart";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { AiStatus } from "@/components/dashboard/ai-status";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/dashboard/lang-provider";
import { localizeLabel } from "@/lib/i18n";
import { AI_SPEND_DONUT, RECENT_ORDERS, REVENUE_SERIES } from "@/lib/data";
import { formatIQD, formatIQDCompact, formatNumber } from "@/lib/utils";

export function OverviewView() {
  const { t, lang } = useLang();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          label={t("common.revenue")}
          value={formatIQD(48210, lang)}
          delta="+12.4%"
          icon={DollarSign}
          accent="primary"
          sparkline={[22, 27, 25, 34, 31, 40, 38, 47, 44, 52, 51, 63]}
        />
        <Stat
          label={t("nav.orders")}
          value={formatNumber(1284, lang)}
          delta="+8.1%"
          icon={ShoppingBag}
          accent="accent"
          sparkline={[18, 24, 21, 28, 33, 30, 38, 42, 39, 47, 45, 51]}
        />
        <Stat
          label={t("overview.messages")}
          value={formatNumber(8912, lang)}
          delta="+23.6%"
          icon={MessagesSquare}
          accent="success"
          sparkline={[30, 38, 42, 40, 52, 58, 55, 66, 71, 68, 79, 86]}
        />
        <Stat
          label={t("nav.customers")}
          value={formatNumber(3421, lang)}
          delta="+6.9%"
          icon={Users}
          accent="warning"
          sparkline={[14, 16, 19, 18, 23, 25, 24, 28, 30, 29, 34, 37]}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title={t("overview.revenueTitle")}
          subtitle={t("revenue.trendSub")}
          action={<Badge variant="success">+12.4% vs {t("overview.lastYear")}</Badge>}
        >
          <TrendAreaChart data={REVENUE_SERIES} height={200} compareKey="previous" />
        </Panel>
        <Panel
          title={t("overview.aiSpendTitle")}
          subtitle={`${t("common.thisMonth")} · ${formatIQD(18200, lang)}`}
        >
          <div className="relative">
            <DonutChart
              data={AI_SPEND_DONUT}
              centerValue={formatIQDCompact(18.2, lang)}
              centerLabel={t("overview.spent")}
              height={180}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {AI_SPEND_DONUT.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                {localizeLabel(lang, s.name)} {s.value}%
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrders orders={RECENT_ORDERS} limit={4} />
        </div>
        <AiStatus />
      </div>
    </div>
  );
}
