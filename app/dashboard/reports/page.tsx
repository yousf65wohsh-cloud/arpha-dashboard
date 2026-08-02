"use client";

import { useState } from "react";
import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/shell/states";
import { SalesChart, ProductBars } from "@/components/shell/sales-chart";
import { useReport } from "@/hooks/use-report";
import { formatIQD, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportGranularity } from "@/types/domain";

const GRANULARITIES: ReportGranularity[] = ["daily", "weekly", "monthly", "yearly"];

export default function ReportsPage() {
  const { lang, t } = useLang();
  const [granularity, setGranularity] = useState<ReportGranularity>("monthly");

  const { report, loading, error } = useReport({ granularity });

  const chartData = (report?.series ?? []).map((p) => ({
    label: p.bucket,
    revenue: p.revenue,
    orders: p.orders,
  }));

  const totals = report?.totals ?? { revenue: 0, orders: 0, customers: 0, cancelledOrders: 0, conversion: 0 };

  return (
    <div>
      <PageHeader title={t("reports.title")} subtitle={t("reports.subtitle")} />

      <div className="mb-4 flex items-center gap-1">
        {GRANULARITIES.map((g) => (
          <Button
            key={g}
            size="sm"
            variant={granularity === g ? "default" : "ghost"}
            className="text-xs"
            onClick={() => setGranularity(g)}
          >
            {t(`reports.g.${g}`)}
          </Button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : !report || report.series.length === 0 ? (
        <EmptyState label={t("reports.empty")} />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <TotalTile label={t("reports.revenue")} value={formatIQD(totals.revenue, lang)} />
            <TotalTile label={t("reports.orders")} value={formatNumber(totals.orders, lang)} />
            <TotalTile label={t("reports.customers")} value={formatNumber(totals.customers, lang)} />
            <TotalTile
              label={t("reports.conversion")}
              value={`${formatNumber(totals.conversion, lang)}%`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {t("reports.revenue")} · {t(`reports.g.${granularity}`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart data={chartData} />
            </CardContent>
          </Card>

          {report.topProducts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t("reports.topProducts")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductBars
                  data={report.topProducts
                    .slice(0, 6)
                    .map((p) => ({ name: p.name, value: p.revenue }))}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}

function TotalTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
