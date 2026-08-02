"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, CalendarCheck2, Star, TicketPercent } from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SERVICES } from "@/lib/dashboard-data";
import { useLang } from "@/components/dashboard/lang-provider";
import { formatIQD } from "@/lib/utils";

export function ServicesView() {
  const { t, lang } = useLang();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(SERVICES.map((s) => s.category))),
    [],
  );

  const filtered = SERVICES.filter((s) => {
    const q = query.trim().toLowerCase();
    const matchesQ = !q || s.name.toLowerCase().includes(q);
    const matchesCat = category === "all" || s.category === category;
    return matchesQ && matchesCat;
  });

  const stats = useMemo(() => {
    const active = SERVICES.filter((s) => s.status === "active");
    return {
      total: active.length,
      bookings: SERVICES.reduce((sum, s) => sum + s.bookings, 0),
      rating:
        SERVICES.reduce((sum, s) => sum + s.rating, 0) / SERVICES.length,
      top: SERVICES.reduce((a, b) => (a.bookings > b.bookings ? a : b)),
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={t("services.stat.active")} value={String(stats.total)} delta={t("services.stat.allLive")} icon={BadgeCheck} accent="success" />
        <Stat label={t("services.stat.bookings")} value={stats.bookings.toLocaleString()} delta={t("services.stat.allTime")} icon={CalendarCheck2} accent="primary" />
        <Stat label={t("services.stat.rating")} value={stats.rating.toFixed(1)} delta={t("services.stat.ratedBy")} icon={Star} accent="warning" />
        <Stat label={t("services.stat.top")} value={stats.top.nameKey ? t(stats.top.nameKey).split(" ").slice(0, 2).join(" ") : stats.top.name.split(" ").slice(0, 2).join(" ")} delta={t("services.stat.bookingsCount", { n: stats.top.bookings })} icon={TicketPercent} accent="accent" />
      </div>

      <Panel
        title={t("services.title")}
        subtitle={t("services.subtitle")}
        header={
          <div className="flex flex-col gap-2 px-5 pt-4 sm:flex-row sm:items-center">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("services.search")}
              className="sm:max-w-xs"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("services.allCategories")}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`services.cat.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("services.service")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("services.category")}</TableHead>
              <TableHead>{t("services.price")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("services.duration")}</TableHead>
              <TableHead className="text-end">{t("services.bookings")}</TableHead>
              <TableHead className="text-end">{t("services.rating")}</TableHead>
              <TableHead className="text-end">{t("employees.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{s.nameKey ? t(s.nameKey) : s.name}</p>
                    <p className="max-w-xs truncate text-[11px] text-muted">{s.descKey ? t(s.descKey) : s.description}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="neutral">{s.categoryKey ? t(s.categoryKey) : s.category}</Badge>
                </TableCell>
                <TableCell className="tabular-nums">
                  {s.price === 0 ? <span className="text-muted">{t("services.free")}</span> : formatIQD(s.price * 1000, lang)}
                </TableCell>
                <TableCell className="hidden text-muted sm:table-cell">{s.durationKey ? t(s.durationKey) : s.duration}</TableCell>
                <TableCell className="text-end tabular-nums text-foreground">
                  {s.bookings.toLocaleString()}
                </TableCell>
                <TableCell className="text-end">
                  <span className="inline-flex items-center gap-1 tabular-nums text-foreground">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {s.rating.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-end">
                  <Badge variant={s.status === "active" ? "success" : "neutral"}>
                    {s.status === "active" ? t("services.active") : t("services.paused")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
