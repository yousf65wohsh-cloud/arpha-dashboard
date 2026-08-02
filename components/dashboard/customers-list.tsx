"use client";

import { Users } from "lucide-react";
import type { CustomerRow, CustomerStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/dashboard/panel";
import { useLang } from "@/components/dashboard/lang-provider";
import { cn, formatIQD } from "@/lib/utils";

const STATUS_KEY: Record<CustomerStatus, string> = {
  vip: "common.vip",
  active: "common.active",
  new: "common.new",
};

const STATUS_BADGE: Record<CustomerStatus, "primary" | "success" | "accent"> = {
  vip: "primary",
  active: "success",
  new: "accent",
};

const AVATAR_GRADIENTS = [
  "from-[#6366f1] to-[#4f46e5]",
  "from-[#06b6d4] to-[#0e7490]",
  "from-[#22c55e] to-[#15803d]",
  "from-[#f59e0b] to-[#b45309]",
  "from-[#ec4899] to-[#be185d]",
];

export function Avatar({ initials, index = 0, className }: { initials: string; index?: number; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-[11px] font-semibold text-white ring-2 ring-surface",
        AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function CustomersList({ customers, limit }: { customers: CustomerRow[]; limit?: number }) {
  const { t, lang } = useLang();
  const rows = limit ? customers.slice(0, limit) : customers;
  return (
    <Panel
      title={t("widgets.topCustomers")}
      subtitle={t("widgets.byLifetimeSpend")}
      titleIcon={<Users className="size-4" />}
      action={
        <button className="text-xs font-medium text-indigo-300 transition-colors hover:text-indigo-200">
          {t("common.viewAll")}
        </button>
      }
    >
      <ul className="divide-y divide-white/[0.05]">
        {rows.map((c, i) => (
          <li key={c.handle} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <Avatar initials={c.initials} index={i} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">{c.name}</p>
              <p className="text-[11px] text-muted">@{c.handle}</p>
            </div>
            <div className="hidden text-end sm:block">
              <p className="text-[13px] font-semibold tabular-nums text-foreground">
                {formatIQD(c.spend, lang)}
              </p>
              <p className="text-[11px] text-muted">
                {c.orders} {t("widgets.ordersPlural")}
              </p>
            </div>
            <Badge variant={STATUS_BADGE[c.status]}>
              {t(STATUS_KEY[c.status])}
            </Badge>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
