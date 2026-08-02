"use client";

import { CreditCard, Landmark, ReceiptText, TrendingUp } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { TrendAreaChart } from "@/components/dashboard/trend-area-chart";
import { RoundedBarChart } from "@/components/dashboard/rounded-bar-chart";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { ORDERS_SERIES, REVENUE_SERIES } from "@/lib/data";
import { useLang } from "@/components/dashboard/lang-provider";
import { localizeLabel } from "@/lib/i18n";
import { formatIQD } from "@/lib/utils";

const PAYMENT_METHODS = [
  { name: "COD", value: 54, color: "#4f46e5" },
  { name: "Card", value: 31, color: "#06b6d4" },
  { name: "Wallet", value: 15, color: "#22c55e" },
];

const INVOICES = [
  { label: "revenue.paid", value: 46300, tone: "text-emerald-300" },
  { label: "revenue.pending", value: 1610, tone: "text-amber-300" },
  { label: "revenue.refunded", value: 300, tone: "text-red-300" },
] as const;

export function RevenueView() {
  const { t, lang } = useLang();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={t("revenue.gross")} value={formatIQD(48210, lang)} delta="+12.4%" icon={TrendingUp} accent="primary" sparkline={[22, 27, 25, 34, 31, 40, 38, 47, 44, 52, 51, 63]} />
        <Stat label={t("revenue.net")} value={formatIQD(43980, lang)} delta="+11.8%" icon={ReceiptText} accent="success" sparkline={[20, 25, 23, 31, 29, 37, 35, 43, 41, 48, 47, 58]} />
        <Stat label={t("revenue.aov")} value={formatIQD(37600, lang)} delta="+3.2%" icon={CreditCard} accent="accent" sparkline={[31, 32, 32, 34, 33, 35, 36, 35, 37, 38, 37, 39]} />
        <Stat label={t("revenue.refunds")} value={formatIQD(300, lang)} delta="-1.1%" icon={Landmark} accent="danger" sparkline={[9, 7, 8, 6, 7, 5, 6, 5, 4, 4, 3, 3]} />
      </div>

      <Panel
        title={t("revenue.trend")}
        subtitle={t("revenue.trendSub")}
        action={<Badge variant="success">+12.4%</Badge>}
      >
        <TrendAreaChart data={REVENUE_SERIES} height={200} />
      </Panel>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title={t("revenue.performance")}
          subtitle={t("revenue.performanceSub")}
        >
          <RoundedBarChart data={ORDERS_SERIES} height={180} color="#22c55e" />
        </Panel>
        <Panel title={t("revenue.methods")} subtitle={t("revenue.methodsSub")}>
          <div className="relative">
            <DonutChart data={PAYMENT_METHODS} centerValue="54%" centerLabel={localizeLabel(lang, "COD")} height={170} />
          </div>
          <ul className="mt-2 space-y-1.5">
            {PAYMENT_METHODS.map((m) => (
              <li key={m.name} className="flex items-center gap-2 text-[12px] text-muted">
                <span className="size-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span>{localizeLabel(lang, m.name)}</span>
                <span className="ms-auto tabular-nums text-foreground">{m.value}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title={t("revenue.invoiceStatus")} subtitle={t("revenue.invoiceStatusSub")}>
        <div className="grid grid-cols-3 gap-3">
          {INVOICES.map((inv) => (
            <div key={inv.label} className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3.5 text-center">
              <p className="text-[11px] uppercase tracking-wider text-muted">{t(inv.label)}</p>
              <p className={`mt-1 text-base font-semibold tabular-nums ${inv.tone}`}>{formatIQD(inv.value, lang)}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
