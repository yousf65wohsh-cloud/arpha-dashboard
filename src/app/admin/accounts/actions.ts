'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, loginIdToEmail, isValidLoginId } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin-guard';
import { humanizeDbError } from '@/lib/limits';
import type { ActionResult } from '@/lib/types';

// كل دالة هنا تبدأ بـ requireAdmin(). Server Action نقطة دخول HTTP قائمة بذاتها
// — حماية الصفحة التي تستدعيها لا تحميها.

function generatePassword(): string {
  // بلا أحرف ملتبسة: 0/O و 1/l/I — كلمة المرور تُملى بالهاتف عادةً.
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(14);
  return Array.from(bytes, (b: number) => alphabet[b % alphabet.length]).join('');
}

export type CreateResult =
  | { ok: true; loginId: string; password: string; storeId: string }
  | { ok: false; error: string };

export async function createStoreAccount(formData: FormData): Promise<CreateResult> {
  await requireAdmin();

  const storeName = String(formData.get('store_name') ?? '').trim();
  const ownerName = String(formData.get('owner_name') ?? '').trim();
  const ownerPhone = String(formData.get('owner_phone') ?? '').trim();
  const loginId = String(formData.get('login_id') ?? '').trim().toLowerCase();
  const planId = String(formData.get('plan_id') ?? '').trim() || null;
  const botUsername = String(formData.get('customer_bot_username') ?? '').trim().replace(/^@/, '');
  const months = Number(formData.get('months') ?? 1) || 1;

  const num = (k: string) => {
    const v = String(formData.get(k) ?? '').trim();
    return v ? Number(v) : null;
  };

  if (!storeName) return { ok: false, error: 'اسم المتجر مطلوب.' };
  if (!ownerName) return { ok: false, error: 'اسم صاحب المتجر مطلوب.' };
  if (!ownerPhone) return { ok: false, error: 'رقم هاتف صاحب المتجر مطلوب.' };
  if (!isValidLoginId(loginId)) {
    return { ok: false, error: 'معرّف الدخول: حروف إنجليزية صغيرة وأرقام و _ فقط، من ٤ إلى ٣٢ خانة.' };
  }

  const password = String(formData.get('password') ?? '').trim() || generatePassword();
  if (password.length < 10) return { ok: false, error: 'كلمة المرور قصيرة — ١٠ خانات على الأقل.' };

  const sb = supabaseAdmin();

  const { data: taken } = await sb
    .from('store_users').select('id').eq('login_id', loginId).maybeSingle();
  if (taken) return { ok: false, error: 'معرّف الدخول مستخدم. اختر غيره.' };

  // 1) مستخدم Auth — يتطلب Admin API، ولهذا وحده يُستخدم service_role هنا.
  const { data: created, error: authErr } = await sb.auth.admin.createUser({
    email: loginIdToEmail(loginId),
    password,
    email_confirm: true,
    user_metadata: { login_id: loginId, full_name: ownerName },
  });

  if (authErr || !created?.user) {
    return { ok: false, error: `تعذّر إنشاء حساب الدخول: ${authErr?.message ?? 'سبب غير معروف'}` };
  }

  const authUserId = created.user.id;
  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + months);

  // 2) المتجر
  const { data: store, error: storeErr } = await sb
    .from('stores')
    .insert({
      name: storeName,
      plan_id: planId,
      owner_name: ownerName,
      owner_phone: ownerPhone,
      customer_bot_username: botUsername || null,
      service_status: 'active',
      subscription_started_at: now.toISOString(),
      subscription_expires_at: expires.toISOString(),
      max_catalog_items_override: num('max_catalog_items_override'),
      max_bot_rules_override: num('max_bot_rules_override'),
      max_policies_override: num('max_policies_override'),
    })
    .select('id')
    .single();

  if (storeErr || !store) {
    await sb.auth.admin.deleteUser(authUserId);   // تراجع: لا نترك مستخدماً يتيماً
    return { ok: false, error: `تعذّر إنشاء المتجر: ${humanizeDbError(storeErr?.message)}` };
  }

  // 3) الربط
  const { error: linkErr } = await sb.from('store_users').insert({
    auth_user_id: authUserId,
    store_id: store.id,
    login_id: loginId,
    full_name: ownerName,
    phone: ownerPhone,
    role: 'owner',
    created_by: 'admin',
  });

  if (linkErr) {
    await sb.from('stores').delete().eq('id', store.id);
    await sb.auth.admin.deleteUser(authUserId);
    return { ok: false, error: `تعذّر ربط الحساب بالمتجر: ${humanizeDbError(linkErr.message)}` };
  }

  revalidatePath('/admin/accounts');
  return { ok: true, loginId, password, storeId: store.id };
}

