"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/types";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { useLang } from "@/components/dashboard/lang-provider";
import { formatCompact } from "@/lib/utils";

interface TrendAreaChartProps {
  data: ChartPoint[];
  dataKey?: string;
  compareKey?: string;
  color?: string;
  compareColor?: string;
  height?: number;
  prefix?: string;
  yTicks?: boolean;
  className?: string;
  currency?: boolean;
}

export function TrendAreaChart({
  data,
  dataKey = "value",
  compareKey,
  color = "#6366f1",
  compareColor = "#06b6d4",
  height = 220,
  prefix,
  yTicks = true,
  className,
  currency = true,
}: TrendAreaChartProps) {
  const { t, lang } = useLang();
  const effPrefix = prefix ?? (currency ? "" : "");
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`area-${dataKey}-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            dy={8}
            interval="preserveStartEnd"
          />
          {yTicks && (
            <YAxis
              axisLine={false}
              tickLine={false}
              width={34}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={(v: number) =>
                currency ? formatCompact(v, lang) : `${effPrefix}${v}`
              }
            />
          )}
          <Tooltip
            content={<ChartTooltip prefix={effPrefix} currency={currency} />}
            cursor={{ stroke: "rgba(255,255,255,0.14)", strokeWidth: 1 }}
          />
          {compareKey && (
            <Area
              type="monotone"
              dataKey={compareKey}
              name={t("common.prev")}
              stroke={compareColor}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
              dot={false}
              activeDot={{ r: 3 }}
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            name={t("common.thisMonth")}
            stroke={color}
            strokeWidth={2.2}
            fill={`url(#area-${dataKey}-${color.slice(1)})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#09090b" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
