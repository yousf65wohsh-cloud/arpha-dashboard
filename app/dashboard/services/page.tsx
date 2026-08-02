"use client";

import { useState } from "react";
import { Clock, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/shell/states";
import { useServices } from "@/hooks/use-services";
import { formatIQD, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/types/domain";
import type { ServiceInput } from "@/repositories";

export default function ServicesPage() {
  const { lang, t } = useLang();
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  const { services, loading, error, create, update, remove } = useServices();

  return (
    <div>
      <PageHeader
        title={t("services.title")}
        subtitle={t("services.subtitle")}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" /> {t("services.addService")}
          </Button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : !services || services.length === 0 ? (
        <EmptyState label={t("services.empty")} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="group rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{s.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.category ?? "—"} · {s.status === "active" ? t("common.active") : t("common.paused")}
                  </p>
                </div>
                <Badge
                  className={
                    s.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
                      : "bg-muted text-muted-foreground ring-border"
                  }
                >
                  {s.status === "active" ? t("common.active") : t("common.paused")}
                </Badge>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {s.description ?? "—"}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="text-base font-semibold text-foreground">{formatIQD(s.price, lang)}</span>
                {s.durationMinutes ? (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {s.durationMinutes} {t("services.duration")}
                  </span>
                ) : null}
                {s.bookings != null ? (
                  <span>{formatNumber(s.bookings, lang)} {t("services.bookings")}</span>
                ) : null}
                {s.rating != null ? (
                  <span className="flex items-center gap-1">
                    <Star className="size-3 text-amber-500" /> {s.rating}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-center gap-1 border-t border-border/60 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditing(s)}>
                  <Pencil className="size-3" /> {t("common.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ms-auto text-xs text-destructive hover:text-destructive"
                  onClick={() => void remove(s.id)}
                >
                  <Trash2 className="size-3" /> {t("common.delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <ServiceDialog
          service={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onCreate={(input) => create(input)}
          onUpdate={(id, patch) => update(id, patch)}
        />
      ) : null}
    </div>
  );
}

function ServiceDialog({
  service,
  onClose,
  onCreate,
  onUpdate,
}: {
  service: Service | null;
  onClose: () => void;
  onCreate: (input: ServiceInput) => Promise<unknown>;
  onUpdate: (id: string, patch: Partial<ServiceInput>) => Promise<unknown>;
}) {
  const { t } = useLang();
  const [name, setName] = useState(service?.name ?? "");
  const [price, setPrice] = useState(String(service?.price ?? ""));
  const [duration, setDuration] = useState(
    service?.durationMinutes != null ? String(service.durationMinutes) : "",
  );
  const [category, setCategory] = useState(service?.category ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [status, setStatus] = useState<ServiceInput["status"]>(service?.status ?? "active");
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const input: ServiceInput = {
        name: name.trim(),
        price: Number(price) || 0,
        durationMinutes: duration ? Number(duration) : null,
        category: category.trim() || null,
        description: description.trim() || null,
        status,
      };
      if (service) await onUpdate(service.id, input);
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
            {service ? t("services.editService") : t("services.addService")}
          </DialogTitle>
          <DialogDescription>{t("services.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>{t("services.service")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("services.price")}</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("services.duration")}</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("common.category")}</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("common.status")}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ServiceInput["status"])}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("common.active")}</SelectItem>
                <SelectItem value="paused">{t("common.paused")}</SelectItem>
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
