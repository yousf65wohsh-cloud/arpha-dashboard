"use client";

import { Bot, BrainCircuit, Coins, MessageSquareText } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { AiGauge } from "@/components/dashboard/ai-gauge";
import { RoundedBarChart } from "@/components/dashboard/rounded-bar-chart";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { AI_SPEND_DONUT, AI_SPEND_SERIES } from "@/lib/data";
import { useLang } from "@/components/dashboard/lang-provider";
import { localizeLabel } from "@/lib/i18n";
import { formatIQD, formatIQDCompact, formatNumber } from "@/lib/utils";

export function AiUsageView() {
  const { t, lang } = useLang();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={t("usage.msgsAnswered")} value={formatNumber(8912, lang)} delta="+23.6%" icon={MessageSquareText} accent="accent" sparkline={[30, 38, 42, 40, 52, 58, 55, 66, 71, 68, 79, 86]} />
        <Stat label={t("usage.tokensConsumed")} value="1.4M" delta="+18.9%" icon={BrainCircuit} accent="primary" sparkline={[22, 28, 31, 34, 40, 44, 47, 52, 56, 60, 65, 71]} />
        <Stat label={t("usage.aiSpend")} value={formatIQD(18200, lang)} delta="+9.4%" icon={Coins} accent="warning" sparkline={[8, 11, 10, 13, 15, 14, 16, 18, 17, 19, 18, 21]} />
        <Stat label={t("usage.activeAgents")} value="3 / 3" delta="100%" icon={Bot} accent="success" sparkline={[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title={t("usage.weeklyTitle")}
          subtitle={t("usage.weeklySub")}
          action={<Badge variant="primary">{t("common.fine")}</Badge>}
        >
          <RoundedBarChart data={AI_SPEND_SERIES} height={180} color="#06b6d4" />
        </Panel>
        <Panel title={t("widgets.monthlyQuota")} subtitle={t("usage.quotaSub")}>
          <AiGauge value={68} label="68%" sublabel={t("usage.used")} className="mx-auto size-40" />
        </Panel>
      </div>

      <Panel title={t("usage.spendByAgent")} subtitle={t("common.thisMonth")}>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="relative w-full max-w-52 shrink-0">
            <DonutChart data={AI_SPEND_DONUT} centerValue={formatIQDCompact(18.2, lang)} centerLabel={t("usage.total")} height={170} />
          </div>
          <ul className="w-full space-y-2">
            {AI_SPEND_DONUT.map((s) => (
              <li key={s.name} className="flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3.5 py-2.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[13px] text-muted">{localizeLabel(lang, s.name)}</span>
                <span className="ms-auto text-[13px] font-medium tabular-nums text-foreground">
                  {formatIQDCompact(18.2 * (s.value / 100), lang)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
