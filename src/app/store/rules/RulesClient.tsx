'use client';

import { useState } from 'react';
import { createRule, updateRule, toggleRule } from './actions';
import { SubmitButton } from '@/components/store/SubmitButton';
import { Empty } from '@/components/store/Notice';
import type { BotRule } from '@/lib/types';

const EXAMPLES = [
  'خاطب الزبون بصيغة الاحترام دائماً ولا تستخدم لهجة عامية زائدة.',
  'إذا سأل الزبون عن سعر غير موجود في قائمتك، لا تخمّن — حوّله للمدير.',
  'اذكر أجور التوصيل مع كل طلب قبل التأكيد.',
];

export function RulesClient({
  rows, storeId, isFull,
}: { rows: BotRule[]; storeId: string; isFull: boolean }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const wrap =
    (fn: (fd: FormData) => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    async (fd: FormData) => {
      const r = await fn(fd);
      setMsg({ ok: r.ok, text: r.ok ? (r.message ?? 'تم.') : (r.error ?? 'خطأ.') });
      if (r.ok) { setEditing(null); setDraft(''); }
    };

  return (
    <>
      {msg && <div className={`ar-note ar-note-${msg.ok ? 'info' : 'err'}`}>{msg.text}</div>}

      <div className="ar-card">
        <div className="ar-card-head">
          <h2>أضف قاعدة</h2>
          <span className="ar-hint">جملة واحدة واضحة تصف سلوكاً تريده في كل رد</span>
        </div>

        <form action={wrap(createRule)}>
          <input type="hidden" name="store_id" value={storeId} />
          <label className="ar-field">
            <textarea
              name="rule_text" value={draft} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
              placeholder={EXAMPLES[0]} maxLength={500} required disabled={isFull}
            />
          </label>
          <div className="ar-reply-bar">
            <span className="ar-hint">{draft.length}/500</span>
            <label className="ar-check">
              الأولوية
              <input
                className="ar-input ar-num" name="priority" type="number" defaultValue={100}
                min={1} max={999} style={{ width: 74 }}
              />
            </label>
            <SubmitButton disabled={isFull || draft.trim().length < 3}>أضف القاعدة</SubmitButton>
          </div>
          <p className="ar-hint" style={{ marginTop: 6 }}>
            الرقم الأصغر يُقرأ أولاً عند تعارض قاعدتين.
          </p>
        </form>

        {!isFull && rows.length === 0 && (
          <div style={{ marginTop: 14 }}>
            <p className="ar-hint" style={{ marginBottom: 6 }}>أمثلة يمكنك البدء منها:</p>
            {EXAMPLES.map((e) => (
              <button
                key={e} type="button" className="ar-btn ar-btn-ghost ar-btn-sm"
                style={{ margin: '0 0 6px 6px', textAlign: 'start' }}
                onClick={() => setDraft(e)}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ar-card">
        <div className="ar-card-head"><h2>{rows.length} قاعدة</h2></div>

        {rows.length === 0 ? (
          <Empty
            title="لا قواعد بعد"
            body="بدون قواعد يتصرّف البوت بسلوكه الافتراضي. كل قاعدة تضيفها تُقرأ مع كل رسالة."
          />
        ) : (
          <div className="ar-list">
            {rows.map((r) =>
              editing === r.id ? (
                <form className="ar-item" key={r.id} action={wrap(updateRule)}>
                  <input type="hidden" name="id" value={r.id} />
                  <div className="ar-item-main">
                    <label className="ar-field">
                      <textarea name="rule_text" defaultValue={r.rule_text} required maxLength={500} />
                    </label>
                    <div className="ar-item-actions">
                      <input
                        className="ar-input ar-num" name="priority" type="number"
                        defaultValue={r.priority} style={{ width: 74 }}
                      />
                      <SubmitButton small>احفظ</SubmitButton>
                      <button type="button" className="ar-btn ar-btn-ghost ar-btn-sm" onClick={() => setEditing(null)}>
                        إلغاء
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="ar-item" key={r.id}>
                  <div className="ar-item-main">
                    <div className="ar-item-title">
                      {r.rule_text}{' '}
                      {!r.is_active && <span className="ar-badge ar-badge-brass">معطّلة</span>}
                    </div>
                    <div className="ar-item-sub ar-num">أولوية {r.priority}</div>
                  </div>
                  <div className="ar-item-actions">
                    <button className="ar-btn ar-btn-ghost ar-btn-sm" onClick={() => setEditing(r.id)}>
                      تعديل
                    </button>
                    <form action={wrap(toggleRule)}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="next" value={r.is_active ? '0' : '1'} />
                      <SubmitButton variant={r.is_active ? 'danger' : 'ghost'} small pendingText="…">
                        {r.is_active ? 'تعطيل' : 'تفعيل'}
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </>
  );
}
