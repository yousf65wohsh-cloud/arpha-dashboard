"use client";

import { FileBarChart, FileDown, FileText, RefreshCcw, TimerReset } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { REPORT_TEMPLATES, SAVED_REPORTS } from "@/lib/dashboard-data";
import { useLang } from "@/components/dashboard/lang-provider";
import { cn } from "@/lib/utils";

const INTERVAL_VARIANT: Record<string, "accent" | "primary" | "success" | "warning"> = {
  Daily: "accent",
  Weekly: "primary",
  Monthly: "success",
  Custom: "warning",
  Quarterly: "primary",
};

const INTERVAL_KEY: Record<string, string> = {
  Daily: "reports.daily",
  Weekly: "reports.weekly",
  Monthly: "reports.monthly",
  Custom: "reports.custom",
  Quarterly: "reports.quarterly",
};

export function ReportsView() {
  const { t, lang } = useLang();
  const locale = lang === "ar" ? "ar-IQ-u-nu-latn" : "en-US";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={t("reports.templates")} value={String(REPORT_TEMPLATES.length)} delta={t("reports.readyToRun")} icon={FileBarChart} accent="primary" />
        <Stat label={t("reports.generated")} value="48" delta={t("reports.thisMonth")} icon={FileText} accent="success" />
        <Stat label={t("reports.aiReports")} value="22" delta={t("reports.autoScheduled")} icon={RefreshCcw} accent="accent" />
        <Stat label={t("reports.avgDelivery")} value="~4s" delta={t("reports.fasterThanManual")} icon={TimerReset} accent="warning" />
      </div>

      <Panel title={t("reports.templatesTitle")} subtitle={t("reports.templatesSub")} titleIcon={<FileBarChart className="size-4" />}>
        <ul className="divide-y divide-white/[0.05]">
          {REPORT_TEMPLATES.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-500/12 text-indigo-300 ring-1 ring-inset ring-indigo-500/25">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{t(r.nameKey)}</p>
                <p className="truncate text-[11px] text-muted">{t(r.descKey)}</p>
              </div>
              <Badge variant={INTERVAL_VARIANT[r.interval]}>{t(INTERVAL_KEY[r.interval])}</Badge>
              <Button size="sm" variant="outline" className="hidden sm:inline-flex">
                {t("common.generate")}
              </Button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={t("reports.savedTitle")} subtitle={t("reports.savedSub")} titleIcon={<FileDown className="size-4" />}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("reports.report")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("reports.type")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("reports.generatedOn")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("reports.size")}</TableHead>
              <TableHead className="w-24 text-end">{t("reports.download")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SAVED_REPORTS.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-foreground">{t(r.nameKey)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={INTERVAL_VARIANT[r.type]}>{t(INTERVAL_KEY[r.type])}</Badge>
                </TableCell>
                <TableCell className="hidden text-muted md:table-cell">
                  {new Date(r.generated).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}
                </TableCell>
                <TableCell className="hidden text-muted md:table-cell">{r.size}</TableCell>
                <TableCell className="text-end">
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-foreground ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.09]",
                    )}
                  >
                    <FileDown className="size-3.5" />
                    {t("reports.pdf")}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
