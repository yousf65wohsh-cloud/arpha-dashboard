"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",            label: "نظرة عامة" },
  { href: "/orders",      label: "الطلبات" },
  { href: "/followups",   label: "أسئلة معلّقة" },
  { href: "/escalations", label: "تصعيدات" },
  { href: "/catalog",     label: "الكتالوج" },
  { href: "/stores",      label: "المتاجر" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
      {LINKS.map((l) => {
        const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 h-10 flex items-center text-sm transition-colors ${
              active ? "bg-petrol text-white font-medium" : "text-ink/80 hover:bg-card"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
