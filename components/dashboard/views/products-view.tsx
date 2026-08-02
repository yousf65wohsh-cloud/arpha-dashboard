"use client";

import { useMemo, useState } from "react";
import {
  Boxes,
  CircleAlert,
  MoreHorizontal,
  PackagePlus,
  Plus,
  Tag,
  TriangleAlert,
} from "lucide-react";
import { Stat } from "@/components/dashboard/stat";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/dashboard-data";
import type { Product } from "@/types/dashboard";
import { useLang } from "@/components/dashboard/lang-provider";
import { formatIQD } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<Product["status"], { label: string; variant: "success" | "warning" | "neutral" }> = {
  active: { label: "products.active", variant: "success" },
  draft: { label: "products.draft", variant: "warning" },
  archived: { label: "products.archived", variant: "neutral" },
};

const MAX_STOCK = 240;

function statusVariant(p: Product): "success" | "warning" | "danger" {
  if (p.stock === 0) return "danger";
  if (p.stock <= p.lowStock) return "warning";
  return "success";
}

export function ProductsView() {
  const { t, lang } = useLang();
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({ name: "", sku: "", category: PRODUCT_CATEGORIES[0], price: "", stock: "" });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesCat = category === "all" || p.category === category;
      return matchesQ && matchesCat && p.status !== "archived";
    });
  }, [products, query, category]);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.status === "active");
    return {
      total: active.length,
      inStock: active.filter((p) => p.stock > 0).length,
      lowStock: active.filter((p) => p.stock <= p.lowStock).length,
      value: active.reduce((sum, p) => sum + p.stock * p.price, 0),
      revenue: active.reduce((sum, p) => sum + p.sold * p.price, 0),
    };
  }, [products]);

  const addProduct = () => {
    if (!form.name.trim()) return;
    const price = Number(form.price) || 0;
    const stock = Number(form.stock) || 0;
    const next: Product = {
      id: `p-${Date.now()}`,
      name: form.name.trim(),
      sku: form.sku.trim() || `SKN-${String(products.length + 1).padStart(3, "0")}`,
      category: form.category,
      price,
      cost: 0,
      stock,
      lowStock: 10,
      sold: 0,
      status: "active",
      hue: "from-[#6366f1] to-[#4f46e5]",
    };
    setProducts((prev) => [next, ...prev]);
    setOpen(false);
    setForm({ name: "", sku: "", category: PRODUCT_CATEGORIES[0], price: "", stock: "" });
  };

  const archive = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "archived" } : p)));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={t("products.stat.active")} value={String(stats.total)} delta={t("products.stat.inStock", { n: stats.inStock })} icon={Boxes} accent="primary" />
        <Stat label={t("products.stat.lowStock")} value={String(stats.lowStock)} delta={t("products.stat.needsReorder")} icon={TriangleAlert} accent="warning" />
        <Stat label={t("products.stat.inventoryValue")} value={formatIQD(stats.value * 1000, lang)} delta={t("products.stat.atCost")} icon={Tag} accent="accent" />
        <Stat label={t("products.stat.lifetimeRevenue")} value={formatIQD(stats.revenue * 1000, lang)} delta={t("products.stat.byUnitsSold")} icon={PackagePlus} accent="success" />
      </div>

      <Panel
        title={t("products.catalog")}
        subtitle={t("products.catalogSub", { n: filtered.length })}
        header={
          <div className="flex flex-col gap-2 px-5 pt-4 sm:flex-row sm:items-center">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("products.search")}
              className="sm:max-w-xs"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("products.allCategories")}</SelectItem>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`products.cat.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="sm:ms-auto" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              {t("products.add")}
            </Button>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("products.product")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("products.category")}</TableHead>
              <TableHead>{t("products.price")}</TableHead>
              <TableHead className="w-[22%]">{t("products.stock")}</TableHead>
              <TableHead className="hidden text-end sm:table-cell">{t("products.sold")}</TableHead>
              <TableHead className="hidden text-end sm:table-cell">{t("products.revenue")}</TableHead>
              <TableHead className="text-end">{t("employees.status")}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className={cn("size-8 shrink-0 rounded-lg bg-gradient-to-br", p.hue)} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">{p.nameKey ? t(p.nameKey) : p.name}</p>
                      <p className="text-[11px] text-muted">{p.sku}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="neutral">{p.categoryKey ? t(p.categoryKey) : p.category}</Badge>
                </TableCell>
                <TableCell className="tabular-nums">{formatIQD(p.price * 1000, lang)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          p.stock === 0
                            ? "bg-red-500"
                            : p.stock <= p.lowStock
                              ? "bg-amber-500"
                              : "bg-gradient-to-r from-indigo-500 to-violet-500",
                        )}
                        style={{ width: `${Math.min((p.stock / MAX_STOCK) * 100, 100)}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "w-7 shrink-0 text-end text-[11px] tabular-nums",
                        p.stock === 0 ? "text-red-300" : p.stock <= p.lowStock ? "text-amber-300" : "text-muted",
                      )}
                    >
                      {p.stock}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-end tabular-nums text-muted sm:table-cell">
                  {p.sold.toLocaleString()}
                </TableCell>
                <TableCell className="hidden text-end font-medium tabular-nums sm:table-cell">
                  {formatIQD(p.sold * p.price * 1000, lang)}
                </TableCell>
                <TableCell className="text-end">
                  {p.stock <= p.lowStock && (
                    <CircleAlert className="me-1.5 inline size-3.5 text-amber-300/80" />
                  )}
                  <Badge variant={statusVariant(p) === "danger" ? "danger" : statusVariant(p) === "warning" ? "warning" : "success"}>
                    {statusVariant(p) === "danger"
                      ? t("products.outOfStock")
                      : statusVariant(p) === "warning"
                        ? t("products.lowStockBadge")
                        : t(STATUS_BADGE[p.status].label)}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>{t("products.edit")}</DropdownMenuItem>
                      <DropdownMenuItem>{t("products.duplicate")}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-300 focus:text-red-300"
                        onClick={() => archive(p.id)}
                      >
                        {t("products.archive")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted">
                  {t("products.noMatch")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("products.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("products.dialogDesc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <div className="grid gap-2">
              <Label htmlFor="p-name">{t("products.nameLabel")}</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t("products.namePlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="p-sku">{t("products.skuLabel")}</Label>
                <Input
                  id="p-sku"
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  placeholder="SKN-HM-013"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("products.category")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t(`products.cat.${c}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="p-price">{t("products.priceLabel")}</Label>
                <Input
                  id="p-price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-stock">{t("products.stockLabel")}</Label>
                <Input
                  id="p-stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={addProduct}>
              <Plus className="size-4" />
              {t("products.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
