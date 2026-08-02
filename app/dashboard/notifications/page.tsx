"use client";

import { useState } from "react";
import { BellRing, Check, UserRound } from "lucide-react";
import { useLang } from "@/components/dashboard/lang-provider";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/shell/states";
import { useFollowups } from "@/hooks/use-followups";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FollowupStatus } from "@/lib/supabase/database.types";

const TABS: Array<FollowupStatus | "all"> = ["all", "pending", "resolved"];

export default function NotificationsPage() {
  const { lang, t } = useLang();
  const [status, setStatus] = useState<FollowupStatus | "all">("pending");

  const { followups, loading, error, resolve } = useFollowups(status);

  return (
    <div>
      <PageHeader title={t("notifications.title")} subtitle={t("notifications.subtitle")} />

      <div className="mb-3 flex items-center gap-1">
        {TABS.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "ghost"}
            className="text-xs"
            onClick={() => setStatus(s)}
          >
            {s === "all" ? t("common.all") : t(`notifications.${s}`)}
          </Button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : !followups || followups.length === 0 ? (
        <EmptyState label={t("notifications.allCaughtUp")} hint={t("shell.noNotifications")} />
      ) : (
        <div className="space-y-2">
          {followups.map((f) => (
            <div
              key={f.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {f.type === "customer" ? <UserRound className="size-4" /> : <BellRing className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {f.customer?.name ?? t("conv.customer")}
                  </p>
                  {f.type ? <Badge className="bg-primary/10 text-primary ring-primary/20">{f.type}</Badge> : null}
                  <Badge
                    className={
                      f.status === "pending"
                        ? "bg-amber-500/10 text-amber-500 ring-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
                    }
                  >
                    {t(`notifications.${f.status}`)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-foreground">{f.question}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(new Date(f.createdAt).getDate(), lang)}/
                  {new Date(f.createdAt).getMonth() + 1}/
                  {new Date(f.createdAt).getFullYear()}
                </p>
              </div>
              {f.status === "pending" ? (
                <Button size="sm" onClick={() => void resolve(f.id)}>
                  <Check className="size-4" /> {t("notifications.resolve")}
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
