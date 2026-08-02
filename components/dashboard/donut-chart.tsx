"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DonutSlice } from "@/types";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";

interface DonutChartProps {
  data: DonutSlice[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
  className?: string;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 200,
  className,
}: DonutChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip suffix="%" />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={3}
            stroke="none"
            cornerRadius={4}
          >
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[11px] uppercase tracking-wider text-muted">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
