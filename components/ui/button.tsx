import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium",
    "transition-all duration-300 ease-out select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white shadow-[0_10px_40px_-12px_rgba(79,70,229,0.7)] hover:shadow-[0_14px_48px_-12px_rgba(79,70,229,0.9)] hover:brightness-[1.08]",
        secondary:
          "bg-gradient-to-b from-[#34d399] to-[#22c55e] text-emerald-950 shadow-[0_10px_40px_-14px_rgba(34,197,94,0.6)] hover:shadow-[0_14px_48px_-14px_rgba(34,197,94,0.8)] hover:brightness-[1.06]",
        accent:
          "bg-gradient-to-b from-[#22d3ee] to-[#06b6d4] text-cyan-950 shadow-[0_10px_40px_-14px_rgba(6,182,212,0.6)] hover:brightness-[1.06]",
        outline:
          "border border-white/10 bg-white/[0.03] text-foreground backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.07]",
        ghost: "text-muted hover:text-foreground hover:bg-white/[0.06]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-sm",
        xl: "h-14 px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
