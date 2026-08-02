"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  History,
  Package,
  Search,
} from "lucide-react";
import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/shell/states";
import { useOrders, useOrderStatusCounts } from "@/hooks/use-orders";
import { useOrderDetail } from "@/hooks/use-order-detail";
import { formatIQD, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrderStatus } from "@/lib/supabase/database.types";

const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "rejected", "delivered", "cancelled"];

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
  confirmed: "bg-sky-500/10 text-sky-500 ring-sky-500/20",
  rejected: "bg-rose-500/10 text-rose-500 ring-rose-500/20",
  delivered: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
  cancelled: "bg-muted text-muted-foreground ring-border",
};

export default function OrdersPage() {
  const { lang, t } = useLang();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [channel, setChannel] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { orders, loading, error } = useOrders({ status, channel, search });
  const { counts } = useOrderStatusCounts();

  const tabs = useMemo(
    () =>
      ([
        ["all", 0],
        ...ORDER_STATUSES.map((s) => [s, counts[s]] as const),
      ] as const),
    [counts],
  );

  return (
    <div>
      <PageHeader title={t("orders.title")} subtitle={t("orders.subtitle")} />

      <div className="rounded-xl border border-border bg-card p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map(([s, n]) => (
              <Button
                key={s}
                size="sm"
                variant={status === s ? "default" : "ghost"}
                className="shrink-0 text-xs"
                onClick={() => setStatus(s)}
              >
                {s === "all" ? t("common.all") : t(`orders.status.${s}`)}
                <span className="ms-1 opacity-70">{n}</span>
              </Button>
            ))}
          </div>
          <div className="ms-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 text-xs">
                  {channel === "all" ? t("common.all") : t(`orders.channel.${channel}`)}
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setChannel("all")}>{t("common.all")}</DropdownMenuItem>
                {["telegram", "web", "phone", "instore"].map((c) => (
                  <DropdownMenuItem key={c} onClick={() => setChannel(c)}>
                    {t(`orders.channel.${c}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("orders.searchPlaceholder")}
                className="w-56 ps-9"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : !orders || orders.length === 0 ? (
          <EmptyState label={t("orders.empty")} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-start font-medium">#</th>
                  <th className="px-3 py-2 text-start font-medium">{t("orders.customer")}</th>
                  <th className="px-3 py-2 text-start font-medium">{t("conv.channel")}</th>
                  <th className="px-3 py-2 text-start font-medium">{t("common.total")}</th>
                  <th className="px-3 py-2 text-start font-medium">{t("common.status")}</th>
                  <th className="px-3 py-2 text-start font-medium">{t("common.created")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/40"
                    onClick={() => setSelectedId(o.id)}
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                      #{o.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2.5 text-foreground">
                      {o.customer?.name ?? t("orders.noCustomer")}
                    </td>
                    <td className="px-3 py-2.5">{t(`orders.channel.${o.channel}`)}</td>
                    <td className="px-3 py-2.5 font-medium">{formatIQD(o.total ?? 0, lang)}</td>
                    <td className="px-3 py-2.5">
                      <Badge className={STATUS_TONE[o.status]}>{t(`orders.status.${o.status}`)}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {formatNumber(new Date(o.createdAt).getDate(), lang)}/
                      {new Date(o.createdAt).getMonth() + 1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId ? (
        <OrderDetailDialog orderId={selectedId} onClose={() => setSelectedId(null)} />
      ) : null}
    </div>
  );
}

function OrderDetailDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { lang, t } = useLang();
  const { detail, loading, error, updateStatus } = useOrderDetail(orderId);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t("orders.details")} — #{orderId.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : detail ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 p-3 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  {detail.customer?.name ?? t("orders.noCustomer")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {detail.customer?.phone ?? t("orders.noCustomer")}
                </p>
              </div>
              <Badge className={STATUS_TONE[detail.status]}>{t(`orders.status.${detail.status}`)}</Badge>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">{t("orders.items")}</h4>
              <ul className="space-y-2">
                {detail.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <Package className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground">× {item.qty}</span>
                    </div>
                    <span className="shrink-0 font-medium">{formatIQD(item.total, lang)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-sm">
                <span className="text-muted-foreground">{t("common.total")}</span>
                <span className="font-semibold">{formatIQD(detail.total ?? 0, lang)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">{t("orders.updateStatus")}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {ORDER_STATUSES.filter((s) => s !== detail.status).map((s) => (
                    <DropdownMenuItem key={s} onClick={() => void updateStatus(s)}>
                      {t(`orders.status.${s}`)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {detail.statusLog.length > 0 ? (
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <History className="size-4" /> {t("orders.history")}
                </h4>
                <ol className="space-y-2 border-s border-border ps-3">
                  {detail.statusLog.map((log) => (
                    <li key={log.id} className="relative text-xs text-muted-foreground">
                      <span className="absolute -start-[17px] top-1.5 size-1.5 rounded-full bg-primary" />
                      {t(`orders.status.${log.fromStatus as OrderStatus}`) ?? log.fromStatus}
                      {" → "}
                      {t(`orders.status.${log.toStatus as OrderStatus}`)}
                      <span className="ms-2">
                        {formatNumber(new Date(log.createdAt).getDate(), lang)}/
                        {new Date(log.createdAt).getMonth() + 1}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
