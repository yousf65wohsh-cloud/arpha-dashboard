import { db } from "@/lib/supabase";
import { when, ago } from "@/lib/format";
import { PageHead, Badge, ErrorBox, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

const SOURCE: Record<string, string> = {
  auto_content: "تصنيف المحتوى",
  auto_length:  "تجاوز 25 رسالة",
  manager_command: "أمر المدير",
};

const REASON: Record<string, string> = {
  bulk_or_out_of_pattern: "طلب جملة أو خارج النمط",
  aggressive: "لغة عدوانية",
  jailbreak:  "محاولة تجاوز التعليمات",
};

export default async function Escalations() {
  let rows: any[] = [];
  try {
    const sb = db();
    const { data, error } = await sb
      .from("conversations")
      .select("id,bot_muted,muted_at,mute_source,mute_type,escalation_reason,escalated_at,last_message_at,bot_message_count")
      .eq("bot_muted", true)
      .order("muted_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    rows = data ?? [];
  } catch (e: any) {
    return (<><PageHead title="تصعيدات" /><ErrorBox message={e?.message ?? String(e)} /></>);
  }

  return (
    <>
      <PageHead title="تصعيدات" sub="محادثات البوت صامت فيها الآن." />

      {rows.length === 0 ? (
        <Empty title="لا تصعيدات مفتوحة" hint="البوت يرد على كل المحادثات." />
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-line">
            {rows.map((c) => {
              const temporary = c.mute_type === "temporary";
              const hoursLeft = temporary && c.muted_at
                ? Math.max(0, 24 - Math.floor((Date.now() - new Date(c.muted_at).getTime()) / 3600000))
                : null;
              return (
                <li key={c.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <Badge tone={temporary ? "amber" : "alert"}>
                      {temporary ? "كتم مؤقت" : "كتم دائم"}
                    </Badge>
                    <span className="text-sm">{SOURCE[c.mute_source] ?? c.mute_source ?? "—"}</span>
                    {c.escalation_reason && (
                      <span className="text-sm text-muted">
                        {REASON[c.escalation_reason] ?? c.escalation_reason}
                      </span>
                    )}
                    <span className="mr-auto text-xs text-muted">{ago(c.muted_at)}</span>
                  </div>
                  <p className="text-xs text-muted">
                    {temporary
                      ? hoursLeft === 0
                        ? "يرجع تلقائياً مع الرسالة القادمة"
                        : `يرجع تلقائياً بعد ${hoursLeft} ساعة`
                      : "يحتاج «رجّع البوت» من بوت المدير"}
                    {" · "}آخر رسالة {when(c.last_message_at)}
                    {" · "}{c.bot_message_count ?? 0} رد
                  </p>
                  {!c.muted_at && (
                    <p className="text-xs text-alert mt-1">
                      لا يوجد وقت كتم مسجّل — لن يفكّ الكتم تلقائياً. يحتاج تدخّلاً يدوياً.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
