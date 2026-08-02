"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  ChevronDown,
  ConciergeBell,
  CreditCard,
  ExternalLink,
  FileText,
  Gem,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  UserRoundCog,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/landing/brand";
import { Avatar } from "@/components/dashboard/customers-list";
import { useLang } from "@/components/dashboard/lang-provider";
import { timeAgo } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { NOTIFICATIONS, STORES } from "@/lib/dashboard-data";
import type { AppNotification, DashboardSection } from "@/types/dashboard";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

interface NavItem {
  id: DashboardSection;
  icon: LucideIcon;
}

const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: "group.overview",
    items: [{ id: "dashboard", icon: LayoutDashboard }],
  },
  {
    group: "group.operations",
    items: [
      { id: "orders", icon: ShoppingBag },
      { id: "products", icon: Package },
      { id: "services", icon: ConciergeBell },
      { id: "calendar", icon: CalendarDays },
    ],
  },
  {
    group: "group.intelligence",
    items: [
      { id: "conversations", icon: MessagesSquare },
      { id: "ai-center", icon: Bot },
      { id: "analytics", icon: BarChart3 },
      { id: "reports", icon: FileText },
    ],
  },
  {
    group: "group.business",
    items: [
      { id: "customers", icon: Users },
      { id: "employees", icon: UsersRound },
      { id: "billing", icon: CreditCard },
      { id: "plans", icon: Gem },
    ],
  },
  {
    group: "group.system",
    items: [
      { id: "notifications", icon: Bell },
      { id: "settings", icon: Settings },
    ],
  },
];

export const SECTION_IDS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id));

const NOTIF_TONE: Record<AppNotification["type"], { icon: LucideIcon; cls: string }> = {
  order: { icon: ShoppingBag, cls: "bg-indigo-500/12 text-indigo-300 ring-indigo-500/25" },
  ai: { icon: Sparkles, cls: "bg-emerald-500/12 text-emerald-300 ring-emerald-500/25" },
  billing: { icon: CreditCard, cls: "bg-cyan-500/12 text-cyan-300 ring-cyan-500/25" },
  alert: { icon: AlertTriangle, cls: "bg-amber-500/12 text-amber-300 ring-amber-500/25" },
  system: { icon: UserRoundCog, cls: "bg-white/[0.06] text-muted ring-white/10" },
};

function sectionIdFromPath(pathname: string): DashboardSection {
  const seg = pathname.split("/").filter(Boolean)[1];
  if (seg && (SECTION_IDS as string[]).includes(seg)) return seg as DashboardSection;
  return "dashboard";
}

/* ------------------------------------------------------------------ */
/*  Sidebar nav (shared desktop + mobile)                              */
/* ------------------------------------------------------------------ */

