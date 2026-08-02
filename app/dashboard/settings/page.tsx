"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { ErrorState, LoadingState } from "@/components/shell/states";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BusinessHours, DayHours } from "@/types/domain";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

export default function SettingsPage() {
  const { t } = useLang();
  const { store, loading, error, update } = useStore();

  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [language, setLanguage] = useState("");
  const [botActive, setBotActive] = useState(false);
  const [hours, setHours] = useState<BusinessHours>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!store) return;
    setName(store.name ?? "");
    setPersona(store.persona ?? "");
    setAiModel(store.aiModel ?? "");
    setLanguage(store.language ?? "");
    setBotActive(store.botActive);
    setHours(store.businessHours ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!store) return null;

  function setDay(day: (typeof DAYS)[number], patch: Partial<DayHours>) {
    setHours((h) => ({
      ...h,
      [day]: { ...h[day], ...patch },
    }));
  }

  async function onSave() {
    setSaving(true);
    setSaved(false);
    try {
      await update({
        name: name.trim(),
        persona: persona.trim() || null,
        aiModel: aiModel.trim() || null,
        language: language.trim() || null,
        botActive,
        businessHours: hours,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("settings.storeProfile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{t("settings.storeName")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>{t("settings.aiModel")}</Label>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("settings.language")}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar+en">{t("settings.arEn")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("settings.botSection")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{t("settings.botActive")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.botActiveHint")}</p>
              </div>
              <Switch checked={botActive} onCheckedChange={setBotActive} />
            </div>
            <div>
              <Label>{t("settings.persona")}</Label>
              <Textarea
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder={t("settings.personaHint")}
                className="mt-1"
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("settings.businessHours")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {DAYS.map((day) => {
                const d = hours[day];
                const closed = d?.closed ?? false;
                return (
                  <div key={day} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{t(`settings.day.${day}`)}</span>
                      <Switch
                        checked={!closed}
                        onCheckedChange={(v) => setDay(day, { closed: !v })}
                        aria-label={t("settings.open")}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Input
                        type="time"
                        value={d?.open ?? "09:00"}
                        disabled={closed}
                        onChange={(e) => setDay(day, { open: e.target.value })}
                        className="h-8"
                      />
                      <span className="text-muted-foreground">—</span>
                      <Input
                        type="time"
                        value={d?.close ?? "18:00"}
                        disabled={closed}
                        onChange={(e) => setDay(day, { close: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    {closed ? (
                      <p className="mt-1 text-xs text-muted-foreground">{t("settings.closed")}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={() => void onSave()} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          {saving ? t("common.loading") : t("settings.save")}
        </Button>
        {saved ? <span className="text-sm text-emerald-500">{t("settings.saved")}</span> : null}
      </div>
    </div>
  );
}
