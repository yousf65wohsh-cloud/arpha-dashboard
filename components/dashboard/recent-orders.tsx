"use client";

import { Send, ShoppingBag } from "lucide-react";
import type { OrderRow, OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/dashboard/panel";
import { useLang } from "@/components/dashboard/lang-provider";
import { timeAgo } from "@/lib/i18n";
import { cn, formatIQD } from "@/lib/utils";

const STATUS_KEYS: Record<OrderStatus, string> = {
  completed: "common.completed",
  processing: "common.processing",
  pending: "common.pending",
  cancelled: "common.cancelled",
};

const STATUS_STYLES: Record<OrderStatus, "success" | "warning" | "neutral" | "danger"> = {
  completed: "success",
  processing: "warning",
  pending: "neutral",
  cancelled: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useLang();
  return <Badge variant={STATUS_STYLES[status]}>{t(STATUS_KEYS[status])}</Badge>;
}

export function RecentOrders({ orders, limit }: { orders: OrderRow[]; limit?: number }) {
  const { t, lang } = useLang();
  const rows = limit ? orders.slice(0, limit) : orders;
  return (
    <Panel
      title={t("widgets.recentOrders")}
      subtitle={t("widgets.recentOrdersSub")}
      titleIcon={<ShoppingBag className="size-4" />}
      action={
        <button className="text-xs font-medium text-indigo-300 transition-colors hover:text-indigo-200">
          {t("common.viewAll")}
        </button>
      }
    >
      <ul className="divide-y divide-white/[0.05]">
        {rows.map((order) => (
          <li key={order.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg ring-1",
                order.channel === "telegram"
                  ? "bg-cyan-500/12 text-cyan-300 ring-cyan-500/25"
                  : "bg-white/[0.06] text-muted ring-white/10",
              )}
            >
              {order.channel === "telegram" ? (
                <Send className="size-3.5" />
              ) : (
                <ShoppingBag className="size-3.5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">
                {order.customer}
              </p>
              <p className="truncate text-[11px] text-muted">
                {order.id} · {order.items}
              </p>
            </div>
            <div className="hidden text-end sm:block">
              <p className="text-[13px] font-semibold tabular-nums text-foreground">
                {formatIQD(order.total, lang)}
              </p>
              <p className="text-[11px] text-muted">{timeAgo(lang, order.time)}</p>
            </div>
            <OrderStatusBadge status={order.status} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
