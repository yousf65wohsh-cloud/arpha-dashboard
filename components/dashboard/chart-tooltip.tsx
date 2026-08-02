"use client";

import { useLang } from "@/components/dashboard/lang-provider";
import { localizeLabel } from "@/lib/i18n";
import { formatCompact, formatIQDCompact } from "@/lib/utils";

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  prefix?: string;
  suffix?: string;
  currency?: boolean;
}

export function ChartTooltip({
  active,
  payload,
  label,
  prefix = "",
  suffix = "",
  currency = false,
}: ChartTooltipProps) {
  const { lang } = useLang();
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0d14]/95 px-3.5 py-2.5 shadow-card backdrop-blur-md">
      {label !== undefined && (
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
          {localizeLabel(lang, String(label))}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => {
          const value =
            typeof entry.value === "number" ? entry.value : Number(entry.value);
          const name = entry.name ? localizeLabel(lang, entry.name) : entry.dataKey;
          return (
            <div
              key={`${entry.dataKey ?? i}-${i}`}
              className="flex items-center justify-between gap-6"
            >
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {name}
              </span>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {currency
                  ? formatIQDCompact(value, lang)
                  : `${prefix}${formatCompact(value, lang)}${suffix}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
