import { db } from "@/lib/supabase";
import { money, num, ago, ORDER_STATUS } from "@/lib/format";
import { AttentionStrip, Stat, PageHead, ErrorBox, Badge } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Overview() {
  let data;
  try {
    const sb = db();
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [pending, followups, escalations, outOfStock, recent, month, stores] =
      await Promise.all([
        sb.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_confirmation"),
        sb.from("pending_followups").select("id", { count: "exact", head: true }).eq("status", "pending"),
        sb.from("conversations").select("id", { count: "exact", head: true }).eq("bot_muted", true),
        sb.from("products").select("id", { count: "exact", head: true }).lte("stock", 0),
        sb.from("orders")
          .select("id,status,total_amount,currency,recipient_name,created_at")
          .order("created_at", { ascending: false }).limit(8),
        sb.from("orders").select("status,total_amount").gte("created_at", since),
        sb.from("stores").select("id", { count: "exact", head: true }),
      ]);

    const err = [pending, followups, escalations, outOfStock, recent, month, stores]
      .find((r: any) => r.error)?.error;
    if (err) throw err;

    const rows = (month.data ?? []) as { status: string; total_amount: number | null }[];
    const earning = rows.filter((r) => ["confirmed", "delivered", "customer_reviewed"].includes(r.status));
    const revenue = earning.reduce((s, r) => s + (r.total_amount ?? 0), 0);
    const rejected = rows.filter((r) => ["rejected", "cancelled"].includes(r.status)).length;

    data = {
      pending: pending.count ?? 0,
      followups: followups.count ?? 0,
      escalations: escalations.count ?? 0,
      outOfStock: outOfStock.count ?? 0,
      stores: stores.count ?? 0,
      recent: recent.data ?? [],
      monthOrders: rows.length,
      revenue,
      rejectRate: rows.length ? Math.round((rejected / rows.length) * 100) : 0,
    };
  } catch (e: any) {
    return (
      <>
        <PageHead title="نظرة عامة" />
        <ErrorBox message={e?.message ?? String(e)} />
      </>
    );
  }

  return (
    <>
      <PageHead title="نظرة عامة" sub="ما يحتاج قرارك الآن، ثم أرقام آخر 30 يوماً." />

      <AttentionStrip
        items={[
          { label: "طلبات بانتظار التأكيد", count: data.pending,     href: "/orders?status=pending_confirmation", tone: "amber" },
          { label: "أسئلة معلّقة",           count: data.followups,   href: "/followups",   tone: "petrol" },
          { label: "محادثات مكتومة",         count: data.escalations, href: "/escalations", tone: "alert" },
          { label: "منتجات نافذة",           count: data.outOfStock,  href: "/catalog?stock=out", tone: "muted" },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="إيرادات 30 يوماً" value={money(data.revenue)} hint="مؤكد ومُسلَّم فقط" />
        <Stat label="طلبات 30 يوماً" value={num(data.monthOrders)} />
        <Stat label="نسبة الرفض والإلغاء" value={`${data.rejectRate}%`} hint="من كل الطلبات" />
        <Stat label="المتاجر" value={num(data.stores)} />
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 h-12 border-b border-line">
          <h2 className="text-sm font-medium">آخر الطلبات</h2>
          <Link href="/orders" className="text-sm text-petrol hover:underline">عرض الكل</Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">لا طلبات بعد.</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.recent.map((o: any) => {
              const s = ORDER_STATUS[o.status] ?? { label: o.status, tone: "muted" as const };
              return (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-paper transition-colors">
                    <Badge tone={s.tone}>{s.label}</Badge>
                    <span className="flex-1 truncate text-sm">{o.recipient_name || "—"}</span>
                    <span className="text-sm font-medium">{money(o.total_amount)}</span>
                    <span className="text-xs text-muted w-24 text-left">{ago(o.created_at)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
