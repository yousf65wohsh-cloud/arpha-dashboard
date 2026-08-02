"use client";

import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  Box,
  CreditCard,
  LayoutDashboard,
  Lock,
  RotateCw,
  Search,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/landing/brand";
import { Avatar } from "@/components/dashboard/customers-list";
import { useLang } from "@/components/dashboard/lang-provider";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  layout: LayoutDashboard,
  bag: ShoppingBag,
  users: Users,
  box: Box,
  chart: BarChart3,
  bot: Bot,
  card: CreditCard,
};

interface SidebarItem {
  label: string;
  icon: string;
  active?: boolean;
}

interface DashboardShellProps {
  children: ReactNode;
  url: string;
  viewTitle: string;
  items: readonly SidebarItem[];
}

export function DashboardShell({
  children,
  url,
  viewTitle,
  items,
}: DashboardShellProps) {
  const { t } = useLang();
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d13] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-7 min-w-0 max-w-xs flex-1 items-center gap-2 rounded-lg bg-white/[0.05] px-3 text-[11px] text-muted ring-1 ring-white/[0.06] sm:max-w-sm">
          <Lock className="size-3 shrink-0 text-emerald-400" />
          <span className="truncate">{url}</span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <RotateCw className="size-3.5 text-muted" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 flex-col border-e border-white/[0.07] bg-white/[0.015] p-3 md:flex">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <BrandMark size="sm" />
            <div>
              <p className="text-[13px] font-semibold leading-tight text-foreground">Arpha</p>
              <p className="text-[10px] text-muted">{t("misc.store")}: Baghdad Beauty</p>
            </div>
          </div>
          <nav className="mt-4 flex flex-col gap-0.5">
            {items.map((item) => {
              const Icon = NAV_ICONS[item.icon];
              return (
                <span
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px]",
                    item.active
                      ? "bg-gradient-to-r from-indigo-500/20 to-indigo-500/5 font-medium text-indigo-200 ring-1 ring-inset ring-indigo-500/20"
                      : "text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {t(item.label)}
                </span>
              );
            })}
          </nav>
          <div className="mt-auto space-y-3 pt-4">
            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 p-3">
              <p className="text-[11px] font-medium text-indigo-200">{t("sidebar.aiManager")}</p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">
                {t("sidebar.weeklyReport")}
              </p>
            </div>
            <div className="flex items-center gap-2.5 px-1">
              <Avatar initials="NA" index={0} className="size-7 text-[10px]" />
              <div className="min-w-0">
                <p className="truncate text-[11.5px] font-medium text-foreground">Noor Amiri</p>
                <p className="text-[10px] text-muted">{t("misc.platformAdmin")}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Topbar */}
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-2.5">
            <h1 className="text-sm font-semibold text-foreground">{viewTitle}</h1>
            <div className="ms-auto flex items-center gap-2">
              <div className="hidden h-8 w-44 items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 ring-1 ring-white/[0.06] sm:flex">
                <Search className="size-3.5 text-muted" />
                <span className="text-[11px] text-muted/70">{t("common.searchOrders")}</span>
              </div>
              <span className="relative grid size-8 place-items-center rounded-lg bg-white/[0.04] text-muted ring-1 ring-white/[0.06]">
                <Bell className="size-4" />
                <span className="absolute end-1.5 top-1.5 size-1.5 rounded-full bg-indigo-400" />
              </span>
            </div>
          </div>
          {/* Content */}
          <div className="p-3 sm:p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
