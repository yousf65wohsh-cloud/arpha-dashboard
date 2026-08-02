"use client";

import { Crown, UserPlus, UsersRound } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { TrendAreaChart } from "@/components/dashboard/trend-area-chart";
import { CustomersList } from "@/components/dashboard/customers-list";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { CUSTOMERS, CUSTOMERS_SERIES } from "@/lib/data";
import { useLang } from "@/components/dashboard/lang-provider";

export function CustomersView() {
  const { t } = useLang();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <Stat label={t("customers.total")} value="3,421" delta="+6.9%" icon={UsersRound} accent="primary" sparkline={[12, 16, 19, 18, 23, 27, 26, 31, 35, 33, 39, 43]} />
        <Stat label={t("customers.newThisMonth")} value="214" delta="+4.2%" icon={UserPlus} accent="success" sparkline={[8, 11, 13, 12, 15, 17, 16, 19, 21, 20, 23, 25]} />
        <Stat label={t("customers.vip")} value="147" delta="+3.1%" icon={Crown} accent="warning" sparkline={[5, 6, 7, 6, 8, 9, 9, 10, 11, 11, 12, 13]} />
      </div>

      <Panel
        title={t("customers.growth")}
        subtitle={t("customers.growthSub")}
        action={<Badge variant="success">{t("customers.yoy")}</Badge>}
      >
        <TrendAreaChart data={CUSTOMERS_SERIES} height={190} prefix="" currency={false} />
      </Panel>

      <CustomersList customers={CUSTOMERS} />
    </div>
  );
}
