// عميل service_role — يتجاوز RLS كلياً.
//
// حدوده الصارمة:
//   • مسارات /admin فقط، وداخل Server Actions أو Route Handlers حصراً.
//   • ممنوع استيراده من أي ملف فيه 'use client'.
//   • ممنوع استيراده من أي شيء تحت app/store.
//
// موجود لسببين لا ثالث لهما: إنشاء مستخدمي Auth (يتطلب Admin API)،
// وعمليات الأدمن العابرة للمتاجر.

import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY غير مضبوط. ' +
        'أضفهما في Vercel ثم أعد النشر — متغيرات البيئة تُقرأ وقت البناء.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// البريد الصناعي: صاحب المتجر يدخل بمعرّف نصي، وSupabase Auth يتطلب بريداً.
// هذا التحويل هو الجسر بينهما. النطاق وهمي عمداً — لا بريد يُرسل إليه أبداً.
export const LOGIN_EMAIL_DOMAIN = 'stores.arpha.local';

export function loginIdToEmail(loginId: string) {
  return `${loginId.trim().toLowerCase()}@${LOGIN_EMAIL_DOMAIN}`;
}

export function isValidLoginId(loginId: string) {
  return /^[a-z0-9_]{4,32}$/.test(loginId.trim().toLowerCase());
}
