"use client";

import { useState } from "react";
import { BookOpen, Bot, Cpu, FileText, Package, SlidersHorizontal, Table2 } from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiUsageView } from "@/components/dashboard/views/ai-usage-view";
import { useLang } from "@/components/dashboard/lang-provider";
import { AI_CONFIG } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const KNOWLEDGE_ICON: Record<string, { icon: typeof Package; cls: string }> = {
  catalog: { icon: Package, cls: "bg-indigo-500/12 text-indigo-300 ring-indigo-500/25" },
  document: { icon: FileText, cls: "bg-cyan-500/12 text-cyan-300 ring-cyan-500/25" },
  sheet: { icon: Table2, cls: "bg-emerald-500/12 text-emerald-300 ring-emerald-500/25" },
};

export function AiCenterView() {
  const { t } = useLang();
  const [model, setModel] = useState(AI_CONFIG.model);
  const [temperature, setTemperature] = useState(String(AI_CONFIG.temperature));
  const [botName, setBotName] = useState(AI_CONFIG.botName);
  const [memory, setMemory] = useState(AI_CONFIG.memory);
  const [prompt, setPrompt] = useState(AI_CONFIG.prompt);
  const [saved, setSaved] = useState(false);

  const toggleMemory = (id: string) =>
    setMemory((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-3">
      <AiUsageView />

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Model & behavior */}
        <Panel
          title={t("ai.modelBehavior")}
          subtitle={t("ai.theBrain")}
          titleIcon={<Cpu className="size-4" />}
          action={<Badge variant="success">{t("common.online")}</Badge>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>{t("ai.model")}</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                    <SelectItem value="claude-sonnet-4">claude-sonnet-4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t("ai.temperature")}</Label>
                <Select value={temperature} onValueChange={setTemperature}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.2">{`0.2 · ${t("ai.precise")}`}</SelectItem>
                    <SelectItem value="0.6">{`0.6 · ${t("ai.balanced")}`}</SelectItem>
                    <SelectItem value="0.9">{`0.9 · ${t("ai.creative")}`}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("ai.botName")}</Label>
              <Input value={botName} onChange={(e) => setBotName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>{t("ai.systemPrompt")}</Label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-[12px] leading-relaxed text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={save}>
                {saved ? t("common.saved") : t("common.save")}
              </Button>
            </div>
          </div>
        </Panel>

        <div className="space-y-3">
          {/* Memory */}
          <Panel
            title={t("ai.memory")}
            subtitle={t("ai.memorySub")}
            titleIcon={<BookOpen className="size-4" />}
          >
            <ul className="space-y-2">
              {memory.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground">{t(m.key)}</p>
                    <p className="truncate text-[11px] text-muted">{t(m.descKey)}</p>
                  </div>
                  <Switch checked={m.enabled} onCheckedChange={() => toggleMemory(m.id)} />
                </li>
              ))}
            </ul>
          </Panel>

          {/* Knowledge base */}
          <Panel
            title={t("ai.knowledge")}
            subtitle={t("ai.knowledgeSub")}
            titleIcon={<SlidersHorizontal className="size-4" />}
          >
            <ul className="space-y-2">
              {AI_CONFIG.knowledge.map((k) => {
                const meta = KNOWLEDGE_ICON[k.type] ?? KNOWLEDGE_ICON.document;
                return (
                  <li key={k.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg ring-1", meta.cls)}>
                      <meta.icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-foreground">{t(k.titleKey)}</p>
                      <p className="truncate text-[11px] text-muted">{t(k.descKey)}</p>
                    </div>
                    <Badge variant={k.status === "synced" ? "success" : "warning"}>
                      {k.status === "synced" ? t("common.synced") : t("ai.update")}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title={t("ai.personality")} subtitle={t("ai.personalitySub")} titleIcon={<Bot className="size-4" />}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AI_CONFIG.personality.map((p) => (
            <div key={p.key} className="rounded-xl border border-white/[0.05] bg-white/[0.025] px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{t(p.key)}</p>
              <p className="mt-1 text-[13px] font-medium text-foreground">{t(p.value)}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <p className="text-[12px] text-muted">{t("ai.personalityNote")}</p>
      </Panel>
    </div>
  );
}
