import { db } from "@/lib/supabase";
import { when } from "@/lib/format";
import { PageHead, Badge, ErrorBox, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Stores() {
  let rows: any[] = [];
  try {
    const sb = db();
    const { data, error } = await sb
      .from("stores")
      .select("id,name,subscription_status,bot_active,manager_chat_id,customer_bot_model,subscription_end_date,plans(name)")
      .order("name");
    if (error) throw error;
    rows = data ?? [];
  } catch (e: any) {
    return (<><PageHead title="المتاجر" /><ErrorBox message={e?.message ?? String(e)} /></>);
  }

  return (
    <>
      <PageHead title="المتاجر" sub="حالة كل متجر على المنصّة." />

      {rows.length === 0 ? (
        <Empty title="لا متاجر مسجّلة" />
      ) : (
        <div className="space-y-3">
          {rows.map((s) => {
            const live = ["active", "trial"].includes(s.subscription_status);
            const silent = !live || s.bot_active === false;
            return (
              <div key={s.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-medium">{s.name}</span>
                  <Badge tone={live ? "good" : "alert"}>{s.subscription_status}</Badge>
                  {s.plans?.name && <Badge tone="petrol">{s.plans.name}</Badge>}
                  {silent && <Badge tone="amber">البوت صامت</Badge>}
                </div>
                <dl className="grid sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  <Field k="الموديل" v={s.customer_bot_model} mono />
                  <Field k="نهاية الاشتراك" v={s.subscription_end_date ? when(s.subscription_end_date) : null} />
                  <Field k="معرّف المدير" v={s.manager_chat_id} mono />
                </dl>
                {!s.manager_chat_id && (
                  <p className="text-xs text-alert mt-3">
                    لا يوجد معرّف محادثة للمدير — لن تصله أي تنبيهات. يحتاج
                    <span className="id"> /start </span>
                    من حساب المدير لبوت المدير.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function Field({ k, v, mono }: { k: string; v?: string | null; mono?: boolean }) {
  return (
    <div>
      <dt className="label">{k}</dt>
      <dd className={`mt-0.5 ${mono ? "id text-xs" : ""}`}>{v || "—"}</dd>
    </div>
  );
}
