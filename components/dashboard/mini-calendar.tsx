"use client";

import { CalendarDays } from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import { useLang } from "@/components/dashboard/lang-provider";
import { localizeLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const TYPE_DOT = {
  delivery: "bg-[#06b6d4]",
  order: "bg-[#4f46e5]",
  ai: "bg-[#22c55e]",
} as const;

interface MiniCalendarProps {
  events: Record<string, { title: string; type: "delivery" | "order" | "ai" }>;
}

function buildGrid(year: number, month: number, today: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return { cells, today };
}

export function MiniCalendar({ events }: MiniCalendarProps) {
  const { t, lang } = useLang();
  const year = 2026;
  const month = 7; // August
  const { cells, today } = buildGrid(year, month, 4);
  const label = new Date(year, month, 1).toLocaleDateString(
    lang === "ar" ? "ar-IQ-u-nu-latn" : "en-US",
    { month: "long", year: "numeric" },
  );

  return (
    <Panel
      title={label}
      subtitle={t("widgets.salesOps")}
      titleIcon={<CalendarDays className="size-4" />}
      action={
        <div className="flex gap-2">
          <button className="grid size-6 place-items-center rounded-md bg-white/[0.05] text-muted transition-colors hover:text-foreground">
            ‹
          </button>
          <button className="grid size-6 place-items-center rounded-md bg-white/[0.05] text-muted transition-colors hover:text-foreground">
            ›
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 text-[10px] font-medium uppercase tracking-wider text-muted">
            {localizeLabel(lang, d)}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const ev = events[key];
          return (
            <div
              key={key}
              className={cn(
                "relative mx-auto grid size-8 place-items-center rounded-lg text-[11px] tabular-nums",
                day === today
                  ? "bg-gradient-to-b from-[#6366f1] to-[#4f46e5] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(79,70,229,0.7)]"
                  : ev
                    ? "bg-white/[0.04] text-foreground"
                    : "text-muted",
              )}
            >
              {day}
              {ev && (
                <span
                  className={cn(
                    "absolute bottom-1 size-1 rounded-full",
                    TYPE_DOT[ev.type],
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.05] pt-3">
        <span className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="size-1.5 rounded-full bg-[#4f46e5]" /> {t("widgets.legendOrders")}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="size-1.5 rounded-full bg-[#06b6d4]" /> {t("widgets.legendDeliveries")}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="size-1.5 rounded-full bg-[#22c55e]" /> {t("widgets.legendAiEvents")}
        </span>
      </div>
    </Panel>
  );
}
