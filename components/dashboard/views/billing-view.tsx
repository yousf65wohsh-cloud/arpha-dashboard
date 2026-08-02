"use client";

import { CreditCard, Gem, ReceiptText, Wallet } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INVOICES, PAYMENT_METHODS, PLANS } from "@/lib/dashboard-data";
import { useLang } from "@/components/dashboard/lang-provider";
import { formatIQD, formatIQDCompact } from "@/lib/utils";

const INVOICE_BADGE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  paid: "success",
  pending: "warning",
  overdue: "danger",
};

const STATUS_KEY: Record<string, string> = {
  paid: "billing.status.paid",
  pending: "billing.status.pending",
  overdue: "billing.status.overdue",
};

const BRAND_STYLE: Record<string, string> = {
  Visa: "from-[#2563eb] to-[#1e40af]",
  Mastercard: "from-[#ea580c] to-[#c2410c]",
};

export function BillingView() {
  const { t, lang } = useLang();
  const locale = lang === "ar" ? "ar-IQ-u-nu-latn" : "en-US";
  const current = PLANS.find((p) => p.current) ?? PLANS[1];
  const due = INVOICES.find((i) => i.status !== "paid") ?? INVOICES[0];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={t("billing.currentPlan")} value={t(current.nameKey)} delta={t("billing.businessMonth")} icon={Gem} accent="primary" />
        <Stat label={t("billing.amountDue")} value={formatIQD(due.amount * 1000, lang)} delta={t(STATUS_KEY[due.status])} icon={ReceiptText} accent="warning" />
        <Stat label={t("billing.aiSpend")} value={formatIQDCompact(18.2, lang)} delta={t("billing.withinQuota")} icon={Wallet} accent="accent" />
        <Stat label={t("billing.cardsOnFile")} value={String(PAYMENT_METHODS.length)} delta={t("billing.autoRenewOn")} icon={CreditCard} accent="success" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title={t("billing.currentPlanTitle")}
          subtitle={t(current.taglineKey)}
          titleIcon={<Gem className="size-4" />}
          action={<Badge variant="primary">{t(current.nameKey)}</Badge>}
        >
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{formatIQD(current.price * 1000, lang)}</p>
              <p className="text-[12px] text-muted">{t("billing.perMonthBilled")}</p>
            </div>
            <Button variant="outline" size="sm">
              {t("billing.comparePlans")}
            </Button>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {current.features.map((f, i) => (
              <li key={f} className="flex items-center gap-2 text-[12.5px] text-muted">
                <span className="grid size-4 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
                    <path d="M2.5 6.5 5 9l4.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {t(current.featureKeys[i])}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
              <span>{t("billing.aiTokenUsage")}</span>
              <span className="tabular-nums text-foreground">1.4M / 2M</span>
            </div>
            <Progress value={68} />
          </div>
        </Panel>

        <Panel title={t("billing.paymentMethods")} subtitle={t("billing.paymentMethodsSub")} titleIcon={<CreditCard className="size-4" />}>
          <ul className="space-y-2.5">
            {PAYMENT_METHODS.map((pm) => (
              <li
                key={pm.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white ${BRAND_STYLE[pm.brand] ?? "from-slate-500 to-slate-700"}`}
                  >
                    {pm.brand === "Visa" ? "VISA" : "MC"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground">
                      {pm.brand} ···· {pm.last4}
                    </p>
                    <p className="text-[11px] text-muted">{pm.holder}</p>
                  </div>
                  {pm.primary && <Badge variant="primary">{t("billing.primary")}</Badge>}
                </div>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-3 w-full">
            {t("billing.addPayment")}
          </Button>
        </Panel>
      </div>

      <Panel title={t("billing.invoices")} subtitle={t("billing.invoicesSub")} titleIcon={<ReceiptText className="size-4" />}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("billing.invoice")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("billing.date")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("billing.description")}</TableHead>
              <TableHead>{t("billing.amount")}</TableHead>
              <TableHead className="text-end">{t("employees.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium tabular-nums text-foreground">{inv.id}</TableCell>
                <TableCell className="hidden text-muted sm:table-cell">
                  {new Date(inv.date).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}
                </TableCell>
                <TableCell className="hidden md:table-cell">{t("billing.descMonthly")}</TableCell>
                <TableCell className="font-medium tabular-nums">{formatIQD(inv.amount * 1000, lang)}</TableCell>
                <TableCell className="text-end">
                  <Badge variant={INVOICE_BADGE[inv.status]}>
                    {t(STATUS_KEY[inv.status])}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
