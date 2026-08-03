import { db } from "@/lib/supabase";
import { money, when, ORDER_STATUS } from "@/lib/format";
import { PageHead, Badge, ErrorBox, Empty } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "",                     label: "الكل" },
  { key: "pending_confirmation", label: "بانتظار التأكيد" },
  { key: "confirmed",            label: "مؤكد" },
  { key: "delivered",            label: "مُسلَّم" },
  { key: "rejected",             label: "مرفوض" },
];

export default async function Orders({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const status = searchParams.status ?? "";
  const q = (searchParams.q ?? "").trim();

  let rows: any[] = [];
  try {
    const sb = db();
    let query = sb
      .from("orders")
      .select("id,status,total_amount,currency,recipient_name,recipient_phone,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (status) query = query.eq("status", status);
    if (q) query = query.ilike("recipient_phone", `%${q}%`);
    const { data, error } = await query;
    if (error) throw error;
    rows = data ?? [];
  } catch (e: any) {
    return (<><PageHead title="الطلبات" /><ErrorBox message={e?.message ?? String(e)} /></>);
  }

  return (
    <>
      <PageHead title="الطلبات" sub="آخر 100 طلب. ابحث برقم الهاتف." />

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {FILTERS.map((f) => (
          <Link
            key={f.key || "all"}
            href={f.key ? `/orders?status=${f.key}` : "/orders"}
            className={`rounded-lg px-3 h-9 flex items-center text-sm border transition-colors ${
              status === f.key ? "bg-petrol text-white border-petrol" : "bg-card border-line hover:bg-paper"
            }`}
          >
            {f.label}
          </Link>
        ))}
        <form className="md:mr-auto flex gap-2" action="/orders">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="رقم الهاتف" className="field w-44" />
          <button className="btn-quiet">بحث</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <Empty title="لا طلبات مطابقة" hint="جرّب مرشّحاً آخر أو رقماً مختلفاً." />
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-line">
            {rows.map((o) => {
              const s = ORDER_STATUS[o.status] ?? { label: o.status, tone: "muted" as const };
              return (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-paper transition-colors">
                    <Badge tone={s.tone}>{s.label}</Badge>
                    <span className="font-medium text-sm">{o.recipient_name || "—"}</span>
                    <span className="id text-xs text-muted">{o.recipient_phone || "—"}</span>
                    <span className="mr-auto text-sm font-medium">{money(o.total_amount)}</span>
                    <span className="text-xs text-muted w-full md:w-auto">{when(o.created_at)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
