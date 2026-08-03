// حارس الكونسول الإداري — يعيد استخدام حارس الجلسة الفعلي للمشروع.
//
// الكوكي هو arpha_session (SESSION_COOKIE في lib/constants.ts) والتحقق
// توقيعي كامل عبر verifySession() من lib/session.ts (HMAC + مهلة 7 أيام).

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE } from '@/lib/constants';
import { verifySession } from '@/lib/session';

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/login');
}