function SidebarNav({
  active,
  onNavigate,
}: {
  active: DashboardSection;
  onNavigate?: (id: DashboardSection) => void;
}) {
  const { t } = useLang();
  const router = useRouter();

  const go = (id: DashboardSection) => {
    if (id === "dashboard") router.push("/dashboard");
    else router.push(`/dashboard/${id}`);
    onNavigate?.(id);
  };

  return (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.group}>
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/60">
            {t(group.group)}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500/20 to-indigo-500/5 text-indigo-200 ring-1 ring-inset ring-indigo-500/20"
                      : "text-muted hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 transition-colors",
                      isActive ? "text-indigo-300" : "text-muted/70 group-hover:text-foreground",
                    )}
                  />
                  {t(`nav.${item.id}`)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function StoreSwitcher() {
  const { t } = useLang();
  const [store, setStore] = useState<string>(STORES[0].id);
  const current = STORES.find((s) => s.id === store) ?? STORES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2 text-start transition-colors hover:bg-white/[0.06]"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 text-[10px] font-bold text-indigo-200">
            {current.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-medium text-foreground">{current.name}</span>
            <span className="block text-[10px] text-muted">
              {current.city} · {current.plan}
            </span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{t("sidebar.switchStore")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={store} onValueChange={(v) => setStore(v)}>
          {STORES.map((s) => (
            <DropdownMenuRadioItem key={s.id} value={s.id}>
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{s.name}</span>
                <span className="ms-auto text-[11px] text-muted">{s.plan}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar({ active, onNavigate }: { active: DashboardSection; onNavigate?: () => void }) {
  const { t } = useLang();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <BrandMark size="sm" />
        <div>
          <p className="text-[13px] font-semibold leading-tight text-foreground">Arpha</p>
          <p className="text-[10px] text-muted">{t("misc.storeAdmin")}</p>
        </div>
      </div>

      <div className="mt-4">
        <StoreSwitcher />
      </div>

      <ScrollArea className="mt-4 min-h-0 flex-1">
        <SidebarNav active={active} onNavigate={onNavigate} />
      </ScrollArea>

      <div className="space-y-3 pt-3">
        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 p-3">
          <p className="text-[11px] font-medium text-indigo-200">{t("sidebar.aiManager")}</p>
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{t("sidebar.weeklyReport")}</p>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-indigo-300 transition-colors hover:text-indigo-200"
          >
            {t("common.view")} <ExternalLink className="size-3" />
          </button>
        </div>
        <div className="flex items-center gap-2.5 px-1">
          <Avatar initials="NA" index={0} className="size-7 text-[10px]" />
          <div className="min-w-0">
            <p className="truncate text-[11.5px] font-medium text-foreground">Noor Amiri</p>
            <p className="text-[10px] text-muted">{t("sidebar.admin")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Topbar                                                             */
/* ------------------------------------------------------------------ */

function NotificationsMenu() {
  const { t, lang } = useLang();
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("topbar.notifications")}
          className="relative grid size-9 place-items-center rounded-xl bg-white/[0.04] text-muted ring-1 ring-white/[0.06] transition-colors hover:text-foreground"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -end-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-[9px] font-semibold text-white ring-2 ring-background">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(92vw,340px)] p-0">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
          <p className="text-[13px] font-semibold text-foreground">{t("topbar.notifications")}</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
              className="text-[11px] font-medium text-indigo-300 transition-colors hover:text-indigo-200"
            >
              {t("common.markAllRead")}
            </button>
          )}
        </div>
        <ScrollArea className="max-h-[360px]">
          {items.slice(0, 8).map((n) => {
            const tone = NOTIF_TONE[n.type];
            return (
              <button
                key={n.id}
                type="button"
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-2.5 text-start transition-colors hover:bg-white/[0.03]",
                  !n.read && "bg-indigo-500/[0.04]",
                )}
              >
                <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ring-1", tone.cls)}>
                  <tone.icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[12.5px] font-medium text-foreground">{t(n.titleKey, n.titleArgs)}</span>
                    {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-indigo-400" />}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted">{t(n.detailKey, n.detailArgs)}</span>
                </span>
                <span className="shrink-0 text-[10px] text-muted/70">{timeAgo(lang, n.time)}</span>
              </button>
            );
          })}
        </ScrollArea>
        <div className="border-t border-white/[0.07] p-1">
          <DropdownMenuItem asChild>
            <Link href="/dashboard/notifications" className="justify-center text-[12px] font-medium text-indigo-300">
              {t("common.viewAll")}
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const { t } = useLang();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-white/[0.05]">
          <Avatar initials="NA" index={0} className="size-8" />
          <ChevronDown className="hidden size-3.5 text-muted sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2.5 py-2">
          <p className="text-[13px] font-semibold text-foreground">Noor Amiri</p>
          <p className="text-[11px] text-muted">noor@arpha.app</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <ExternalLink className="size-4" />
            {t("topbar.viewStore")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="size-4" />
            {t("topbar.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>{t("topbar.help")}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-300 focus:text-red-300">
          <LogOut className="size-4" />
          {t("topbar.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LanguageToggle() {
  const { lang, toggle, t } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("misc.arabic")}
      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/[0.04] px-3 text-[12px] font-medium text-muted ring-1 ring-white/[0.06] transition-colors hover:text-foreground"
    >
      <Globe className="size-4" />
      <span className="hidden sm:inline">{t("misc.arabic")}</span>
      <span className="sm:hidden">{lang === "en" ? "ع" : "EN"}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Shell                                                              */
/* ------------------------------------------------------------------ */

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const section = sectionIdFromPath(pathname);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 border-e border-white/[0.07] bg-[#0b0d13] p-3 lg:block">
        <Sidebar active={section} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="start" className="w-[min(86vw,300px)] p-3">
          <SheetTitle className="sr-only">Arpha</SheetTitle>
          <SheetDescription className="sr-only">Dashboard navigation</SheetDescription>
          <Sidebar active={section} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="lg:ps-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.07] bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileOpen(true)}
            className="grid size-9 place-items-center rounded-xl bg-white/[0.04] text-muted ring-1 ring-white/[0.06] transition-colors hover:text-foreground lg:hidden"
          >
            <Menu className="size-4" />
          </button>

          <h1 className="text-sm font-semibold text-foreground">{t(`title.${section}`)}</h1>

          <div className="ms-auto flex items-center gap-2">
            <div className="hidden h-9 w-52 items-center gap-2 rounded-xl bg-white/[0.04] px-3 ring-1 ring-white/[0.06] focus-within:ring-indigo-500/40 xl:flex">
              <Search className="size-3.5 text-muted" />
              <input
                type="text"
                placeholder={t("common.searchOrders")}
                className="w-full bg-transparent text-[12px] text-foreground placeholder:text-muted focus:outline-none"
              />
            </div>
            <LanguageToggle />
            <NotificationsMenu />
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
