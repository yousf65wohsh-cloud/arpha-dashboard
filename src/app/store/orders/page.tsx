import { requireStoreSession } from '@/lib/auth/store-session';
import { supabaseServer } from '@/lib/supabase/server';
import { StoreChrome } from '@/components/store/StoreChrome';
import { Empty } from '@/components/store/Notice';

export const dynamic = 'force-dynamic';

// الطلبات للعرض فقط — لم يُغيَّر شيء في سلوكها.
// قاعدة المشروع: orders.total_amount مملوك للـ trigger، لا يكتبه التطبيق أبداً.
// سياسة RLS المولّدة في الهجرة 021 تعطي orders صلاحية select فقط، فهذا مفروض
// في القاعدة أيضاً وليس في الواجهة وحدها.

export default async function OrdersPage() {
  const session = await requireStoreSession();
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60);

  const rows = (data ?? []) as Record<string, any>[];

  return (
    <StoreChrome session={session} current="/store/orders">
      <div className="ar-card-head">
        <h1>الطلبات</h1>
        <span className="ar-hint">آخر ٦٠ طلباً — للعرض فقط</span>
      </div>

      {error && <div className="ar-note ar-note-err">{error.message}</div>}

      <div className="ar-card">
        {rows.length === 0 ? (
          <Empty title="لا طلبات بعد" body="يظهر الطلب هنا لحظة إنشائه من محادثة البوت." />
        ) : (
          <table className="ar-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={String(o.id)}>
                  <td className="ar-num">{new Date(o.created_at).toLocaleString('ar-IQ')}</td>
                  <td><span className="ar-badge">{o.status ?? '—'}</span></td>
                  <td className="ar-num">
                    {o.total_amount != null ? `${Number(o.total_amount).toLocaleString('ar-IQ')} د.ع` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </StoreChrome>
  );
}
