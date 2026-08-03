'use client';

import { useState } from 'react';
import { answerQuestion, dismissQuestion } from './actions';
import { SubmitButton } from '@/components/store/SubmitButton';
import { POLICY_CATEGORIES, GAP_TYPES, type PendingQuestion, type PolicyCategory } from '@/lib/types';

// السؤال جاء من محادثة تلغرام والجواب يعود إليها، فالشاشة نفسها محادثة:
// فقاعة الزبون، فقاعة رد البوت الخاطئ، ثم صندوق ردّ صاحب المتجر.
export function TeachCard({
  q, storeId, policiesFull,
}: { q: PendingQuestion; storeId: string; policiesFull: boolean }) {
  const [answer, setAnswer] = useState('');
  const [savePolicy, setSavePolicy] = useState(!policiesFull);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [done, setDone] = useState(false);

  if (done) return null;

  async function onAnswer(formData: FormData) {
    const r = await answerQuestion(formData);
    if (r.ok) {
      setResult({ ok: true, text: r.message ?? 'تم.' });
      setTimeout(() => setDone(true), 1600);
    } else {
      setResult({ ok: false, text: r.error });
    }
  }

  async function onDismiss(formData: FormData) {
    const r = await dismissQuestion(formData);
    if (r.ok) setDone(true);
    else setResult({ ok: false, text: r.error });
  }

  return (
    <div className="ar-card">
      <div className="ar-card-head">
        <span className="ar-badge">{GAP_TYPES[q.gap_type] ?? q.gap_type}</span>
        <span className="ar-hint">{new Date(q.created_at).toLocaleString('ar-IQ')}</span>
      </div>

      <div className="ar-thread">
        <div className="ar-bubble ar-bubble-in">
          <span className="ar-bubble-tag">الزبون</span>
          {q.question_text}
        </div>

        {q.bot_reply && (
          <div className="ar-bubble ar-bubble-bot">
            <span className="ar-bubble-tag">ردّ البوت</span>
            {q.bot_reply}
          </div>
        )}

        {answer.trim().length > 1 && (
          <div className="ar-bubble ar-bubble-new">
            <span className="ar-bubble-tag">الجواب الصحيح</span>
            {answer}
          </div>
        )}
      </div>

      {result && (
        <div className={`ar-note ar-note-${result.ok ? 'info' : 'err'}`} style={{ marginTop: 14 }}>
          {result.text}
        </div>
      )}

      <form action={onAnswer} className="ar-reply">
        <input type="hidden" name="question_id" value={q.id} />
        <input type="hidden" name="store_id" value={storeId} />

        <label className="ar-field" style={{ marginBottom: 8 }}>
          <span>اكتب ما كان يجب أن يقوله البوت</span>
          <textarea
            name="answer" value={answer} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
            placeholder="مثال: التوصيل داخل بغداد ٥ آلاف دينار ويوصل خلال يوم واحد."
            required
          />
        </label>

        {savePolicy && (
          <label className="ar-field" style={{ marginBottom: 4, maxWidth: 260 }}>
            <span>تصنيف السياسة</span>
            <select className="ar-select" name="category" defaultValue="general">
              {Object.entries(POLICY_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k as PolicyCategory}>{v}</option>
              ))}
            </select>
          </label>
        )}

        <div className="ar-reply-bar">
          <label className="ar-check">
            <input
              type="checkbox" name="save_as_policy" checked={savePolicy}
              disabled={policiesFull}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSavePolicy(e.target.checked)}
            />
            احفظه في السياسات ليستخدمه البوت مستقبلاً
          </label>

          <label className="ar-check">
            <input
              type="checkbox" name="send_to_customer"
              defaultChecked={Boolean(q.telegram_chat_id)}
              disabled={!q.telegram_chat_id}
            />
            أرسله للزبون الآن
          </label>

          <SubmitButton pendingText="جارٍ الحفظ…" disabled={answer.trim().length < 2}>
            احفظ الجواب
          </SubmitButton>
        </div>

        {policiesFull && (
          <p className="ar-hint" style={{ marginTop: 8 }}>
            خانات السياسات ممتلئة، فالحفظ في السياسات معطّل. يمكنك الرد على الزبون،
            أو تعطيل سياسة قديمة لتحرير خانة.
          </p>
        )}
      </form>

      <form action={onDismiss} style={{ marginTop: 10 }}>
        <input type="hidden" name="question_id" value={q.id} />
        <SubmitButton variant="danger" small pendingText="…">تجاهل هذا السؤال</SubmitButton>
      </form>
    </div>
  );
}
