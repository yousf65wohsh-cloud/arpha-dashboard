'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { humanizeDbError } from '@/lib/limits';
import type { ActionResult } from '@/lib/types';

// إرسال الرد للزبون يمر عبر n8n، لا عبر Telegram مباشرة.
// السبب معماري: توكنات البوتات تعيش في credential store الخاص بـ n8n
// و store_platform_credentials فارغ بالتصميم. لو وضعنا التوكن في Vercel
// لصار له مكانان للحقيقة — وهذا بالضبط ما تتجنّبه بنية المشروع.
//
// متغيرات البيئة المطلوبة:
//   ARPHA_N8N_REPLY_WEBHOOK   مثال: https://n8n.7azgroup.com/webhook/arpha-reply
//   ARPHA_N8N_WEBHOOK_SECRET  سر مشترك يتحقق منه n8n في الترويسة
async function sendViaN8n(payload: {
  store_id: string;
  chat_id: string;
  text: string;
  question_id: string;
}): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.ARPHA_N8N_REPLY_WEBHOOK;
  if (!url) return { ok: false, error: 'مسار الإرسال غير مضبوط (ARPHA_N8N_REPLY_WEBHOOK).' };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-arpha-secret': process.env.ARPHA_N8N_WEBHOOK_SECRET ?? '',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) return { ok: false, error: `n8n رجّع الحالة ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'تعذّر الوصول إلى n8n' };
  }
}

export async function answerQuestion(formData: FormData): Promise<ActionResult> {
  const questionId = String(formData.get('question_id') ?? '');
  const answer = String(formData.get('answer') ?? '').trim();
  const saveAsPolicy = formData.get('save_as_policy') === 'on';
  const sendToCustomer = formData.get('send_to_customer') === 'on';
  const category = String(formData.get('category') ?? 'general');

  if (answer.length < 2) return { ok: false, error: 'اكتب الجواب أولاً.' };

  const sb = await supabaseServer();

  // RPC واحدة تكتب السياسة وتغلق السؤال معاً — لا حالة نصف منجزة.
  const { data, error } = await sb.rpc('store_answer_question', {
    p_question_id: questionId,
    p_answer: answer,
    p_save_as_policy: saveAsPolicy,
    p_category: category,
  });

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  const result = data as { telegram_chat_id: string | null; answer: string };
  let message = saveAsPolicy ? 'حُفظ الجواب وأضيف إلى السياسات.' : 'حُفظ الجواب.';

  if (sendToCustomer) {
    if (!result?.telegram_chat_id) {
      message += ' لم يُرسل للزبون: لا توجد محادثة مرتبطة بهذا السؤال.';
    } else {
      const sent = await sendViaN8n({
        store_id: String(formData.get('store_id') ?? ''),
        chat_id: result.telegram_chat_id,
        text: answer,
        question_id: questionId,
      });

      await sb.rpc('store_mark_question_sent', {
        p_question_id: questionId,
        p_ok: sent.ok,
        p_error: sent.error ?? null,
      });

      message += sent.ok ? ' وأُرسل للزبون.' : ` لكن الإرسال للزبون فشل: ${sent.error}`;
    }
  }

  revalidatePath('/store/questions');
  revalidatePath('/store');
  return { ok: true, message };
}

export async function dismissQuestion(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('question_id') ?? '');
  const sb = await supabaseServer();

  const { error } = await sb
    .from('pending_followups')
    .update({ status: 'dismissed', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/store/questions');
  revalidatePath('/store');
  return { ok: true, message: 'أُهمل السؤال.' };
}
