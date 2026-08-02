"use client";

import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/shell/states";
import { SalesChart } from "@/components/shell/sales-chart";
import { useUsageSummary, useUsageMonthly } from "@/hooks/use-usage";
import { formatIQD, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function UsagePage() {
  const { lang, t } = useLang();
  const { summary, loading, error } = useUsageSummary();
  const { series } = useUsageMonthly(6);

  const chartData = series.map((s) => ({ label: s.month, revenue: s.cost, orders: s.messages }));

  return (
    <div>
      <PageHeader title={t("usage.title")} subtitle={t("usage.subtitle")} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : summary ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <TotalTile label={t("usage.messages")} value={formatNumber(summary.messages, lang)} />
            <TotalTile label={t("usage.tokens")} value={formatNumber(summary.tokens, lang)} />
            <TotalTile label={t("usage.cost")} value={formatIQD(summary.estimatedCost, lang)} />
            <TotalTile
              label={t("usage.plan")}
              value={summary.currentPlan?.name ?? t("usage.planUnknown")}
            />
          </div>

          {summary.usagePercent != null ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t("usage.monthly")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatNumber(summary.usagePercent, lang)}% {t("usage.used")}
                  </span>
                  {summary.currentPlan?.tokenLimit ? (
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(summary.currentPlan.tokenLimit, lang)}
                    </span>
                  ) : null}
                </div>
                <Progress value={Math.min(summary.usagePercent, 100)} className="mt-2" />
              </CardContent>
            </Card>
          ) : null}

          {series.length === 0 ? (
            <EmptyState label={t("usage.empty")} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t("usage.monthly")}</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart data={chartData} />
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}

function TotalTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
