// حارس جلسة صاحب المتجر. كل صفحة تحت /store تبدأ بـ requireStoreSession().

import { redirect } from 'next/navigation';
import { supabaseServer } from '../supabase/server';
import type { Limits, StoreUser } from '../types';

export type StoreSession = {
  user: StoreUser;
  storeId: string;
  storeName: string;
  limits: Limits;
};

export async function getStoreSession(): Promise<StoreSession | null> {
  const sb = await supabaseServer();

  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return null;

  // RLS تحصر النتيجة في صف المستخدم نفسه.
  const { data: su } = await sb
    .from('store_users')
    .select('*')
    .eq('auth_user_id', auth.user.id)
    .maybeSingle();

  if (!su || !su.is_active) return null;

  // الاستعلامان مستقلان، فيمشيان معاً — يوفّر رحلة كاملة إلى القاعدة.
  const [{ data: store }, { data: limits }] = await Promise.all([
    sb.from('stores').select('id, name').eq('id', su.store_id).maybeSingle(),
    sb.rpc('store_my_limits'),
  ]);

  if (!store) return null;

  return {
    user: su as StoreUser,
    storeId: store.id,
    storeName: store.name,
    limits: limits as Limits,
  };
}

export async function requireStoreSession(): Promise<StoreSession> {
  const session = await getStoreSession();
  if (!session) redirect('/store/login?reason=session');
  return session;
}
