'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

// صاحب المتجر لا يغيّر معرّف دخوله ولا كلمة مروره بنفسه — يفتح طلباً والأدمن ينفّذه.
// هذا قرار منتج مقصود، لا نقص في الواجهة.
export async function openRequest(formData: FormData): Promise<void> {
  const type = String(formData.get('request_type') ?? '');
  const details = String(formData.get('details') ?? '').trim();
  const storeId = String(formData.get('store_id') ?? '');
  const userId = String(formData.get('user_id') ?? '');

  if (!['password_reset', 'login_id_change', 'plan_upgrade', 'other'].includes(type)) {
    return;
  }

  const sb = await supabaseServer();

  const { count } = await sb
    .from('store_change_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open')
    .eq('request_type', type);

  if ((count ?? 0) > 0) {
    return;
  }

  const { error } = await sb.from('store_change_requests').insert({
    store_id: storeId,
    requested_by: userId,
    request_type: type,
    details: details || null,
  });

  if (error) return;

  revalidatePath('/store/account');
}
