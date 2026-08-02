"use client";

import { useState } from "react";
import { Brain, Phone, Plus, Search, Trash2, UserRound } from "lucide-react";
import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/shell/states";
import { useCustomers, useCustomerProfile } from "@/hooks/use-customers";
import { formatIQD, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CustomersPage() {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { customers, loading, error } = useCustomers({ search });

  return (
    <div>
      <PageHeader title={t("customers.title")} subtitle={t("customers.subtitle")} />

      <div className="rounded-xl border border-border bg-card p-3">
        <div className="relative mb-3 max-w-sm">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("customers.searchPlaceholder")}
            className="ps-9"
          />
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : customers.length === 0 ? (
          <EmptyState label={t("customers.empty")} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-start font-medium">{t("common.customer")}</th>
                  <th className="px-3 py-2 text-start font-medium">{t("settings.city")}</th>
                  <th className="px-3 py-2 text-start font-medium">{t("common.status")}</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/40"
                    onClick={() => setSelectedId(c.id)}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <UserRound className="size-4" />
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.phone ?? c.telegram ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.city ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge
                        className={
                          c.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
                            : "bg-muted text-muted-foreground ring-border"
                        }
                      >
                        {t(`customers.status.${c.status}`)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedId(c.id)}>
                        {t("customers.profile")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId ? <CustomerDrawer customerId={selectedId} onClose={() => setSelectedId(null)} /> : null}
    </div>
  );
}

function CustomerDrawer({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const { lang, t } = useLang();
  const { profile, loading, error, updateStatus, addMemory, deleteMemory } = useCustomerProfile(customerId);
  const [memoryText, setMemoryText] = useState("");
  const [adding, setAdding] = useState(false);

  async function onAddMemory() {
    const content = memoryText.trim();
    if (!content || adding) return;
    setAdding(true);
    try {
      await addMemory(content);
      setMemoryText("");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("customers.profile")}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : profile ? (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-5 pr-3">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <UserRound className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-foreground">{profile.customer.name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="size-3" /> {profile.customer.phone ?? profile.customer.telegram ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t("common.status")}</span>
                  <Switch
                    checked={profile.customer.status === "active"}
                    onCheckedChange={(v) => void updateStatus(v ? "active" : "inactive")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <StatTile label={t("customers.ordersCount")} value={formatNumber(profile.stats.totalOrders, lang)} />
                <StatTile label={t("customers.totalSpent")} value={formatIQD(profile.stats.totalSpent, lang)} />
                <StatTile label={t("customers.avgOrder")} value={formatIQD(profile.stats.avgOrderValue, lang)} />
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Brain className="size-4" /> {t("customers.memories")}
                </h4>
                {profile.memories.length === 0 ? (
                  <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                    {t("customers.noMemories")}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {profile.memories.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-start justify-between gap-2 rounded-lg border border-border/60 p-3 text-sm"
                      >
                        <p className="text-foreground">{m.content}</p>
                        <button
                          onClick={() => void deleteMemory(m.id)}
                          className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={t("common.delete")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <Input
                    value={memoryText}
                    onChange={(e) => setMemoryText(e.target.value)}
                    placeholder={t("customers.memoryPlaceholder")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void onAddMemory();
                    }}
                  />
                  <Button size="sm" onClick={() => void onAddMemory()} disabled={!memoryText.trim() || adding}>
                    <Plus className="size-4" /> {t("customers.addMemory")}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
