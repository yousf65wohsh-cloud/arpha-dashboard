"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/types";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { useLang } from "@/components/dashboard/lang-provider";

interface RoundedBarChartProps {
  data: ChartPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
  radius?: number;
  prefix?: string;
  className?: string;
}

export function RoundedBarChart({
  data,
  dataKey = "value",
  color = "#6366f1",
  height = 220,
  radius = 5,
  prefix = "",
  className,
}: RoundedBarChartProps) {
  const { t } = useLang();
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
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
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={30}
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          <Tooltip
            content={<ChartTooltip prefix={prefix} />}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar
            dataKey={dataKey}
            name={t("chart.value")}
            fill={color}
            radius={[radius, radius, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
