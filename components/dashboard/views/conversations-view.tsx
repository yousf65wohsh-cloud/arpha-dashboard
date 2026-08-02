"use client";

import { useMemo, useState } from "react";
import { Bot, CheckCheck, Send, UserRound } from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/dashboard/customers-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONVERSATIONS } from "@/lib/dashboard-data";
import type { ChatMessage, Conversation } from "@/types/dashboard";
import { useLang } from "@/components/dashboard/lang-provider";
import { localizeLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STATUS_BADGE = {
  open: { label: "conversations.statusOpen", variant: "success" as const },
  awaiting: { label: "conversations.statusAwaiting", variant: "warning" as const },
  resolved: { label: "conversations.statusResolved", variant: "neutral" as const },
};

function MessageBubble({ msg, t }: { msg: ChatMessage; t: (k: string) => string }) {
  const isCustomer = msg.actor === "customer";
  const isBot = msg.actor === "bot";
  return (
    <div className={cn("flex gap-2.5", isCustomer ? "flex-row" : "flex-row-reverse")}>
      <span
        className={cn(
          "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full",
          isCustomer
            ? "bg-white/[0.06] text-muted"
            : isBot
              ? "bg-indigo-500/20 text-indigo-300"
              : "bg-cyan-500/20 text-cyan-300",
        )}
      >
        {isCustomer ? <UserRound className="size-3.5" /> : <Bot className="size-3.5" />}
      </span>
      <div className={cn("max-w-[78%]", isCustomer ? "items-start" : "items-end")}>
        <p
          className={cn(
            "mb-0.5 text-[10px] font-medium text-muted",
            isCustomer ? "text-start" : "text-end",
          )}
        >
          {isCustomer ? t("conversations.customer") : isBot ? t("conversations.arphaAi") : t("conversations.staff")}
        </p>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
            isCustomer
              ? "rounded-ss-sm border border-white/[0.06] bg-white/[0.04] text-foreground"
              : isBot
                ? "rounded-se-sm bg-gradient-to-b from-indigo-500/25 to-indigo-500/15 text-indigo-50 ring-1 ring-inset ring-indigo-500/25"
                : "rounded-se-sm bg-gradient-to-b from-cyan-500/25 to-cyan-500/15 text-cyan-50 ring-1 ring-inset ring-cyan-500/25",
          )}
        >
          {msg.text}
        </div>
        <p className={cn("mt-0.5 text-[10px] text-muted/70", isCustomer ? "text-start" : "text-end")}>
          {msg.time}
        </p>
      </div>
    </div>
  );
}

export function ConversationsView() {
  const { t, lang } = useLang();
  const [threads, setThreads] = useState<Conversation[]>(CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string>(threads[0].id);
  const [draft, setDraft] = useState("");

  const selected = useMemo(
    () => threads.find((c) => c.id === selectedId) ?? threads[0],
    [threads, selectedId],
  );

  const totalUnread = threads.reduce((sum, c) => sum + c.unread, 0);
  const open = threads.filter((c) => c.status === "open").length;
  const resolved = threads.filter((c) => c.status === "resolved").length;

  const send = () => {
    if (!draft.trim()) return;
    setThreads((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              unread: 0,
              status: "open",
              preview: draft.trim(),
              lastMessageAt: "now",
              messages: [
                ...c.messages,
                { actor: "staff" as const, text: draft.trim(), time: "now" },
              ],
            }
          : c,
      ),
    );
    setDraft("");
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
      {/* Conversation list */}
      <Panel className="max-h-[calc(100vh-9rem)] lg:max-h-[calc(100vh-10rem)]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{t("conversations.title")}</p>
          <Badge variant="primary">{t("conversations.unread", { n: totalUnread })}</Badge>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2 text-center">
            <p className="text-sm font-semibold tabular-nums text-foreground">{threads.length}</p>
            <p className="text-[10px] text-muted">{t("conversations.total")}</p>
          </div>
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2 text-center">
            <p className="text-sm font-semibold tabular-nums text-emerald-300">{open}</p>
            <p className="text-[10px] text-muted">{t("conversations.open")}</p>
          </div>
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2 text-center">
            <p className="text-sm font-semibold tabular-nums text-muted">{resolved}</p>
            <p className="text-[10px] text-muted">{t("conversations.resolved")}</p>
          </div>
        </div>
        <ScrollArea className="mt-3 -mx-2 h-[calc(100%-7rem)] px-2">
          <ul className="space-y-1">
            {threads.map((c) => {
              const active = c.id === selected.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "w-full rounded-xl px-2.5 py-2.5 text-start transition-colors",
                      active ? "bg-indigo-500/12 ring-1 ring-inset ring-indigo-500/25" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={c.customer.split(" ").map((w) => w[0]).join("")} index={c.customer.length} className="size-8" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[12.5px] font-medium text-foreground">{c.customer}</p>
                          <span className="shrink-0 text-[10px] text-muted/70">{c.lastMessageAt}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[11px] text-muted">{c.preview}</p>
                          {c.unread > 0 && (
                            <span className="grid size-4 shrink-0 place-items-center rounded-full bg-indigo-500 text-[9px] font-semibold text-white">
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </Panel>

      {/* Thread */}
      <Panel className="flex max-h-[calc(100vh-9rem)] flex-col lg:max-h-[calc(100vh-10rem)]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
          <Avatar
            initials={selected.customer.split(" ").map((w) => w[0]).join("")}
            index={selected.customer.length}
            className="size-9"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground">{selected.customer}</p>
            <p className="text-[11px] text-muted">{t("conversations.via", { handle: selected.handle, channel: localizeLabel(lang, "Telegram") })}</p>
          </div>
          <div className="flex items-center gap-2">
            {selected.botHandled && (
              <Badge variant="accent">
                <Bot className="size-3" />
                {t("conversations.botHandled")}
              </Badge>
            )}
            <Badge variant={STATUS_BADGE[selected.status].variant}>
              {t(STATUS_BADGE[selected.status].label)}
            </Badge>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 py-4">
          <div className="space-y-4">
            {selected.messages.map((m, i) => (
              <MessageBubble key={i} msg={m} t={t} />
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 border-t border-white/[0.06] pt-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder={t("conversations.replyPlaceholder")}
            className="h-10 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[13px] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={send}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.8)] transition-all hover:brightness-110 active:scale-95"
          >
            <Send className="size-4 rtl:-scale-x-100" />
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-muted/70">
          <CheckCheck className="size-3.5 text-emerald-400" />
          {t("conversations.note")}
        </p>
      </Panel>
    </div>
  );
}
