import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
  wordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const MARK_SIZE = { sm: "size-7", md: "size-9", lg: "size-11" } as const;
const TEXT_SIZE = { sm: "text-base", md: "text-lg", lg: "text-2xl" } as const;

export function BrandMark({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#06b6d4]",
        "shadow-[0_10px_30px_-8px_rgba(79,70,229,0.7)]",
        MARK_SIZE[size],
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-[58%]"
        aria-hidden="true"
      >
        <path
          d="M7 19.5 12 4.5l5 15"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.1 14.2h5.8"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute -end-0.5 -top-0.5 size-2 rounded-full bg-[#22c55e] ring-2 ring-background" />
    </div>
  );
}

export function Brand({ className, wordmark = true, size = "md" }: BrandProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark size={size} />
      {wordmark && (
        <span
          className={cn(
            "font-display font-semibold tracking-tight text-foreground",
            TEXT_SIZE[size],
          )}
        >
          Arpha
        </span>
      )}
    </span>
  );
}
