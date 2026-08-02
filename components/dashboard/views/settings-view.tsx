"use client";

import { useState } from "react";
import { Bot, Check, Globe, KeyRound, Save, ShieldCheck, Store } from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLang } from "@/components/dashboard/lang-provider";
import { cn } from "@/lib/utils";

function SaveButton() {
  const { t } = useLang();
  const [saved, setSaved] = useState(false);
  return (
    <Button
      size="sm"
      onClick={() => {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
      }}
    >
      {saved ? (
        <>
          <Check className="size-4" /> {t("common.saved")}
        </>
      ) : (
        <>
          <Save className="size-4" /> {t("common.save")}
        </>
      )}
    </Button>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

export function SettingsView() {
  const { lang, setLang, t } = useLang();
  const [twoFa, setTwoFa] = useState(true);
  const [autoRenew, setAutoRenew] = useState(true);
  const [autoReply, setAutoReply] = useState(true);

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="h-auto w-full flex-wrap justify-start">
        <TabsTrigger value="general">{t("settings.general")}</TabsTrigger>
        <TabsTrigger value="bot">{t("settings.bot")}</TabsTrigger>
        <TabsTrigger value="billing">{t("settings.billing")}</TabsTrigger>
        <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
        <TabsTrigger value="language">{t("settings.language")}</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Panel title={t("settings.storeProfile")} subtitle={t("settings.storeProfileSub")} titleIcon={<Store className="size-4" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("settings.storeName")} hint={t("settings.storeNameHint")}>
              <Input defaultValue="Baghdad Beauty" />
            </Field>
            <Field label={t("settings.city")}>
              <Select defaultValue="Baghdad">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baghdad">{t("settings.city.Baghdad")}</SelectItem>
                  <SelectItem value="Basra">{t("settings.city.Basra")}</SelectItem>
                  <SelectItem value="Erbil">{t("settings.city.Erbil")}</SelectItem>
                  <SelectItem value="Mosul">{t("settings.city.Mosul")}</SelectItem>
                  <SelectItem value="Sulaymaniyah">{t("settings.city.Sulaymaniyah")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("settings.currency")}>
              <Select defaultValue="IQD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IQD">{t("settings.currencyIqd")}</SelectItem>
                  <SelectItem value="USD">{t("settings.currencyUsd")}</SelectItem>
                  <SelectItem value="EUR">{t("settings.currencyEur")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("settings.phone")}>
              <Input defaultValue="+964 770 000 0001" />
            </Field>
            <Field label={t("settings.address")}>
              <Textarea defaultValue="Karrada, Building 12, Apt 4 — Baghdad" />
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <SaveButton />
          </div>
        </Panel>
      </TabsContent>

      <TabsContent value="bot">
        <Panel title={t("settings.telegramBot")} subtitle={t("settings.telegramBotSub")} titleIcon={<Bot className="size-4" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("settings.botName")}>
              <Input defaultValue="Arpha Assistant" />
            </Field>
            <Field label={t("settings.welcomeLanguage")}>
              <Select defaultValue="ar+en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar+en">{t("settings.arEn")}</SelectItem>
                  <SelectItem value="en">{t("settings.enOnly")}</SelectItem>
                  <SelectItem value="ar">{t("settings.arOnly")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("settings.welcomeMessage")} hint={t("settings.welcomeHint")}>
                <Textarea defaultValue={t("settings.welcomeDefault")} />
              </Field>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-foreground">{t("settings.autoReply")}</p>
              <p className="text-[11px] text-muted">{t("settings.autoReplyDesc")}</p>
            </div>
            <Switch checked={autoReply} onCheckedChange={setAutoReply} />
          </div>
          <div className="mt-5 flex justify-end">
            <SaveButton />
          </div>
        </Panel>
      </TabsContent>

      <TabsContent value="billing">
        <Panel title={t("settings.billingPrefs")} subtitle={t("settings.billingPrefsSub")} titleIcon={<ShieldCheck className="size-4" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("settings.invoiceEmail")}>
              <Input defaultValue="billing@baghdadbeauty.iq" type="email" />
            </Field>
            <Field label={t("settings.invoiceCurrency")}>
              <Select defaultValue="IQD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IQD">IQD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-foreground">{t("settings.autoRenew")}</p>
              <p className="text-[11px] text-muted">{t("settings.autoRenewDesc")}</p>
            </div>
            <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
          </div>
          <div className="mt-5 flex justify-end">
            <SaveButton />
          </div>
        </Panel>
      </TabsContent>

      <TabsContent value="security">
        <Panel title={t("settings.securityTitle")} subtitle={t("settings.securitySub")} titleIcon={<KeyRound className="size-4" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("settings.currentPassword")}>
              <Input type="password" defaultValue="••••••••••••" />
            </Field>
            <Field label={t("settings.newPassword")}>
              <Input type="password" placeholder={t("settings.newPasswordPlaceholder")} />
            </Field>
            <Field label={t("settings.confirmNew")}>
              <Input type="password" placeholder={t("settings.confirmNewPlaceholder")} />
            </Field>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-foreground">{t("settings.twoFactor")}</p>
              <p className="text-[11px] text-muted">{t("settings.twoFactorDesc")}</p>
            </div>
            <Switch checked={twoFa} onCheckedChange={setTwoFa} />
          </div>
          <div className="mt-5 flex justify-end">
            <SaveButton />
          </div>
        </Panel>
      </TabsContent>

      <TabsContent value="language">
        <Panel title={t("settings.languageTitle")} subtitle={t("settings.languageSub")} titleIcon={<Globe className="size-4" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                { value: "en", label: t("settings.langEn"), sub: t("settings.langEnSub"), mark: "EN" },
                { value: "ar", label: t("settings.langAr"), sub: t("settings.langArSub"), mark: "ع" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLang(option.value)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-4 text-start transition-all",
                  lang === option.value
                    ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_12px_40px_-16px_rgba(79,70,229,0.5)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]",
                )}
              >
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold",
                    lang === option.value
                      ? "bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white"
                      : "bg-white/[0.06] text-muted",
                  )}
                >
                  {option.mark}
                </span>
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold text-foreground">{option.label}</span>
                  <span className="block text-[11.5px] text-muted">{option.sub}</span>
                </span>
                {lang === option.value && (
                  <span className="grid size-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
                    <Check className="size-3.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-muted">
            {t("settings.rtlNote")}
          </p>
        </Panel>
      </TabsContent>
    </Tabs>
  );
}
