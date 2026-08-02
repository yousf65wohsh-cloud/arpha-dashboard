"use client";

import { Bot, Cpu, Coins, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/dashboard/panel";
import { useLang } from "@/components/dashboard/lang-provider";
import { cn, formatIQD, formatNumber } from "@/lib/utils";

export function AiStatus() {
  const { t, lang } = useLang();
  return (
    <Panel
      title={t("widgets.aiStatus")}
      subtitle={t("widgets.aiStatusSub")}
      titleIcon={<Bot className="size-4" />}
      action={
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
      }
    >
      <div className="space-y-3">
        {[
          { icon: Cpu, label: t("ai.model"), value: t("widgets.aiModelValue"), tone: "text-foreground" },
          { icon: Zap, label: t("widgets.aiResponseTime"), value: t("widgets.aiResponseValue"), tone: "text-emerald-300" },
          { icon: Coins, label: t("widgets.aiSpendMonth"), value: formatIQD(18200, lang), tone: "text-foreground" },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] px-3.5 py-2.5"
          >
            <span className="flex items-center gap-2.5 text-[13px] text-muted">
              <row.icon className="size-4 text-muted/80" />
              {row.label}
            </span>
            <span className={cn("text-[13px] font-medium tabular-nums", row.tone)}>
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-1 pt-1">
          <Badge variant="success">{t("widgets.botOnline")}</Badge>
          <span className="text-[11px] text-muted">
            {t("widgets.msgsToday").replace("{n}", formatNumber(2312, lang))}
          </span>
        </div>
      </div>
    </Panel>
  );
}
