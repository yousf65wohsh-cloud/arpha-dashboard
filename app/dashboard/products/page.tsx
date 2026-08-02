"use client";

import { useState } from "react";
import { ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/shell/states";
import { useProducts } from "@/hooks/use-products";
import { formatIQD, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProductWithMedia } from "@/types/domain";
import type { ProductInput } from "@/repositories";

const PRODUCT_STATUSES: Array<ProductInput["status"]> = ["active", "draft", "archived"];

const STATUS_TONE: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
  draft: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
  archived: "bg-muted text-muted-foreground ring-border",
};

export default function ProductsPage() {
  const { lang, t } = useLang();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductInput["status"] | "all">("all");
  const [editing, setEditing] = useState<ProductWithMedia | "new" | null>(null);

  const { products, loading, error, create, update, remove } = useProducts({ search, status });

  return (
    <div>
      <PageHeader
        title={t("products.title")}
        subtitle={t("products.subtitle")}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" /> {t("products.addProduct")}
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("products.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as ProductInput["status"] | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("products.status.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("products.status.all")}</SelectItem>
            {PRODUCT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`products.status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : !products || products.length === 0 ? (
        <EmptyState label={t("products.empty")} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="group rounded-xl border border-border bg-card p-3">
              <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-muted/40">
                {p.media[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.media[0].url} alt={p.name} className="size-full object-cover" />
                ) : (
                  <ImageIcon className="size-8 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.category ?? t("products.status.all")} · {p.sku ?? "—"}
                  </p>
                </div>
                <Badge className={STATUS_TONE[p.status]}>
                  {t(`products.status.${p.status}`)}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{formatIQD(p.price, lang)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(p.stock, lang)} {t("common.stock")}
                </span>
              </div>
              {p.lowStockThreshold != null && p.stock <= p.lowStockThreshold ? (
                <p className="mt-1 text-xs font-medium text-amber-500">
                  {t("products.lowStock")}
                </p>
              ) : null}
              <div className="mt-3 flex items-center gap-1 border-t border-border/60 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditing(p)}>
                  <Pencil className="size-3" /> {t("common.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ms-auto text-xs text-destructive hover:text-destructive"
                  onClick={() => void remove(p.id)}
                >
                  <Trash2 className="size-3" /> {t("common.delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <ProductDialog
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onCreate={(input) => create(input)}
          onUpdate={(id, input) => update(id, input)}
        />
      ) : null}
    </div>
  );
}

function ProductDialog({
  product,
  onClose,
  onCreate,
  onUpdate,
}: {
  product: ProductWithMedia | null;
  onClose: () => void;
  onCreate: (input: ProductInput) => Promise<unknown>;
  onUpdate: (id: string, patch: Partial<ProductInput>) => Promise<unknown>;
}) {
  const { t } = useLang();
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [cost, setCost] = useState(product?.cost != null ? String(product.cost) : "");
  const [stock, setStock] = useState(String(product?.stock ?? ""));
  const [threshold, setThreshold] = useState(
    product?.lowStockThreshold != null ? String(product.lowStockThreshold) : "",
  );
  const [category, setCategory] = useState(product?.category ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [status, setStatus] = useState<ProductInput["status"]>(product?.status ?? "active");
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const input: ProductInput = {
        name: name.trim(),
        price: Number(price) || 0,
        cost: cost ? Number(cost) : null,
        stock: Number(stock) || 0,
        lowStockThreshold: threshold ? Number(threshold) : null,
        category: category.trim() || null,
        sku: sku.trim() || null,
        description: description.trim() || null,
        status,
      };
      if (product) await onUpdate(product.id, input);
      else await onCreate(input);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {product ? t("products.editProduct") : t("products.dialogTitle")}
          </DialogTitle>
          <DialogDescription>{t("products.dialogDesc")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>{t("products.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("products.namePlaceholder")} className="mt-1" />
          </div>
          <div>
            <Label>{t("products.priceLabel")}</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("products.cost")}</Label>
            <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("products.stockLabel")}</Label>
            <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("products.lowStock")}</Label>
            <Input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("products.category")}</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("products.skuLabel")}</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1" />
          </div>
          <div className="col-span-2">
            <Label>{t("common.status")}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProductInput["status"])}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`products.status.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>{t("common.notes")}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={() => void onSave()} disabled={saving || !name.trim()}>
            {saving ? t("common.loading") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
