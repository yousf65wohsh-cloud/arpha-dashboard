"use client";

import { useState } from "react";
import { ShieldCheck, UserPlus, UserX, UsersRound } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/dashboard/customers-list";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPLOYEES } from "@/lib/dashboard-data";
import type { Employee } from "@/types/dashboard";
import { useLang } from "@/components/dashboard/lang-provider";
import { timeAgo } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<Employee["status"], { label: string; variant: "success" | "accent" | "danger" | "neutral" }> = {
  active: { label: "employees.active", variant: "success" },
  invited: { label: "employees.invited", variant: "accent" },
  suspended: { label: "employees.suspended", variant: "danger" },
};

const ROLE_KEY: Record<string, string> = {
  Owner: "employees.role.owner",
  "Store Manager": "employees.role.manager",
  "Customer Care": "employees.role.care",
  "AI Trainer": "employees.role.trainer",
  "Warehouse Lead": "employees.role.warehouse",
  Accountant: "employees.role.accountant",
};

const PERM_KEY: Record<string, string> = {
  dashboard: "employees.perm.dashboard",
  orders: "employees.perm.orders",
  customers: "employees.perm.customers",
  products: "employees.perm.products",
  services: "employees.perm.services",
  billing: "employees.perm.billing",
  settings: "employees.perm.settings",
  employees: "employees.perm.employees",
  ai: "employees.perm.ai",
  analytics: "employees.perm.analytics",
  reports: "employees.perm.reports",
  conversations: "employees.perm.conversations",
};

const ROLES = ["Owner", "Store Manager", "Customer Care", "AI Trainer", "Warehouse Lead", "Accountant"];

export function EmployeesView() {
  const { t, lang } = useLang();
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: ROLES[1] });

  const filtered = employees.filter((e) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q)
    );
  });

  const counts = {
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    invited: employees.filter((e) => e.status === "invited").length,
    suspended: employees.filter((e) => e.status === "suspended").length,
  };

  const invite = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const initials = form.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const next: Employee = {
      id: `e-${Date.now()}`,
      name: form.name.trim(),
      role: form.role,
      email: form.email.trim(),
      phone: "+964 7xx xxx xxxx",
      status: "invited",
      permissions: ["orders", "customers"],
      initials,
      lastActive: "Invited just now",
    };
    setEmployees((prev) => [next, ...prev]);
    setOpen(false);
    setForm({ name: "", email: "", role: ROLES[1] });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={t("employees.teamMembers")} value={String(counts.total)} delta={t("employees.acrossRoles")} icon={UsersRound} accent="primary" />
        <Stat label={t("employees.active")} value={String(counts.active)} delta={t("employees.workingToday")} icon={ShieldCheck} accent="success" />
        <Stat label={t("employees.invited")} value={String(counts.invited)} delta={t("employees.pendingAccept")} icon={UserPlus} accent="accent" />
        <Stat label={t("employees.suspended")} value={String(counts.suspended)} delta={t("employees.reviewNeeded")} icon={UserX} accent="danger" />
      </div>

      <Panel
        title={t("employees.team")}
        subtitle={t("employees.teamSub")}
        header={
          <div className="flex flex-col gap-2 px-5 pt-4 sm:flex-row sm:items-center">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("employees.searchPlaceholder")}
              className="sm:max-w-xs"
            />
            <Button size="sm" className="sm:ms-auto" onClick={() => setOpen(true)}>
              <UserPlus className="size-4" />
              {t("employees.invite")}
            </Button>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("employees.member")}</TableHead>
              <TableHead>{t("employees.role")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("employees.phone")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("employees.lastActive")}</TableHead>
              <TableHead className="hidden xl:table-cell">{t("employees.permissions")}</TableHead>
              <TableHead className="text-end">{t("employees.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e, i) => (
              <TableRow key={e.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={e.initials} index={i} className="size-8" />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">{e.name}</p>
                      <p className="truncate text-[11px] text-muted">{e.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted">{t(ROLE_KEY[e.role] ?? e.role)}</TableCell>
                <TableCell className="hidden tabular-nums text-muted lg:table-cell">{e.phone}</TableCell>
                <TableCell className="hidden text-muted md:table-cell">
                  {e.lastActive === "Invited just now"
                    ? t("employees.invitedJustNow")
                    : e.status === "invited"
                      ? `${t("employees.invited")} ${timeAgo(lang, e.lastActive.replace(/^Invited\s*/i, ""))}`
                      : timeAgo(lang, e.lastActive)}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {e.permissions.slice(0, 3).map((p) => (
                      <Badge key={p} variant="neutral">
                        {t(PERM_KEY[p] ?? p)}
                      </Badge>
                    ))}
                    {e.permissions.length > 3 && (
                      <Badge variant="neutral">+{e.permissions.length - 3}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-end">
                  <Badge
                    variant={STATUS_BADGE[e.status].variant}
                    className={cn(e.status === "invited" && "cursor-pointer")}
                  >
                    {t(STATUS_BADGE[e.status].label)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("employees.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("employees.dialogDesc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <div className="grid gap-2">
              <Label htmlFor="e-name">{t("employees.fullName")}</Label>
              <Input
                id="e-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t("employees.namePlaceholder")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="e-email">{t("employees.email")}</Label>
              <Input
                id="e-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="leila@yourstore.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("employees.roleLabel")}</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(ROLE_KEY[r] ?? r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={invite}>
              <UserPlus className="size-4" />
              {t("employees.sendInvite")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
