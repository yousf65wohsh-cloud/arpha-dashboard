import { db } from "@/lib/supabase";
import { money } from "@/lib/format";
import { PageHead, Badge, ErrorBox, Empty } from "@/components/ui";
import { updateItem } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Catalog({ searchParams }: { searchParams: { stock?: string; kind?: string } }) {
  const kind = searchParams.kind === "services" ? "services" : "products";
  const onlyOut = searchParams.stock === "out";

  let rows: any[] = [];
  try {
    const sb = db();
    const qtyCol = kind === "products" ? "stock" : "available";
    let q = sb.from(kind).select(`id,name,description,price,${qtyCol},category,counts_against_limit`)
      .order("name").limit(200);
    if (onlyOut) q = q.lte(qtyCol, 0);
    const { data, error } = await q;
    if (error) throw error;
    rows = data ?? [];
  } catch (e: any) {
    return (<><PageHead title="الكتالوج" /><ErrorBox message={e?.message ?? String(e)} /></>);
  }

  const qtyCol = kind === "products" ? "stock" : "available";

  return (
    <>
      <PageHead
        title="الكتالوج"
        sub="يقرأه البوت حيّاً — أي تعديل تحفظه هنا يظهر للزبون في رسالته التالية."
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Tab href="/catalog" active={kind === "products" && !onlyOut}>المنتجات</Tab>
        <Tab href="/catalog?kind=services" active={kind === "services" && !onlyOut}>الخدمات</Tab>
        <Tab href={`/catalog?kind=${kind}&stock=out`} active={onlyOut}>النافذة فقط</Tab>
      </div>

      {rows.length === 0 ? (
        <Empty
          title={onlyOut ? "لا شيء نافذ" : "الكتالوج فارغ"}
          hint={onlyOut ? "كل العناصر متوفّرة." : "أضف عناصر عبر قناة الإدخال، ثم راجعها هنا."}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((it) => {
            const qty = it[qtyCol] ?? 0;
            return (
              <form key={it.id} action={updateItem} className="card p-4">
                <input type="hidden" name="table" value={kind} />
                <input type="hidden" name="id" value={it.id} />

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-medium">{it.name}</span>
                  {it.category && <Badge>{it.category}</Badge>}
                  {qty <= 0 && <Badge tone="alert">نافذ</Badge>}
                  {it.counts_against_limit === false && <Badge tone="amber">خارج حد الباقة</Badge>}
                  <span className="mr-auto text-sm text-muted">{money(it.price)}</span>
                </div>

                <div className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                  <div>
                    <label className="label block mb-1">الوصف</label>
                    <input name="description" defaultValue={it.description ?? ""} className="field" />
                  </div>
                  <div>
                    <label className="label block mb-1">السعر</label>
                    <input name="price" type="number" min="0" step="250" defaultValue={it.price ?? 0} className="field w-32" />
                  </div>
                  <div>
                    <label className="label block mb-1">{kind === "products" ? "المخزون" : "المتاح"}</label>
                    <input name="qty" type="number" min="0" defaultValue={qty} className="field w-28" />
                  </div>
                  <button className="btn-primary">حفظ</button>
                </div>
              </form>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted mt-6 leading-relaxed">
        اسم العنصر لا يُعدَّل من هنا بالتصميم — تغيير الاسم يمرّ عبر قناة الإدخال المُدارة،
        منعاً لاستخدام إعادة التسمية للالتفاف على حدّ عدد العناصر بالباقة.
      </p>
    </>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 h-9 flex items-center text-sm border transition-colors ${
        active ? "bg-petrol text-white border-petrol" : "bg-card border-line hover:bg-paper"
      }`}
    >
      {children}
    </Link>
  );
}
