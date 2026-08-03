import { requireStoreSession } from '@/lib/auth/store-session';
import { supabaseServer } from '@/lib/supabase/server';
import { StoreChrome } from '@/components/store/StoreChrome';
import { getSupportSettings } from '@/lib/settings';
import { openRequest } from './actions';
import { SubmitButton } from '@/components/store/SubmitButton';
import { REQUEST_TYPES, type ChangeRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const [session, support] = await Promise.all([
    requireStoreSession(),
    getSupportSettings(),
  ]);
  const sb = await supabaseServer();

  const [{ data: store }, { data: reqs }] = await Promise.all([
    sb.from('stores').select('*').eq('id', session.storeId).maybeSingle(),
    sb.from('store_change_requests').select('*').order('created_at', { ascending: false }).limit(10),
  ]);

  const rows = (reqs ?? []) as ChangeRequest[];
  const expires = store?.subscription_expires_at
    ? new Date(store.subscription_expires_at).toLocaleDateString('ar-IQ')
    : null;

  return (
    <StoreChrome session={session} current="/store/account" support={support}>
      <div className="ar-card-head">
        <h1>الحساب</h1>
        <span className="ar-hint">بياناتك واشتراكك</span>
      </div>

      <div className="ar-card">
        <div className="ar-card-head"><h2>بيانات الدخول</h2></div>
        <div className="ar-row">
          <label className="ar-field">
            <span>معرّف الدخول</span>
            <input className="ar-input" value={session.user.login_id} disabled dir="ltr" />
          </label>
          <label className="ar-field">
            <span>كلمة المرور</span>
            <input className="ar-input" value="••••••••" disabled dir="ltr" />
          </label>
        </div>
        <div className="ar-row">
          <label className="ar-field">
            <span>الاسم</span>
            <input className="ar-input" value={session.user.full_name} disabled />
          </label>
          <label className="ar-field">
            <span>رقم الهاتف</span>
            <input className="ar-input" value={session.user.phone} disabled dir="ltr" />
          </label>
        </div>
        <p className="ar-hint">
          هذه البيانات تصدرها الإدارة ولا تُعدَّل من هنا. لتغيير أيٍّ منها أرسل طلباً أدناه.
        </p>
      </div>

      <div className="ar-card">
        <div className="ar-card-head">
          <h2>الاشتراك</h2>
          <span className={`ar-badge ${store?.service_status === 'active' ? 'ar-badge-teal' : 'ar-badge-pom'}`}>
            {store?.service_status === 'active' ? 'فعّال' : 'متوقف'}
          </span>
        </div>
        <table className="ar-table">
          <tbody>
            <tr>
              <td>خانات المنتجات والخدمات</td>
              <td className="ar-num">{session.limits.catalog_used} / {session.limits.catalog_limit}</td>
            </tr>
            <tr>
              <td>خانات السياسات</td>
              <td className="ar-num">{session.limits.policies_used} / {session.limits.policies_limit}</td>
            </tr>
            <tr>
              <td>خانات قواعد البوت</td>
              <td className="ar-num">{session.limits.rules_used} / {session.limits.rules_limit}</td>
            </tr>
            {expires && (
              <tr><td>ينتهي في</td><td className="ar-num">{expires}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="ar-card">
        <div className="ar-card-head"><h2>أرسل طلباً للإدارة</h2></div>
        <form action={openRequest}>
          <input type="hidden" name="store_id" value={session.storeId} />
          <input type="hidden" name="user_id" value={session.user.id} />
          <label className="ar-field">
            <span>نوع الطلب</span>
            <select className="ar-select" name="request_type" defaultValue="plan_upgrade">
              {Object.entries(REQUEST_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className="ar-field">
            <span>تفاصيل</span>
            <textarea name="details" placeholder="اكتب ما تحتاجه بالضبط — مثلاً: أريد رفع الحد إلى ٢٠٠ منتج." />
          </label>
          <SubmitButton>أرسل الطلب</SubmitButton>
        </form>
      </div>

      {rows.length > 0 && (
        <div className="ar-card">
          <div className="ar-card-head"><h2>طلباتك السابقة</h2></div>
          <table className="ar-table">
            <thead>
              <tr><th>النوع</th><th>التاريخ</th><th>الحالة</th><th>ردّ الإدارة</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{REQUEST_TYPES[r.request_type]}</td>
                  <td className="ar-num">{new Date(r.created_at).toLocaleDateString('ar-IQ')}</td>
                  <td>
                    <span className={`ar-badge ${
                      r.status === 'done' ? 'ar-badge-teal'
                      : r.status === 'rejected' ? 'ar-badge-pom' : 'ar-badge-brass'
                    }`}>
                      {r.status === 'done' ? 'منفّذ' : r.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                    </span>
                  </td>
                  <td>{r.admin_note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </StoreChrome>
  );
}
