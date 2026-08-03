'use client';

import { useState } from 'react';
import { createPolicy, updatePolicy, togglePolicy } from './actions';
import { SubmitButton } from '@/components/store/SubmitButton';
import { Empty } from '@/components/store/Notice';
import { IconPlus, IconEdit } from '@/components/store/Icons';
import { POLICY_CATEGORIES, type StorePolicy } from '@/lib/types';

export function PoliciesClient({
  rows, storeId, isFull,
}: { rows: StorePolicy[]; storeId: string; isFull: boolean }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const wrap =
    (fn: (fd: FormData) => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    async (fd: FormData) => {
      const r = await fn(fd);
      setMsg({ ok: r.ok, text: r.ok ? (r.message ?? 'تم.') : (r.error ?? 'خطأ.') });
      if (r.ok) { setEditing(null); setAdding(false); }
    };

  const CategorySelect = ({ value }: { value?: string }) => (
    <label className="ar-field">
      <span>التصنيف</span>
      <select className="ar-select" name="category" defaultValue={value ?? 'general'}>
        {Object.entries(POLICY_CATEGORIES).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </label>
  );

  return (
    <>
      {msg && <div className={`ar-note ar-note-${msg.ok ? 'info' : 'err'}`}>{msg.text}</div>}

      <div className="ar-card">
        <div className="ar-card-head">
          <h2>{rows.length} سياسة</h2>
          {!adding && (
            <button
              className="ar-btn ar-btn-primary ar-btn-sm"
              style={{ marginInlineStart: 'auto' }}
              onClick={() => setAdding(true)}
              disabled={isFull}
            >
              <IconPlus size={15} /> أضف سياسة
            </button>
          )}
        </div>

        {adding && (
          <form action={wrap(createPolicy)} style={{ marginBottom: 18 }}>
            <input type="hidden" name="store_id" value={storeId} />
            <div className="ar-row">
              <label className="ar-field">
                <span>السؤال</span>
                <input className="ar-input" name="question" required autoFocus
                       placeholder="كم أجور التوصيل؟" />
              </label>
              <CategorySelect />
            </div>
            <label className="ar-field">
              <span>الجواب</span>
              <textarea name="answer" required
                        placeholder="التوصيل داخل بغداد ٥ آلاف دينار، وخارجها ١٠ آلاف. المدة يوم إلى يومين." />
            </label>
            <div className="ar-reply-bar">
              <button type="button" className="ar-btn ar-btn-ghost ar-btn-sm" onClick={() => setAdding(false)}>
                إلغاء
              </button>
              <SubmitButton>أضف السياسة</SubmitButton>
            </div>
          </form>
        )}

        {rows.length === 0 ? (
          <Empty
            title="لا سياسات بعد"
            body="السياسة سؤال وجوابه: «كم أجور التوصيل؟» ← الجواب. يبحث فيها البوت قبل أن يرد. تُضاف هنا، أو تلقائياً حين تجاوب على سؤال معلّق."
          />
        ) : (
          <div className="ar-list">
            {rows.map((p) =>
              editing === p.id ? (
                <form className="ar-item" key={p.id} action={wrap(updatePolicy)}>
                  <input type="hidden" name="id" value={p.id} />
                  <div className="ar-item-main">
                    <div className="ar-row">
                      <label className="ar-field">
                        <span>السؤال</span>
                        <input className="ar-input" name="question" defaultValue={p.question} required />
                      </label>
                      <CategorySelect value={p.category} />
                    </div>
                    <label className="ar-field">
                      <span>الجواب</span>
                      <textarea name="answer" defaultValue={p.answer} required />
                    </label>
                    <div className="ar-item-actions">
                      <SubmitButton small>احفظ</SubmitButton>
                      <button type="button" className="ar-btn ar-btn-ghost ar-btn-sm" onClick={() => setEditing(null)}>
                        إلغاء
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="ar-item" key={p.id}>
                  <div className="ar-item-main">
                    <div className="ar-item-title">
                      {p.question}{' '}
                      <span className="ar-badge">{POLICY_CATEGORIES[p.category] ?? p.category}</span>{' '}
                      {p.source === 'auto_learned' && <span className="ar-badge ar-badge-teal">من سؤال زبون</span>}{' '}
                      {!p.is_active && <span className="ar-badge ar-badge-brass">معطّلة</span>}{' '}
                      {p.disabled_by_admin && <span className="ar-badge ar-badge-pom">أوقفتها الإدارة</span>}
                    </div>
                    <div className="ar-item-sub">{p.answer}</div>
                  </div>
                  <div className="ar-item-actions">
                    <button className="ar-btn ar-btn-ghost ar-btn-sm" onClick={() => setEditing(p.id)}>
                      <IconEdit size={14} /> تعديل
                    </button>
                    <form action={wrap(togglePolicy)}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="next" value={p.is_active ? '0' : '1'} />
                      <SubmitButton variant={p.is_active ? 'danger' : 'ghost'} small pendingText="…">
                        {p.is_active ? 'تعطيل' : 'تفعيل'}
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
