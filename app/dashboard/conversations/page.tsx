"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BellOff,
  CheckCheck,
  Loader2,
  MessageSquareText,
  Send,
  UserRound,
  Volume2,
} from "lucide-react";
import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/shell/states";
import { useConversations, useConversationDetail } from "@/hooks/use-conversations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ConversationStatus } from "@/lib/supabase/database.types";

const STATUS_OPTIONS: Array<ConversationStatus | "all"> = ["all", "open", "awaiting", "resolved"];

function formatTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function ConversationsPage() {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ConversationStatus | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { conversations, loading, error, updateStatus, toggleMute, takeOver, markRead } =
    useConversations({ search, status, unreadOnly });

  const selected = conversations?.find((c) => c.id === selectedId) ?? null;

  const setActive = (id: string) => {
    setSelectedId(id);
    void markRead(id);
  };

  return (
    <div>
      <PageHeader title={t("conv.title")} subtitle={t("conv.subtitle")} />

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* List */}
        <div className={cn("w-full lg:w-96 lg:shrink-0", selectedId && "hidden lg:block")}>
          <div className="rounded-xl border border-border bg-card p-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("conv.searchPlaceholder")}
              className="mb-3"
            />
            <div className="mb-3 flex items-center gap-1 overflow-x-auto">
              {STATUS_OPTIONS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={status === s ? "default" : "ghost"}
                  className="shrink-0 text-xs"
                  onClick={() => setStatus(s)}
                >
                  {s === "all" ? t("common.all") : t(`conv.status.${s}`)}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className={cn("shrink-0 text-xs", unreadOnly && "text-primary")}
                onClick={() => setUnreadOnly((v) => !v)}
              >
                {t("conv.unread")}
              </Button>
            </div>

            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error.message} />
            ) : !conversations || conversations.length === 0 ? (
              <EmptyState label={t("conv.empty")} hint={t("conv.emptyHint")} />
            ) : (
              <ScrollArea className="h-[calc(100vh-320px)] min-h-64">
                <ul className="space-y-1">
                  {conversations.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => setActive(c.id)}
                        className={cn(
                          "w-full rounded-lg px-3 py-2.5 text-start transition-colors",
                          selected?.id === c.id
                            ? "bg-primary/10"
                            : "hover:bg-muted/60",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <UserRound className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-medium text-foreground">
                                {c.customer?.name ?? t("conv.customer")}
                              </p>
                              <span className="shrink-0 text-[11px] text-muted-foreground">
                                {formatTime(c.lastMessageAt)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-xs text-muted-foreground">
                                {c.lastMessage ?? "â€”"}
                              </p>
                              {c.unreadCount > 0 ? (
                                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                                  {c.unreadCount}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Chat pane */}
        <div className={cn("flex-1", !selectedId && "hidden lg:block")}>
          {selectedId ? (
            <ChatPane
              conversationId={selectedId}
              onBack={() => setSelectedId(null)}
              onStatus={updateStatus}
              onMute={toggleMute}
              onTakeOver={takeOver}
            />
          ) : (
            <div className="flex h-full min-h-96 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/40 text-center">
              <MessageSquareText className="size-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">{t("conv.noSelection")}</p>
              <p className="text-xs text-muted-foreground">{t("conv.noSelectionHint")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatPane({
  conversationId,
  onBack,
  onStatus,
  onMute,
  onTakeOver,
}: {
  conversationId: string;
  onBack: () => void;
  onStatus: (id: string, status: ConversationStatus) => void;
  onMute: (id: string, muted: boolean) => void;
  onTakeOver: (id: string) => void;
}) {
  const { t } = useLang();
  const { detail, loading, error, sendMessage } = useConversationDetail(conversationId);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conv = detail?.conversation;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [detail?.messages?.length, conversationId]);

  const messages = useMemo(() => detail?.messages ?? [], [detail]);

  async function onSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await sendMessage(text, "staff");
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button className="lg:hidden" onClick={onBack}>
          <span className="text-muted-foreground">â†</span>
        </button>
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserRound className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {detail?.customer?.name ?? t("conv.customer")}
          </p>
          <p className="text-xs text-muted-foreground">
            {detail?.customer?.phone ?? detail?.customer?.telegram ?? t("conv.channel")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {conv?.botHandled ? (
            <Badge className="bg-emerald-500/10 text-emerald-500 ring-emerald-500/20">
              {t("conv.botHandled")}
            </Badge>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => conv && onTakeOver(conv.id)}
          >
            {t("conv.takeOver")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => conv && onMute(conv.id, !conv.muted)}
          >
            {conv?.muted ? <BellOff className="size-4" /> : <Volume2 className="size-4" />}
            {conv?.muted ? t("conv.unmute") : t("conv.mute")}
          </Button>
          {conv && conv.status !== "resolved" ? (
            <Button size="sm" variant="ghost" onClick={() => onStatus(conv.id, "resolved")}>
              {t("conv.markResolved")}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {loading ? (
            <LoadingState label={t("common.loading")} />
          ) : error ? (
            <ErrorState message={error.message} />
          ) : messages.length === 0 ? (
            <EmptyState label={t("conv.empty")} />
          ) : (
            messages.map((m) => {
              const isCustomer = m.actor === "customer";
              return (
                <div
                  key={m.id}
                  className={cn("flex", isCustomer ? "justify-start" : "justify-end")}
                >
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      isCustomer
                        ? "rounded-bl-sm bg-muted text-foreground"
                        : "rounded-br-sm bg-primary text-primary-foreground",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        isCustomer ? "text-muted-foreground" : "text-primary-foreground/70",
                      )}
                    >
                      {formatTime(m.createdAt)}
                      {!isCustomer ? <CheckCheck className="ms-1 inline size-3" /> : null}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
            placeholder={t("conv.typeMessage")}
            className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-ring placeholder:text-muted-foreground focus-visible:ring-2"
          />
          <Button size="icon" onClick={() => void onSend()} disabled={sending || !draft.trim()}>
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}


