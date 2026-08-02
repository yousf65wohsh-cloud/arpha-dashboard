import { cn } from "@/lib/utils";

interface AiGaugeProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  trackClassName?: string;
}

export function AiGauge({
  value,
  max = 100,
  label = "68%",
  sublabel = "Monthly quota",
  className,
  trackClassName,
}: AiGaugeProps) {
  const radius = 56;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(value / max, 1));

  return (
    <div className={cn("relative grid place-items-center", className)}>
      <svg viewBox="0 0 140 140" className="size-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={cn("stroke-white/[0.06]", trackClassName)}
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="url(#ai-gauge-gradient)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ai-gauge-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="55%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {label}
        </span>
        <span className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
          {sublabel}
        </span>
      </div>
    </div>
  );
}
