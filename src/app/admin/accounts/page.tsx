import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/admin';
import '../../store/arpha.css';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  await requireAdmin();
  const sb = supabaseAdmin();

  const [{ data: stores }, { data: users }, { data: openReqs }] = await Promise.all([
    sb.from('stores').select('*').order('name'),
    sb.from('store_users').select('*'),
    sb.from('store_change_requests').select('id').eq('status', 'open'),
  ]);

  type SU = { id: string; store_id: string; login_id: string; is_active: boolean };
  const byStore = new Map<string, SU>(((users ?? []) as SU[]).map((u) => [u.store_id, u]));

  return (
    <div className="ar" dir="rtl" lang="ar">
      <div className="ar-shell">
        <header className="ar-top">
          <div className="ar-brand">أرفا <span>لوحة الإدارة</span></div>
          <div className="ar-top-end">
            <Link className="ar-btn ar-btn-ghost ar-btn-sm" href="/admin/requests">
              الطلبات
              {(openReqs?.length ?? 0) > 0 && (
                <span className="ar-badge ar-badge-pom">{openReqs!.length}</span>
              )}
            </Link>
            <Link className="ar-btn ar-btn-primary ar-btn-sm" href="/admin/accounts/new">
              متجر جديد
            </Link>
          </div>
        </header>

        <div className="ar-card">
          <div className="ar-card-head">
            <h1>المتاجر</h1>
            <span className="ar-hint">{stores?.length ?? 0} متجر</span>
          </div>

          <table className="ar-table">
            <thead>
              <tr>
                <th>المتجر</th>
                <th>صاحبه</th>
                <th>معرّف الدخول</th>
                <th>الحالة</th>
                <th>ينتهي</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {((stores ?? []) as Record<string, any>[]).map((s) => {
                const u = byStore.get(s.id);
                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>
                      {s.owner_name ?? '—'}
                      <div className="ar-hint ar-num" dir="ltr">{s.owner_phone ?? ''}</div>
                    </td>
                    <td dir="ltr" className="ar-num">
                      {u?.login_id ?? <span className="ar-badge ar-badge-brass">لا حساب</span>}
                    </td>
                    <td>
                      <span className={`ar-badge ${s.service_status === 'active' ? 'ar-badge-teal' : 'ar-badge-pom'}`}>
                        {s.service_status === 'active' ? 'فعّال'
                          : s.service_status === 'suspended' ? 'موقوف' : 'منتهٍ'}
                      </span>
                    </td>
                    <td className="ar-num">
                      {s.subscription_expires_at
                        ? new Date(s.subscription_expires_at).toLocaleDateString('ar-IQ')
                        : '—'}
                    </td>
                    <td>
                      <Link className="ar-btn ar-btn-ghost ar-btn-sm" href={`/admin/accounts/${s.id}`}>
                        إدارة
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(stores?.length ?? 0) === 0 && (
            <div className="ar-empty">
              <h3>لا متاجر بعد</h3>
              <p>أنشئ أول متجر وسيصدر له معرّف دخول وكلمة مرور فوراً.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
