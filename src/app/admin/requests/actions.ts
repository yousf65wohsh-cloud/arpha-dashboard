'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin-guard';
import { humanizeDbError } from '@/lib/limits';
import type { ActionResult } from '@/lib/types';

export async function resolveRequest(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get('request_id') ?? '');
  const status = String(formData.get('status') ?? '');
  const note = String(formData.get('admin_note') ?? '').trim();

  if (!['done', 'rejected'].includes(status)) return { ok: false, error: 'حالة غير معروفة.' };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from('store_change_requests')
    .update({ status, admin_note: note || null, resolved_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/admin/requests');
  return { ok: true, message: status === 'done' ? 'أُغلق الطلب كمنفّذ.' : 'رُفض الطلب.' };
}