export async function resetStorePassword(formData: FormData): Promise<CreateResult> {
  await requireAdmin();

  const storeUserId = String(formData.get('store_user_id') ?? '');
  const password = String(formData.get('password') ?? '').trim() || generatePassword();
  if (password.length < 10) return { ok: false, error: 'كلمة المرور قصيرة — ١٠ خانات على الأقل.' };

  const sb = supabaseAdmin();
  const { data: su } = await sb
    .from('store_users').select('auth_user_id, login_id, store_id').eq('id', storeUserId).maybeSingle();

  if (!su) return { ok: false, error: 'الحساب غير موجود.' };

  const { error } = await sb.auth.admin.updateUserById(su.auth_user_id, { password });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/accounts/${su.store_id}`);
  return { ok: true, loginId: su.login_id, password, storeId: su.store_id };
}

export async function changeLoginId(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const storeUserId = String(formData.get('store_user_id') ?? '');
  const loginId = String(formData.get('login_id') ?? '').trim().toLowerCase();

  if (!isValidLoginId(loginId)) {
    return { ok: false, error: 'معرّف الدخول: حروف إنجليزية صغيرة وأرقام و _ فقط، من ٤ إلى ٣٢ خانة.' };
  }

  const sb = supabaseAdmin();
  const { data: su } = await sb
    .from('store_users').select('auth_user_id, store_id').eq('id', storeUserId).maybeSingle();
  if (!su) return { ok: false, error: 'الحساب غير موجود.' };

  // البريد الصناعي والـ login_id يجب أن يتحرّكا معاً وإلا انكسر الدخول.
  const { error: authErr } = await sb.auth.admin.updateUserById(su.auth_user_id, {
    email: loginIdToEmail(loginId),
  });
  if (authErr) return { ok: false, error: authErr.message };

  const { error } = await sb
    .from('store_users')
    .update({ login_id: loginId, updated_at: new Date().toISOString() })
    .eq('id', storeUserId);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath(`/admin/accounts/${su.store_id}`);
  return { ok: true, message: `صار معرّف الدخول: ${loginId}` };
}

export async function updateStoreSettings(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const storeId = String(formData.get('store_id') ?? '');
  const num = (k: string) => {
    const v = String(formData.get(k) ?? '').trim();
    return v ? Number(v) : null;
  };

  const patch: Record<string, unknown> = {
    plan_id: String(formData.get('plan_id') ?? '').trim() || null,
    owner_name: String(formData.get('owner_name') ?? '').trim() || null,
    owner_phone: String(formData.get('owner_phone') ?? '').trim() || null,
    customer_bot_username:
      String(formData.get('customer_bot_username') ?? '').trim().replace(/^@/, '') || null,
    max_catalog_items_override: num('max_catalog_items_override'),
    max_bot_rules_override: num('max_bot_rules_override'),
    max_policies_override: num('max_policies_override'),
    admin_notes: String(formData.get('admin_notes') ?? '').trim() || null,
  };

  const sb = supabaseAdmin();
  const { error } = await sb.from('stores').update(patch).eq('id', storeId);
  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath(`/admin/accounts/${storeId}`);
  return { ok: true, message: 'حُفظت إعدادات المتجر.' };
}

export async function setServiceStatus(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const storeId = String(formData.get('store_id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!['active', 'suspended', 'expired'].includes(status)) {
    return { ok: false, error: 'حالة غير معروفة.' };
  }

  const sb = supabaseAdmin();
  const { error } = await sb.from('stores').update({ service_status: status }).eq('id', storeId);
  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath(`/admin/accounts/${storeId}`);
  revalidatePath('/admin/accounts');

  return {
    ok: true,
    message:
      status === 'active'
        ? 'الخدمة فعّالة. صاحب المتجر يستطيع الدخول.'
        : 'أُوقفت الخدمة. الدخول محجوب وauth_store_id ترجع فارغة — أي لا يرى أي صف.',
  };
}

export async function renewSubscription(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const storeId = String(formData.get('store_id') ?? '');
  const months = Number(formData.get('months') ?? 1) || 1;

  const sb = supabaseAdmin();
  const { data: store } = await sb
    .from('stores').select('subscription_expires_at').eq('id', storeId).maybeSingle();

  // التجديد يبدأ من تاريخ الانتهاء إن كان مستقبلاً، ومن اليوم إن كان قد مضى —
  // فلا تضيع أيام على المتجر ولا يُمنح وقت مجاني.
  const base = store?.subscription_expires_at ? new Date(store.subscription_expires_at) : new Date();
  const start = base > new Date() ? base : new Date();
  const next = new Date(start);
  next.setMonth(next.getMonth() + months);

  const { error } = await sb
    .from('stores')
    .update({ subscription_expires_at: next.toISOString(), service_status: 'active' })
    .eq('id', storeId);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath(`/admin/accounts/${storeId}`);
  return { ok: true, message: `جُدّد الاشتراك حتى ${next.toLocaleDateString('ar-IQ')}.` };
}

export async function toggleStoreUser(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const storeUserId = String(formData.get('store_user_id') ?? '');
  const next = formData.get('next') === '1';

  const sb = supabaseAdmin();
  const { data: su } = await sb
    .from('store_users').select('store_id').eq('id', storeUserId).maybeSingle();

  const { error } = await sb.from('store_users').update({ is_active: next }).eq('id', storeUserId);
  if (error) return { ok: false, error: humanizeDbError(error.message) };

  if (su) revalidatePath(`/admin/accounts/${su.store_id}`);
  return { ok: true, message: next ? 'فُعّل الحساب.' : 'أُوقف الحساب.' };
}
