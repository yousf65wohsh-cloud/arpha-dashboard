'use client';

import { useState } from 'react';
import {
  updateStoreSettings, setServiceStatus, renewSubscription,
  resetStorePassword, changeLoginId, toggleStoreUser,
} from '../actions';
import { SubmitButton } from '@/components/store/SubmitButton';

type Any = Record<string, any>;

export function ManageClient({
  store, user, plans, usage,
}: {
  store: Any;
  user: Any | null;
  plans: { id: string; name: string }[];
  usage: { catalog: number; policies: number; rules: number };
}) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [creds, setCreds] = useState<{ loginId: string; password: string } | null>(null);

  const wrap =
    (fn: (fd: FormData) => Promise<Any>) =>
    async (fd: FormData) => {
      const r = await fn(fd);
      if (r.ok && r.password) {
        setCreds({ loginId: r.loginId, password: r.password });
        setMsg({ ok: true, text: 'أُعيد تعيين كلمة المرور.' });
      } else {
        setMsg({ ok: Boolean(r.ok), text: r.ok ? (r.message ?? 'تم.') : (r.error ?? 'خطأ.') });
      }
    };

  return (
    <>
      {msg && <div className={`ar-note ar-note-${msg.ok ? 'info' : 'err'}`}>{msg.text}</div>}

      {creds && (
        <div className="ar-card">
          <div className="ar-note ar-note-warn">
            كلمة المرور الجديدة تظهر مرة واحدة. انسخها الآن.
          </div>
          <table className="ar-table">
            <tbody>
              <tr><td>معرّف الدخول</td><td dir="ltr" className="ar-num"><strong>{creds.loginId}</strong></td></tr>
              <tr><td>كلمة المرور</td><td dir="ltr" className="ar-num"><strong>{creds.password}</strong></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* الخدمة والاشتراك */}
      <div className="ar-card">
        <div className="ar-card-head">
          <h2>الخدمة</h2>
          <span className={`ar-badge ${store.service_status === 'active' ? 'ar-badge-teal' : 'ar-badge-pom'}`}>
            {store.service_status === 'active' ? 'فعّالة'
              : store.service_status === 'suspended' ? 'موقوفة' : 'منتهية'}
          </span>
        </div>

        <p className="ar-hint" style={{ marginBottom: 12 }}>
          إيقاف الخدمة يمنع الدخول ويجعل <code>auth_store_id()</code> ترجع فارغة —
          أي أن صاحب المتجر لا يرى أي صف. البيانات تبقى كما هي ولا يُحذف شيء.
        </p>

        <div className="ar-item-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
          <form action={wrap(setServiceStatus)}>
            <input type="hidden" name="store_id" value={store.id} />
            <input type="hidden" name="status" value={store.service_status === 'active' ? 'suspended' : 'active'} />
            <SubmitButton variant={store.service_status === 'active' ? 'danger' : 'primary'} small pendingText="…">
              {store.service_status === 'active' ? 'أوقف الخدمة' : 'أعد تفعيل الخدمة'}
            </SubmitButton>
          </form>

          <form action={wrap(renewSubscription)} className="ar-item-actions">
            <input type="hidden" name="store_id" value={store.id} />
            <input className="ar-input ar-num" name="months" type="number" defaultValue={1} min={1} max={36} style={{ width: 74 }} />
            <SubmitButton variant="ghost" small pendingText="…">جدّد أشهراً</SubmitButton>
          </form>
        </div>

        <p className="ar-hint" style={{ marginTop: 10 }}>
          ينتهي في:{' '}
          <span className="ar-num">
            {store.subscription_expires_at
              ? new Date(store.subscription_expires_at).toLocaleDateString('ar-IQ')
              : '—'}
          </span>
        </p>
      </div>

      {/* حساب الدخول */}
      <div className="ar-card">
        <div className="ar-card-head">
          <h2>حساب الدخول</h2>
          {user && !user.is_active && <span className="ar-badge ar-badge-pom">موقوف</span>}
        </div>

        {!user ? (
          <div className="ar-note ar-note-warn">
            لا يوجد حساب دخول لهذا المتجر. أُنشئ قبل الهجرة 016 على الأرجح.
          </div>
        ) : (
          <>
            <table className="ar-table">
              <tbody>
                <tr><td>معرّف الدخول</td><td dir="ltr" className="ar-num">{user.login_id}</td></tr>
                <tr><td>الاسم</td><td>{user.full_name}</td></tr>
                <tr><td>الهاتف</td><td dir="ltr" className="ar-num">{user.phone}</td></tr>
                <tr>
                  <td>آخر دخول</td>
                  <td className="ar-num">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString('ar-IQ') : 'لم يدخل بعد'}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="ar-row" style={{ marginTop: 14 }}>
              <form action={wrap(resetStorePassword)}>
                <input type="hidden" name="store_user_id" value={user.id} />
                <label className="ar-field">
                  <span>كلمة مرور جديدة</span>
                  <input className="ar-input" name="password" dir="ltr" placeholder="اتركها فارغة للتوليد" />
                </label>
                <SubmitButton variant="ghost" small pendingText="…">أعد تعيين كلمة المرور</SubmitButton>
              </form>

              <form action={wrap(changeLoginId)}>
                <input type="hidden" name="store_user_id" value={user.id} />
                <label className="ar-field">
                  <span>معرّف دخول جديد</span>
                  <input className="ar-input" name="login_id" dir="ltr" pattern="[a-z0-9_]{4,32}" defaultValue={user.login_id} />
                </label>
                <SubmitButton variant="ghost" small pendingText="…">غيّر المعرّف</SubmitButton>
              </form>
            </div>

            <form action={wrap(toggleStoreUser)} style={{ marginTop: 10 }}>
              <input type="hidden" name="store_user_id" value={user.id} />
              <input type="hidden" name="next" value={user.is_active ? '0' : '1'} />
              <SubmitButton variant={user.is_active ? 'danger' : 'ghost'} small pendingText="…">
                {user.is_active ? 'أوقف الحساب' : 'فعّل الحساب'}
              </SubmitButton>
            </form>
          </>
        )}
      </div>

      {/* الباقة والحدود */}
      <form action={wrap(updateStoreSettings)}>
        <input type="hidden" name="store_id" value={store.id} />

        <div className="ar-card">
          <div className="ar-card-head">
            <h2>الباقة والحدود</h2>
            <span className="ar-hint">
              مستهلك الآن: {usage.catalog} عنصر · {usage.policies} سياسة · {usage.rules} قاعدة
            </span>
          </div>

          <div className="ar-row">
            <label className="ar-field">
              <span>الباقة</span>
              <select className="ar-select" name="plan_id" defaultValue={store.plan_id ?? ''}>
                <option value="">بلا باقة</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="ar-field">
              <span>اسم بوت الزبائن (بدون @)</span>
              <input className="ar-input" name="customer_bot_username" dir="ltr"
                     defaultValue={store.customer_bot_username ?? ''} />
            </label>
          </div>

          <div className="ar-row">
            <label className="ar-field">
              <span>تجاوز حد الكتالوج</span>
              <input className="ar-input ar-num" name="max_catalog_items_override" type="number" min={0}
                     defaultValue={store.max_catalog_items_override ?? ''} placeholder="قيمة الباقة" />
            </label>
            <label className="ar-field">
              <span>تجاوز حد السياسات</span>
              <input className="ar-input ar-num" name="max_policies_override" type="number" min={0}
                     defaultValue={store.max_policies_override ?? ''} placeholder="قيمة الباقة" />
            </label>
          </div>

          <div className="ar-row">
            <label className="ar-field">
              <span>تجاوز حد القواعد</span>
              <input className="ar-input ar-num" name="max_bot_rules_override" type="number" min={0}
                     defaultValue={store.max_bot_rules_override ?? ''} placeholder="قيمة الباقة" />
            </label>
            <label className="ar-field">
              <span>اسم صاحب المتجر</span>
              <input className="ar-input" name="owner_name" defaultValue={store.owner_name ?? ''} />
            </label>
          </div>

          <div className="ar-row">
            <label className="ar-field">
              <span>هاتف صاحب المتجر</span>
              <input className="ar-input ar-num" name="owner_phone" dir="ltr" defaultValue={store.owner_phone ?? ''} />
            </label>
            <label className="ar-field">
              <span>ملاحظات الإدارة</span>
              <input className="ar-input" name="admin_notes" defaultValue={store.admin_notes ?? ''} />
            </label>
          </div>

          <p className="ar-hint" style={{ marginBottom: 12 }}>
            خفض الحد تحت المستهلك الحالي لا يحذف شيئاً — يمنع الإضافة فقط حتى ينزل
            العدد تحت الحد الجديد.
          </p>

          <SubmitButton>احفظ الإعدادات</SubmitButton>
        </div>
      </form>
    </>
  );
}
