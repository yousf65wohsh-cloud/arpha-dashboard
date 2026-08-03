'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { humanizeDbError } from '@/lib/limits';
import type { ActionResult } from '@/lib/types';

export async function createRule(formData: FormData): Promise<ActionResult> {
  const text = String(formData.get('rule_text') ?? '').trim();
  const priority = Number(formData.get('priority') ?? 100) || 100;
  const storeId = String(formData.get('store_id') ?? '');

  if (text.length < 3) return { ok: false, error: 'اكتب نص القاعدة.' };
  if (text.length > 500) return { ok: false, error: 'القاعدة طويلة. اجعلها جملة أو جملتين.' };

  const sb = await supabaseServer();
  const { error } = await sb.from('bot_rules').insert({
    store_id: storeId, rule_text: text, priority,
  });

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/store/rules');
  revalidatePath('/store');
  return { ok: true, message: 'أُضيفت القاعدة. يطبّقها البوت من الرسالة القادمة.' };
}

export async function updateRule(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('id') ?? '');
  const text = String(formData.get('rule_text') ?? '').trim();
  const priority = Number(formData.get('priority') ?? 100) || 100;

  if (text.length < 3) return { ok: false, error: 'نص القاعدة فارغ.' };

  const sb = await supabaseServer();
  const { error } = await sb
    .from('bot_rules')
    .update({ rule_text: text, priority, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/store/rules');
  return { ok: true, message: 'حُفظت القاعدة.' };
}

export async function toggleRule(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('id') ?? '');
  const next = formData.get('next') === '1';

  const sb = await supabaseServer();
  const { error } = await sb.from('bot_rules').update({ is_active: next }).eq('id', id);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/store/rules');
  revalidatePath('/store');
  return { ok: true, message: next ? 'فُعّلت القاعدة.' : 'عُطّلت القاعدة وتحرّرت خانتها.' };
}
