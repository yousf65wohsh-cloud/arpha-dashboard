// عميل Supabase لمسار المستخدم المصادَق — مفتاح anon + جلسة المستخدم في الكوكيز.
// هذا هو المسار الذي تمر عبره كل استعلامات بوابة المتجر، فالعزل بين المتاجر
// يعتمد على سياسات RLS (الهجرة 021) وليس على كود التطبيق.
//
// لا تستخدم service_role في أي صفحة تحت /store — هذا هو الفرق كله.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function supabaseServer() {
  // Next 15: cookies() غير متزامنة. على Next 14 احذف await — يعمل في الحالتين وقت التشغيل.
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items: { name: string; value: string; options: CookieOptions }[]) {
        try {
          items.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // الكتابة على الكوكيز ممنوعة داخل Server Component — يتكفّل بها middleware.
        }
      },
    },
  });
}
