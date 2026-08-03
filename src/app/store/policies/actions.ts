'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { humanizeDbError } from '@/lib/limits';
import type { ActionResult } from '@/lib/types';

export async function createPolicy(formData: FormData): Promise<ActionResult> {
  const question = String(formData.get('question') ?? '').trim();
  const answer = String(formData.get('answer') ?? '').trim();
  const category = String(formData.get('category') ?? 'general');
  const storeId = String(formData.get('store_id') ?? '');

  if (question.length < 2) return { ok: false, error: 'اكتب السؤال الذي تجيب عنه هذه السياسة.' };
  if (answer.length < 5) return { ok: false, error: 'الجواب قصير جداً.' };

  const sb = await supabaseServer();
  // source مقيّد في القاعدة بـ manual | auto_learned. اليدوي هنا 'manual'.
  const { error } = await sb.from('policies').insert({
    store_id: storeId, question, answer, category, source: 'manual',
  });

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/store/policies');
  revalidatePath('/store');
  return { ok: true, message: 'أُضيفت السياسة. البوت يستطيع الرجوع إليها من الآن.' };
}

export async function updatePolicy(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('id') ?? '');
  const question = String(formData.get('question') ?? '').trim();
  const answer = String(formData.get('answer') ?? '').trim();
  const category = String(formData.get('category') ?? 'general');

  if (question.length < 2 || answer.length < 5) return { ok: false, error: 'السؤال أو الجواب ناقص.' };

  const sb = await supabaseServer();
  // updated_at يُحدَّث صراحة — لا trigger عليه، والفهرس يعتمد ترتيبه.
  const { error } = await sb
    .from('policies')
    .update({ question, answer, category, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/store/policies');
  return { ok: true, message: 'حُفظت التعديلات.' };
}

export async function togglePolicy(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('id') ?? '');
  const next = formData.get('next') === '1';

  const sb = await supabaseServer();
  const { error } = await sb
    .from('policies')
    .update({ is_active: next, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/store/policies');
  revalidatePath('/store');
  return { ok: true, message: next ? 'أُعيد تفعيل السياسة.' : 'عُطّلت السياسة وتحرّرت خانتها.' };
}
