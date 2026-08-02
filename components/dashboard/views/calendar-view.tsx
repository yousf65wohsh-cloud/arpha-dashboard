"use client";

import { ListTodo, Sparkles, Truck } from "lucide-react";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { CALENDAR_EVENTS } from "@/lib/data";
import { useLang } from "@/components/dashboard/lang-provider";

const UPCOMING = [
  { date: new Date(2026, 7, 3), key: "calendar.ev1", type: "order" as const },
  { date: new Date(2026, 7, 5), key: "calendar.ev2", type: "delivery" as const },
  { date: new Date(2026, 7, 8), key: "calendar.ev3", type: "ai" as const },
  { date: new Date(2026, 7, 12), key: "calendar.ev4", type: "delivery" as const },
  { date: new Date(2026, 7, 14), key: "calendar.ev5", type: "order" as const },
  { date: new Date(2026, 7, 19), key: "calendar.ev6", type: "ai" as const },
];

const TYPE_ICON = {
  delivery: { icon: Truck, cls: "bg-cyan-500/12 text-cyan-300 ring-cyan-500/25" },
  order: { icon: ListTodo, cls: "bg-indigo-500/12 text-indigo-300 ring-indigo-500/25" },
  ai: { icon: Sparkles, cls: "bg-emerald-500/12 text-emerald-300 ring-emerald-500/25" },
} as const;

export function CalendarView() {
  const { t, lang } = useLang();
  const locale = lang === "ar" ? "ar-IQ-u-nu-latn" : "en-US";
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <MiniCalendar events={CALENDAR_EVENTS} />
      </div>
      <Panel
        title={t("calendar.upcoming")}
        subtitle={t("calendar.upcomingSub")}
        action={<Badge variant="accent">{`5 ${t("calendar.thisWeek")}`}</Badge>}
      >
        <ul className="space-y-1">
          {UPCOMING.map((ev) => {
            const meta = TYPE_ICON[ev.type];
            return (
              <li
                key={ev.key}
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-300 hover:bg-white/[0.03]"
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg ring-1 ${meta.cls}`}>
                  <meta.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">{t(ev.key)}</p>
                  <p className="text-[11px] text-muted">{ev.date.toLocaleDateString(locale, { month: "short", day: "numeric" })}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
