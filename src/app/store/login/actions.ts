'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { loginIdToEmail } from '@/lib/supabase/admin';

// loginIdToEmail لا يلمس service_role — تحويل نصي بحت، آمن هنا.

export async function signIn(_prev: unknown, formData: FormData) {
  const loginId = String(formData.get('login_id') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!loginId || !password) {
    return { error: 'أدخل معرّف الدخول وكلمة المرور.' };
  }

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signInWithPassword({
    email: loginIdToEmail(loginId),
    password,
  });

  if (error || !data.user) {
    // رسالة واحدة للحالتين عمداً: لا نكشف أي معرّف موجود.
    return { error: 'معرّف الدخول أو كلمة المرور غير صحيحة.' };
  }

  const { data: su } = await sb
    .from('store_users')
    .select('id, is_active, store_id')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();

  if (!su) {
    await sb.auth.signOut();
    return { error: 'هذا الحساب غير مرتبط بأي متجر. راجع الإدارة.' };
  }
  if (!su.is_active) {
    await sb.auth.signOut();
    return { error: 'الحساب موقوف. راجع الإدارة.' };
  }

  // stores مقروء عبر auth_store_id() التي تشترط service_status = 'active'.
  const { data: store } = await sb.from('stores').select('id').eq('id', su.store_id).maybeSingle();
  if (!store) {
    await sb.auth.signOut();
    return { error: 'اشتراك المتجر متوقف حالياً. راجع الإدارة للتجديد.' };
  }

  await sb.from('store_users').update({ last_login_at: new Date().toISOString() }).eq('id', su.id);

  revalidatePath('/store', 'layout');
  redirect('/store');
}

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect('/store/login');
}
