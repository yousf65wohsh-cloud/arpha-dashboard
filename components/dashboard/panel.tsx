import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  action?: ReactNode;
  title?: string;
  subtitle?: string;
  titleIcon?: ReactNode;
}

export function Panel({
  children,
  className,
  header,
  action,
  title,
  subtitle,
  titleIcon,
}: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-surface/80 shadow-card backdrop-blur-sm",
        className,
      )}
    >
      {(header || title) && (
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
          <div className="flex items-center gap-2.5">
            {titleIcon && (
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-muted">
                {titleIcon}
              </span>
            )}
            <div>
              {title && (
                <p className="text-sm font-medium text-foreground">{title}</p>
              )}
              {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {header}
      <div className={cn("p-5", (header || title) && "pt-3")}>{children}</div>
    </div>
  );
}
