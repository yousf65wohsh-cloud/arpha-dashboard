import 'server-only';
import { supabaseAdmin } from './supabase/admin';
import type { ModuleKey } from './business-types';

/** الوحدات المفعَّلة لمتجر — لمسار الأدمن (service_role). */
export async function getStoreModules(storeId: string): Promise<ModuleKey[]> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('store_modules')
    .select('module_key')
    .eq('store_id', storeId)
    .eq('enabled', true)
    .order('sort_order');

  return ((data ?? []) as { module_key: ModuleKey }[]).map((r) => r.module_key);
}
