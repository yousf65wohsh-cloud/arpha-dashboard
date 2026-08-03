import { db } from "@/lib/supabase";
import { money, when, ORDER_STATUS } from "@/lib/format";
import { PageHead, Badge, ErrorBox } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrderDetail({ params }: { params: { id: string } }) {
  let order: any, items: any[] = [], log: any[] = [];
  try {
    const sb = db();
    const [o, i, l] = await Promise.all([
      sb.from("orders").select("*").eq("id", params.id).single(),
      sb.from("order_items").select("*").eq("order_id", params.id),
      sb.from("order_status_log").select("*").eq("order_id", params.id).order("changed_at", { ascending: true }),
    ]);
    if (o.error) throw o.error;
    order = o.data; items = i.data ?? []; log = l.data ?? [];
  } catch (e: any) {
    return (<><PageHead title="الطلب" /><ErrorBox message={e?.message ?? String(e)} /></>);
  }

  const s = ORDER_STATUS[order.status] ?? { label: order.status, tone: "muted" as const };

  return (
    <>
      <Link href="/orders" className="text-sm text-petrol hover:underline">← الطلبات</Link>
      <PageHead
        title={`طلب ${String(order.id).slice(0, 8)}`}
        sub={when(order.created_at)}
        action={<Badge tone={s.tone}>{s.label}</Badge>}
      />

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-medium">المستلِم</h2>
          <Row k="الاسم" v={order.recipient_name} />
          <Row k="الهاتف" v={order.recipient_phone} mono />
          <Row k="العنوان" v={order.delivery_address} />
          {order.notes && <Row k="ملاحظات" v={order.notes} />}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-medium mb-3">العناصر</h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted">لا عناصر مسجّلة.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 text-sm">
                  <span className="text-muted">{it.quantity}×</span>
                  <span className="flex-1 truncate">{it.notes || it.item_type}</span>
                  <span className="font-medium">{money(it.subtotal)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between items-baseline border-t border-line mt-4 pt-3">
            <span className="label">المجموع</span>
            <span className="text-lg font-semibold">{money(order.total_amount)}</span>
          </div>
          <p className="text-[11px] text-muted mt-2">
            يُحسب تلقائياً من العناصر. لتغييره، غيّر العناصر.
          </p>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="text-sm font-medium mb-4">مسار الحالة</h2>
        {log.length === 0 ? (
          <p className="text-sm text-muted">لا انتقالات مسجّلة بعد.</p>
        ) : (
          <ol className="space-y-3">
            {log.map((e) => (
              <li key={e.id} className="flex gap-3 items-start">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-petrol shrink-0" />
                <div className="text-sm">
                  <div>
                    {ORDER_STATUS[e.from_status]?.label ?? e.from_status ?? "—"}
                    <span className="text-muted mx-2">→</span>
                    {ORDER_STATUS[e.to_status]?.label ?? e.to_status}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {when(e.changed_at)} · {e.changed_by}{e.reason ? ` · ${e.reason}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="text-xs text-muted mt-6 leading-relaxed">
        تأكيد الطلب ورفضه يتمّان من أزرار بوت المدير في تيليجرام — الأزرار تُخبر الزبون
        وتسجّل الانتقال بشكل صحيح. هذه الصفحة للعرض والمراجعة.
      </p>
    </>
  );
}

function Row({ k, v, mono }: { k: string; v?: string | null; mono?: boolean }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="label w-20 shrink-0 pt-0.5">{k}</span>
      <span className={mono ? "id" : ""}>{v || "—"}</span>
    </div>
  );
}
