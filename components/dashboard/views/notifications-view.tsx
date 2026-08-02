"use client";

import { useState } from "react";
import { AlertTriangle, Bell, CheckCheck, CreditCard, Settings2, Sparkles, ShoppingBag, type LucideIcon } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NOTIFICATIONS } from "@/lib/dashboard-data";
import type { AppNotification } from "@/types/dashboard";
import { useLang } from "@/components/dashboard/lang-provider";
import { timeAgo } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TONE: Record<AppNotification["type"], { icon: LucideIcon; cls: string }> = {
  order: { icon: ShoppingBag, cls: "bg-indigo-500/12 text-indigo-300 ring-indigo-500/25" },
  ai: { icon: Sparkles, cls: "bg-emerald-500/12 text-emerald-300 ring-emerald-500/25" },
  billing: { icon: CreditCard, cls: "bg-cyan-500/12 text-cyan-300 ring-cyan-500/25" },
  alert: { icon: AlertTriangle, cls: "bg-amber-500/12 text-amber-300 ring-amber-500/25" },
  system: { icon: Settings2, cls: "bg-white/[0.06] text-muted ring-white/10" },
};

const GROUPS = [
  { key: "Today", label: "notifications.groups.today" },
  { key: "Yesterday", label: "notifications.groups.yesterday" },
  { key: "Earlier", label: "notifications.groups.earlier" },
] as const;

export function NotificationsView() {
  const { t, lang } = useLang();
  const [items, setItems] = useState<AppNotification[]>(NOTIFICATIONS);

  const unread = items.filter((n) => !n.read).length;
  const today = items.filter((n) => n.date === "Today").length;

  const toggleRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <Stat label={t("notifications.stats.unread")} value={String(unread)} delta={t("notifications.stats.needsAttention")} icon={Bell} accent="primary" />
        <Stat label={t("notifications.stats.today")} value={String(today)} delta={t("notifications.stats.newActivity")} icon={Sparkles} accent="accent" />
        <Stat label={t("notifications.stats.total")} value={String(items.length)} delta={t("notifications.stats.allTime")} icon={CheckCheck} accent="success" />
      </div>

      <Panel
        title={t("notifications.title")}
        subtitle={t("notifications.subtitle")}
        titleIcon={<Bell className="size-4" />}
        action={
          unread > 0 ? (
            <Button size="sm" variant="outline" onClick={markAll}>
              <CheckCheck className="size-3.5" />
              {t("notifications.markAll")}
            </Button>
          ) : (
            <Badge variant="success">{t("notifications.allCaughtUp")}</Badge>
          )
        }
      >
        {GROUPS.map((group) => {
          const groupItems = items.filter((n) => n.date === group.key);
          if (groupItems.length === 0) return null;
          return (
            <div key={group.key} className="mb-4 last:mb-0">
              <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/60">
                {t(group.label)}
              </p>
              <ul className="space-y-1">
                {groupItems.map((n) => {
                  const tone = TONE[n.type];
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => toggleRead(n.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-start transition-colors hover:bg-white/[0.03]",
                          !n.read && "bg-indigo-500/[0.04]",
                        )}
                      >
                        <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ring-1", tone.cls)}>
                          <tone.icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-[13px] font-medium text-foreground">{t(n.titleKey, n.titleArgs)}</span>
                            {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-indigo-400" />}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] text-muted">{t(n.detailKey, n.detailArgs)}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-muted/70">{timeAgo(lang, n.time)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}
