import { db } from "@/lib/supabase";
import { when, GAP_TYPE } from "@/lib/format";
import { PageHead, Badge, ErrorBox, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Followups() {
  let rows: any[] = [];
  try {
    const sb = db();
    const { data, error } = await sb
      .from("pending_followups")
      .select("id,gap_type,question_text,status,created_at,resolved_answer,resolved_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    rows = data ?? [];
  } catch (e: any) {
    return (<><PageHead title="أسئلة معلّقة" /><ErrorBox message={e?.message ?? String(e)} /></>);
  }

  const open = rows.filter((r) => r.status === "pending");
  const done = rows.filter((r) => r.status !== "pending");

  return (
    <>
      <PageHead
        title="أسئلة معلّقة"
        sub="أسئلة عجز البوت عن جوابها. كل جواب تحفظه دائماً يصير معرفة للبوت."
      />

      {open.length === 0 ? (
        <Empty title="لا أسئلة معلّقة" hint="البوت جاوب على كل شيء سُئل عنه." />
      ) : (
        <div className="card overflow-hidden mb-8">
          <div className="px-5 h-12 flex items-center border-b border-line">
            <h2 className="text-sm font-medium">تنتظر جواباً — {open.length}</h2>
          </div>
          <ul className="divide-y divide-line">
            {open.map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-1.5">
                  <Badge tone="amber">{GAP_TYPE[r.gap_type] ?? r.gap_type}</Badge>
                  <span className="text-xs text-muted">{when(r.created_at)}</span>
                </div>
                <p className="text-sm leading-relaxed">{r.question_text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {done.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 h-12 flex items-center border-b border-line">
            <h2 className="text-sm font-medium text-muted">مُجابة</h2>
          </div>
          <ul className="divide-y divide-line">
            {done.map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-1.5">
                  <Badge tone="good">{GAP_TYPE[r.gap_type] ?? r.gap_type}</Badge>
                  <span className="text-xs text-muted">{when(r.resolved_at)}</span>
                </div>
                <p className="text-sm">{r.question_text}</p>
                {r.resolved_answer && (
                  <p className="text-sm text-muted mt-1.5 border-r-2 border-line pr-3">{r.resolved_answer}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted mt-6 leading-relaxed">
        الرد على سؤال يتم من بوت المدير في تيليجرام عبر «رد على الرسالة» — هناك يقرّر
        أيضاً إن كان الجواب يُحفظ دائماً بالمصدر أم يُستخدم مرة واحدة.
      </p>
    </>
  );
}
