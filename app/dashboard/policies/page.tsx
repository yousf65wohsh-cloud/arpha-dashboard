"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/shell/states";
import { usePolicies } from "@/hooks/use-policies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Policy } from "@/types/domain";
import type { PolicyInput } from "@/repositories";

export default function PoliciesPage() {
  const { t } = useLang();
  const [editing, setEditing] = useState<Policy | "new" | null>(null);

  const { policies, loading, error, create, update, setEnabled, remove } = usePolicies();

  return (
    <div>
      <PageHeader
        title={t("policies.title")}
        subtitle={t("policies.subtitle")}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" /> {t("policies.addPolicy")}
          </Button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : !policies || policies.length === 0 ? (
        <EmptyState label={t("policies.empty")} hint={t("policies.emptyHint")} />
      ) : (
        <div className="space-y-3">
          {policies.map((p) => (
            <div
              key={p.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{p.title ?? p.key ?? t("policies.titleLabel")}</p>
                  <Badge
                    className={
                      p.enabled
                        ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
                        : "bg-muted text-muted-foreground ring-border"
                    }
                  >
                    {p.enabled ? t("policies.enabled") : t("policies.disabled")}
                  </Badge>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{p.content}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Switch checked={p.enabled} onCheckedChange={(v) => void setEnabled(p.id, v)} />
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditing(p)}>
                  <Pencil className="size-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-destructive hover:text-destructive"
                  onClick={() => void remove(p.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <PolicyDialog
          policy={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onCreate={(input) => create(input)}
          onUpdate={(id, patch) => update(id, patch)}
        />
      ) : null}
    </div>
  );
}

function PolicyDialog({
  policy,
  onClose,
  onCreate,
  onUpdate,
}: {
  policy: Policy | null;
  onClose: () => void;
  onCreate: (input: PolicyInput) => Promise<unknown>;
  onUpdate: (id: string, patch: Partial<PolicyInput>) => Promise<unknown>;
}) {
  const { t } = useLang();
  const [title, setTitle] = useState(policy?.title ?? "");
  const [key, setKey] = useState(policy?.key ?? "");
  const [content, setContent] = useState(policy?.content ?? "");
  const [enabled, setEnabled] = useState(policy?.enabled ?? true);
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const input: PolicyInput = {
        title: title.trim(),
        content: content.trim(),
        enabled,
        key: key.trim() || null,
      };
      if (policy) await onUpdate(policy.id, input);
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
            {policy ? t("policies.editPolicy") : t("policies.addPolicy")}
          </DialogTitle>
          <DialogDescription>{t("policies.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>{t("policies.titleLabel")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Key</Label>
            <Input value={key} onChange={(e) => setKey(e.target.value)} className="mt-1" placeholder="shipping, returns…" />
          </div>
          <div>
            <Label>{t("policies.content")}</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="mt-1" rows={5} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <span className="text-sm text-muted-foreground">{t("policies.enabled")}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={() => void onSave()} disabled={saving || !title.trim() || !content.trim()}>
            {saving ? t("common.loading") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
