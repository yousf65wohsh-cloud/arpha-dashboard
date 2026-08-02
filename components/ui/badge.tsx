import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-4 ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/30",
        primary: "bg-indigo-500/15 text-indigo-200 ring-indigo-500/30",
        success: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
        accent: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/30",
        warning: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
        danger: "bg-red-500/10 text-red-300 ring-red-500/30",
        neutral: "bg-white/[0.06] text-muted ring-white/10",
        outline: "border border-white/10 text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
