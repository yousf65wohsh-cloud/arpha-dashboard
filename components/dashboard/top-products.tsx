"use client";

import { Package } from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import { useLang } from "@/components/dashboard/lang-provider";
import { formatIQD } from "@/lib/utils";

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
  color: string;
}

export function TopProducts({ products }: { products: TopProduct[] }) {
  const { t, lang } = useLang();
  const max = Math.max(...products.map((p) => p.sold));
  return (
    <Panel
      title={t("widgets.topProducts")}
      subtitle={t("widgets.byUnitsSold")}
      titleIcon={<Package className="size-4" />}
    >
      <ul className="space-y-3.5">
        {products.map((p) => (
          <li key={p.name}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="truncate text-[13px] font-medium text-foreground">
                {p.name}
              </span>
              <span className="shrink-0 text-[12px] tabular-nums text-muted">
                {formatIQD(p.revenue, lang)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(p.sold / max) * 100}%`,
                  background: `linear-gradient(90deg, ${p.color}, ${p.color}88)`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
