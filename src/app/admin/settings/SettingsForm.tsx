'use client';

import { useState } from 'react';
import { saveSupportSettings } from './actions';
import { SubmitButton } from '@/components/store/SubmitButton';

export function SettingsForm({ values }: { values: Record<string, string> }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(fd: FormData) {
    const r = await saveSupportSettings(fd);
    setMsg({ ok: r.ok, text: r.ok ? (r.message ?? 'تم.') : r.error });
  }

  const phone = values.support_phone ?? '';
  const digits = phone.replace(/\D/g, '');

  return (
    <form action={submit}>
      {msg && <div className={`ar-note ar-note-${msg.ok ? 'info' : 'err'}`}>{msg.text}</div>}

      <div className="ar-card">
        <div className="ar-card-head">
          <h2>التواصل مع الدعم</h2>
          <span className="ar-hint">يظهر كزرّ عائم في كل صفحات بوابة المتجر</span>
        </div>

        <div className="ar-row">
          <label className="ar-field">
            <span>رقم الهاتف</span>
            <input className="ar-input ar-num" name="support_phone" dir="ltr"
                   defaultValue={phone} required placeholder="07XXXXXXXXX" />
          </label>
          <label className="ar-field">
            <span>رقم واتساب (اتركه فارغاً لاستخدام نفس الرقم)</span>
            <input className="ar-input ar-num" name="support_whatsapp" dir="ltr"
                   defaultValue={values.support_whatsapp ?? ''} placeholder="اختياري" />
          </label>
        </div>

        {digits.length > 0 && digits.length !== 11 && (
          <div className="ar-note ar-note-warn">
            الرقم فيه {digits.length} خانة. أرقام الموبايل العراقية إحدى عشرة خانة
            (07XX XXX XXXX) — راجعه، وإلا لن يعمل رابط واتساب.
          </div>
        )}

        <div className="ar-row">
          <label className="ar-field">
            <span>حساب تلغرام (بدون @)</span>
            <input className="ar-input" name="support_telegram" dir="ltr"
                   defaultValue={values.support_telegram ?? ''} placeholder="اختياري" />
          </label>
          <label className="ar-field">
            <span>أوقات الدوام</span>
            <input className="ar-input" name="support_hours"
                   defaultValue={values.support_hours ?? ''}
                   placeholder="يوميّاً ٩ صباحاً — ٩ مساءً" />
          </label>
        </div>

        <SubmitButton>احفظ الإعدادات</SubmitButton>
      </div>
    </form>
  );
}
