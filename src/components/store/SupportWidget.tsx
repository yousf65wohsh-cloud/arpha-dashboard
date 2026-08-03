'use client';

import { useState } from 'react';

// زر تواصل عائم في كل صفحات البوابة. الرقم يأتي من إعدادات المنصّة
// (جدول platform_settings) فيغيّره الأدمن بلا نشر جديد.
export function SupportWidget({
  phone, whatsapp, telegram, hours,
}: {
  phone: string;
  whatsapp?: string | null;
  telegram?: string | null;
  hours?: string | null;
}) {
  const [open, setOpen] = useState(false);

  // 0772320627 → 964772320627 لروابط واتساب
  const intl = (whatsapp || phone).replace(/\D/g, '').replace(/^0/, '964');

  return (
    <>
      <button
        className="ar-support-fab"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? 'إغلاق التواصل' : 'تواصل مع الدعم'}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5a8.4 8.4 0 0 1-.9-3.9 8.4 8.4 0 0 1 8.4-9 8.4 8.4 0 0 1 8.6 8.4z" />
            </svg>
            <span>تواصل معنا</span>
          </>
        )}
      </button>

      {open && (
        <div className="ar-support-panel" role="dialog" aria-label="التواصل مع الدعم">
          <div className="ar-support-head">
            <strong>فريق أرفا</strong>
            <span>{hours ?? 'يوميّاً ٩ صباحاً — ٩ مساءً'}</span>
          </div>

          <p className="ar-support-body">
            اسأل عن أي شيء: ترقية باقتك، تغيير بياناتك، أو مشكلة في البوت.
          </p>

          <a className="ar-support-action ar-support-wa" href={`https://wa.me/${intl}`}
             target="_blank" rel="noopener noreferrer">
            <span>واتساب</span>
            <span className="ar-num" dir="ltr">{phone}</span>
          </a>

          <a className="ar-support-action" href={`tel:${phone}`}>
            <span>اتصال مباشر</span>
            <span className="ar-num" dir="ltr">{phone}</span>
          </a>

          {telegram && (
            <a className="ar-support-action" href={`https://t.me/${telegram.replace(/^@/, '')}`}
               target="_blank" rel="noopener noreferrer">
              <span>تلغرام</span>
              <span className="ar-num" dir="ltr">@{telegram.replace(/^@/, '')}</span>
            </a>
          )}

          <p className="ar-support-foot">
            لتغيير كلمة المرور أو معرّف الدخول، أرسل طلباً من صفحة الحساب — أسرع من الاتصال.
          </p>
        </div>
      )}
    </>
  );
}
