'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createStoreAccount } from '../actions';
import { SubmitButton } from '@/components/store/SubmitButton';

type Plan = { id: string; name: string; max_catalog_items?: number | null };

export function NewStoreForm({ plans }: { plans: Plan[] }) {
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ loginId: string; password: string; storeId: string } | null>(null);

  async function submit(fd: FormData) {
    const r = await createStoreAccount(fd);
    if (!r.ok) { setErr(r.error); return; }
    setErr(null);
    setDone({ loginId: r.loginId, password: r.password, storeId: r.storeId });
  }

  // كلمة المرور تُعرض مرة واحدة. Supabase يخزّنها مجزّأة ولا سبيل لقراءتها لاحقاً —
  // بعد مغادرة هذه الصفحة يبقى خيار واحد: إعادة تعيين.
  if (done) {
    return (
      <div className="ar-card">
        <div className="ar-note ar-note-info">
          أُنشئ المتجر. سلّم هذه البيانات لصاحبه الآن.
        </div>

        <table className="ar-table">
          <tbody>
            <tr><td>معرّف الدخول</td><td dir="ltr" className="ar-num"><strong>{done.loginId}</strong></td></tr>
            <tr><td>كلمة المرور</td><td dir="ltr" className="ar-num"><strong>{done.password}</strong></td></tr>
            <tr><td>رابط الدخول</td><td dir="ltr" className="ar-num">/store/login</td></tr>
          </tbody>
        </table>

        <div className="ar-note ar-note-warn" style={{ marginTop: 14 }}>
          كلمة المرور تظهر هنا مرة واحدة فقط. انسخها قبل مغادرة الصفحة — بعدها
          لا يمكن استرجاعها، فقط إعادة تعيينها.
        </div>

        <div className="ar-note ar-note-warn">
          ناقص لتشغيل البوت على هذا المتجر: ضبط <code>customer_bot_username</code> إن تركته
          فارغاً، ثم يرسل حساب المدير <code>/start</code> إلى البوتين معاً وتُضبط
          <code> manager_chat_id</code>. تلغرام يرفض إرسال رسالة لحساب لم يبدأ البوت — قاعدة منصّة لا خلل.
        </div>

        <div className="ar-item-actions">
          <Link className="ar-btn ar-btn-primary ar-btn-sm" href={`/admin/accounts/${done.storeId}`}>
            افتح صفحة المتجر
          </Link>
          <Link className="ar-btn ar-btn-ghost ar-btn-sm" href="/admin/accounts">
            رجوع للقائمة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={submit}>
      {err && <div className="ar-note ar-note-err">{err}</div>}

      <div className="ar-card">
        <div className="ar-card-head"><h2>المتجر وصاحبه</h2></div>
        <div className="ar-row">
          <label className="ar-field">
            <span>اسم المتجر</span>
            <input className="ar-input" name="store_name" required autoFocus />
          </label>
          <label className="ar-field">
            <span>اسم صاحب المتجر</span>
            <input className="ar-input" name="owner_name" required />
          </label>
        </div>
        <div className="ar-row">
          <label className="ar-field">
            <span>رقم الهاتف</span>
            <input className="ar-input ar-num" name="owner_phone" dir="ltr" required placeholder="+9647xxxxxxxxx" />
          </label>
          <label className="ar-field">
            <span>اسم بوت الزبائن (بدون @)</span>
            <input className="ar-input" name="customer_bot_username" dir="ltr" placeholder="my_store_bot" />
          </label>
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-head">
          <h2>بيانات الدخول</h2>
          <span className="ar-hint">تُسلَّم لصاحب المتجر، ولا يستطيع تغييرها بنفسه</span>
        </div>
        <div className="ar-row">
          <label className="ar-field">
            <span>معرّف الدخول</span>
            <input
              className="ar-input" name="login_id" dir="ltr" required
              pattern="[a-z0-9_]{4,32}" placeholder="alnoor_store"
            />
          </label>
          <label className="ar-field">
            <span>كلمة المرور</span>
            <input className="ar-input" name="password" dir="ltr" placeholder="اتركها فارغة لتوليد واحدة" />
          </label>
        </div>
      </div>

      <div className="ar-card">
        <div className="ar-card-head">
          <h2>الباقة والحدود</h2>
          <span className="ar-hint">اترك خانة التجاوز فارغة لتُستخدم قيمة الباقة</span>
        </div>
        <div className="ar-row">
          <label className="ar-field">
            <span>الباقة</span>
            <select className="ar-select" name="plan_id" defaultValue={plans[0]?.id ?? ''}>
              <option value="">بلا باقة</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.max_catalog_items != null ? ` — ${p.max_catalog_items} عنصر` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="ar-field">
            <span>مدة الاشتراك (أشهر)</span>
            <input className="ar-input ar-num" name="months" type="number" defaultValue={1} min={1} max={36} />
          </label>
        </div>
        <div className="ar-row">
          <label className="ar-field">
            <span>تجاوز حد المنتجات والخدمات</span>
            <input className="ar-input ar-num" name="max_catalog_items_override" type="number" min={0} placeholder="—" />
          </label>
          <label className="ar-field">
            <span>تجاوز حد السياسات</span>
            <input className="ar-input ar-num" name="max_policies_override" type="number" min={0} placeholder="—" />
          </label>
        </div>
        <label className="ar-field">
          <span>تجاوز حد قواعد البوت</span>
          <input className="ar-input ar-num" name="max_bot_rules_override" type="number" min={0} placeholder="—" />
        </label>
      </div>

      <SubmitButton pendingText="جارٍ الإنشاء…">أنشئ المتجر والحساب</SubmitButton>
    </form>
  );
}
