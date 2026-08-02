import { cn } from "@/lib/utils";

interface GlowProps {
  className?: string;
  color?: "primary" | "accent" | "success" | "violet";
  animate?: boolean;
  size?: "sm" | "md" | "lg";
}

const GLOW_COLORS = {
  primary: "bg-[radial-gradient(closest-side,rgba(79,70,229,0.55),transparent)]",
  accent: "bg-[radial-gradient(closest-side,rgba(6,182,212,0.45),transparent)]",
  success: "bg-[radial-gradient(closest-side,rgba(34,197,94,0.4),transparent)]",
  violet: "bg-[radial-gradient(closest-side,rgba(124,58,237,0.5),transparent)]",
} as const;

const GLOW_SIZES = {
  sm: "size-64",
  md: "size-[26rem]",
  lg: "size-[38rem]",
} as const;

export function Glow({ className, color = "primary", animate, size = "lg" }: GlowProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full blur-3xl",
        GLOW_COLORS[color],
        GLOW_SIZES[size],
        animate && "animate-aurora",
        className,
      )}
    />
  );
}

interface GridProps {
  className?: string;
  masked?: boolean;
}

export function Grid({ className, masked = true }: GridProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 bg-grid",
        masked && "mask-radial-fade",
        className,
      )}
    />
  );
}

export function Noise({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-50 bg-noise", className)}
    />
  );
}

interface AuroraProps {
  className?: string;
}

export function Aurora({ className }: AuroraProps) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute -top-40 start-[10%] size-[34rem] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgba(79,70,229,0.4),transparent)] blur-3xl" />
      <div className="absolute -top-20 end-[5%] size-[30rem] animate-aurora-slow rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.3),transparent)] blur-3xl" />
      <div className="absolute top-40 start-[55%] size-[26rem] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.28),transparent)] blur-3xl" />
    </div>
  );
}
