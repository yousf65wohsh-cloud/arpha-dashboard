'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin-guard';
import type { ActionResult } from '@/lib/types';

export async function saveSupportSettings(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const phone = String(formData.get('support_phone') ?? '').trim();
  if (!/^[0-9+\s-]{8,20}$/.test(phone)) {
    return { ok: false, error: 'رقم الهاتف غير صالح.' };
  }

  const rows = [
    { key: 'support_phone', value: phone },
    { key: 'support_whatsapp', value: String(formData.get('support_whatsapp') ?? '').trim() },
    { key: 'support_telegram', value: String(formData.get('support_telegram') ?? '').trim().replace(/^@/, '') },
    { key: 'support_hours', value: String(formData.get('support_hours') ?? '').trim() },
  ].map((r) => ({ ...r, updated_at: new Date().toISOString() }));

  const sb = supabaseAdmin();
  const { error } = await sb.from('platform_settings').upsert(rows, { onConflict: 'key' });
  if (error) return { ok: false, error: error.message };

  // كل صفحات البوابة تعرض الزر، فالتحديث يشملها جميعاً
  revalidatePath('/store', 'layout');
  revalidatePath('/admin/settings');
  return { ok: true, message: 'حُفظت إعدادات التواصل. تظهر لأصحاب المتاجر فوراً.' };
}
