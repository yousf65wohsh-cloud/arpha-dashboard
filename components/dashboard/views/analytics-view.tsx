"use client";

import { Eye, MousePointerClick, Timer, TrendingUp } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { TrendAreaChart } from "@/components/dashboard/trend-area-chart";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { TopProducts } from "@/components/dashboard/top-products";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { CHANNEL_DONUT, TOP_PRODUCTS, TRAFFIC_SERIES } from "@/lib/data";
import { useLang } from "@/components/dashboard/lang-provider";
import { localizeLabel } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";

export function AnalyticsView() {
  const { t, lang } = useLang();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={t("analytics.pageViews")} value={formatNumber(42816, lang)} delta="+18.2%" icon={Eye} accent="primary" sparkline={[20, 26, 24, 31, 38, 36, 44, 49, 47, 55, 60, 66]} />
        <Stat label={t("analytics.conversion")} value="3.9%" delta="+0.8%" icon={MousePointerClick} accent="success" sparkline={[2.6, 2.8, 3.0, 2.9, 3.2, 3.4, 3.3, 3.6, 3.8, 3.7, 3.9, 4.1]} />
        <Stat label={t("analytics.avgSession")} value="4m 12s" delta="+0.4%" icon={Timer} accent="accent" sparkline={[3.1, 3.4, 3.3, 3.6, 3.8, 3.7, 3.9, 4.0, 3.8, 4.2, 4.1, 4.4]} />
        <Stat label={t("analytics.repeatRate")} value="62%" delta="+5.1%" icon={TrendingUp} accent="warning" sparkline={[48, 51, 50, 53, 55, 54, 57, 58, 57, 60, 61, 62]} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title={t("analytics.trafficTitle")}
          subtitle={t("analytics.trafficSub")}
          action={<Badge variant="success">{t("common.live")}</Badge>}
        >
          <TrendAreaChart data={TRAFFIC_SERIES} height={190} prefix="" currency={false} />
        </Panel>
        <Panel title={t("analytics.channelMix")} subtitle={t("analytics.channelSub")}>
          <div className="relative">
            <DonutChart data={CHANNEL_DONUT} centerValue="62%" centerLabel={localizeLabel(lang, "Telegram")} height={180} />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {CHANNEL_DONUT.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                {localizeLabel(lang, s.name)}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <TopProducts products={TOP_PRODUCTS} />
    </div>
  );
}
