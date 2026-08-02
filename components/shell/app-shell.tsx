"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Bot,
  ConciergeBell,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Package,
  ScrollText,
  Settings,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/dashboard/lang-provider";
import { useSession } from "@/hooks/use-session";
import { useStore } from "@/hooks/use-store";
import { useOutstandingFollowups } from "@/hooks/use-followups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BrandMark } from "@/components/landing/brand";

interface NavItem {
  href: string;
  icon: LucideIcon;
  key: string;
  badge?: "notifications";
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
  { href: "/dashboard/conversations", icon: MessagesSquare, key: "nav.conversations" },
  { href: "/dashboard/orders", icon: ShoppingBag, key: "nav.orders" },
  { href: "/dashboard/customers", icon: Users, key: "nav.customers" },
  { href: "/dashboard/products", icon: Package, key: "nav.products" },
  { href: "/dashboard/services", icon: ConciergeBell, key: "nav.services" },
  { href: "/dashboard/policies", icon: ScrollText, key: "nav.policies" },
  { href: "/dashboard/reports", icon: BarChart3, key: "nav.reports" },
  { href: "/dashboard/notifications", icon: Bell, key: "nav.notifications", badge: "notifications" },
  { href: "/dashboard/usage", icon: Bot, key: "nav.usage" },
  { href: "/dashboard/settings", icon: Settings, key: "nav.settings" },
];

function useActivePath() {
  const pathname = usePathname();
  const seg = pathname.split("/").filter(Boolean)[1] ?? "dashboard";
  return `/dashboard${seg === "dashboard" ? "" : `/${seg}`}`;
}

function SidebarContent({ t, active }: { t: (k: string) => string; active: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <BrandMark />
        <span className="text-base font-semibold tracking-tight text-foreground">
          Arpha
        </span>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="flex-1 truncate">{t(item.key)}</span>
                {item.badge === "notifications" ? (
                  <Badge className="bg-primary text-primary-foreground">0</Badge>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-border p-3">
        <p className="px-3 text-[11px] uppercase tracking-wide text-muted-foreground/70">
          Arpha OS
        </p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { lang, toggle, t } = useLang();
  const router = useRouter();
  const active = useActivePath();
  const { session, signOut } = useSession();
  const { store } = useStore();
  const { count: followups } = useOutstandingFollowups();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tStr = (key: string) => t(key);
  const userName = session?.user?.email?.split("@")[0] ?? "owner";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-e border-border bg-card/40 lg:block">
        <SidebarContent t={tStr} active={active} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="start" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SidebarContent t={tStr} active={active} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {store?.name ?? t("shell.storeName")}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  store?.botActive ? "bg-emerald-500" : "bg-muted-foreground/50",
                )}
              />
              <span className="truncate">
                {store?.botActive ? t("shell.botActive") : t("shell.botOffline")}
              </span>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={toggle}>
            <Globe className="size-4" />
            {lang === "ar" ? "EN" : "ع"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="size-5" />
                {followups > 0 ? (
                  <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {followups > 9 ? "9+" : followups}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Bell className="size-4 text-muted-foreground" />
                {t("nav.notifications")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-3 text-sm text-muted-foreground">
                {followups > 0
                  ? t("shell.followupsPending").replace("{n}", String(followups))
                  : t("shell.noNotifications")}
              </div>
              {followups > 0 ? (
                <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>
                  {t("shell.viewNotifications")}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {userName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-32 truncate text-sm text-muted-foreground sm:block">
                  {userName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{session?.user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="size-4" />
                {t("nav.settings")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  void signOut();
                  router.replace("/login");
                }}
              >
                <LogOut className="size-4" />
                {t("auth.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
