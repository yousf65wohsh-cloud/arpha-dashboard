"use client";

import { Clock3, CheckCircle2, ShoppingBag, XCircle } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { RoundedBarChart } from "@/components/dashboard/rounded-bar-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { ORDERS_SERIES, RECENT_ORDERS } from "@/lib/data";
import { useLang } from "@/components/dashboard/lang-provider";
import { localizeLabel } from "@/lib/i18n";

export function OrdersView() {
  const { t, lang } = useLang();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={t("orders.newOrders")} value="128" delta="+8.1%" icon={ShoppingBag} accent="primary" sparkline={[9, 12, 11, 15, 14, 18, 17, 21, 20, 24, 23, 27]} />
        <Stat label={t("common.processing")} value="36" delta="-2.4%" icon={Clock3} accent="warning" sparkline={[14, 12, 13, 10, 11, 9, 10, 8, 9, 7, 8, 6]} />
        <Stat label={t("common.completed")} value="1,210" delta="+9.6%" icon={CheckCircle2} accent="success" sparkline={[16, 19, 22, 20, 26, 28, 27, 33, 36, 34, 41, 46]} />
        <Stat label={t("common.cancelled")} value="18" delta="-1.1%" icon={XCircle} accent="danger" sparkline={[5, 4, 6, 5, 4, 6, 5, 4, 3, 4, 3, 3]} />
      </div>

      <Panel
        title={t("orders.thisWeek")}
        subtitle={t("orders.dailyVolume")}
        action={<Badge variant="accent">{t("orders.peak", { day: localizeLabel(lang, "Sat") })}</Badge>}
      >
        <RoundedBarChart data={ORDERS_SERIES} height={190} color="#6366f1" />
      </Panel>

      <RecentOrders orders={RECENT_ORDERS} />
    </div>
  );
}
