"use client";

import { Bell } from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import { useLang } from "@/components/dashboard/lang-provider";
import { timeAgo } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TONE_DOT = {
  primary: "bg-[#6366f1]",
  success: "bg-[#22c55e]",
  warning: "bg-[#f59e0b]",
  accent: "bg-[#06b6d4]",
} as const;

interface NotificationItem {
  title: string;
  detail: string;
  time: string;
  tone: keyof typeof TONE_DOT;
}

export function Notifications({ items }: { items: NotificationItem[] }) {
  const { t, lang } = useLang();
  return (
    <Panel
      title={t("widgets.notifications")}
      subtitle={t("widgets.notificationsSub")}
      titleIcon={<Bell className="size-4" />}
      action={
        <span className="grid size-5 place-items-center rounded-full bg-indigo-500/15 text-[10px] font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/25">
          4
        </span>
      }
    >
      <ul className="space-y-1">
        {items.map((n, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-xl px-2 py-2 transition-colors duration-300 hover:bg-white/[0.03]"
          >
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                TONE_DOT[n.tone],
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-foreground">{n.title}</p>
              <p className="truncate text-[11px] text-muted">{n.detail}</p>
            </div>
            <span className="shrink-0 text-[11px] text-muted/70">
              {timeAgo(lang, n.time)}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
