'use client';

import { useState } from 'react';
import { createItem, updateItem, toggleItem } from './actions';
import { SubmitButton } from '@/components/store/SubmitButton';
import { Empty } from '@/components/store/Notice';
import { IconPlus, IconEdit, IconEye, IconEyeOff } from '@/components/store/Icons';
import type { CatalogItem } from '@/lib/types';

type Msg = { ok: boolean; text: string } | null;

export function CatalogClient({
  items, storeId, isFull, hasServices,
}: { items: CatalogItem[]; storeId: string; isFull: boolean; hasServices: boolean }) {
  const [msg, setMsg] = useState<Msg>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const wrap =
    (fn: (fd: FormData) => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    async (fd: FormData) => {
      const r = await fn(fd);
      setMsg({ ok: r.ok, text: r.ok ? (r.message ?? 'تم.') : (r.error ?? 'خطأ.') });
      if (r.ok) { setEditing(null); setAdding(false); }
    };

  return (
    <>
      {msg && <div className={`ar-note ar-note-${msg.ok ? 'info' : 'err'}`}>{msg.text}</div>}

      <div className="ar-card">
        <div className="ar-card-head">
          <h2>{items.length} عنصر</h2>
          {!adding && (
            <button
              className="ar-btn ar-btn-primary ar-btn-sm"
              style={{ marginInlineStart: 'auto' }}
              onClick={() => setAdding(true)}
              disabled={isFull}
            >
              <IconPlus size={15} /> أضف عنصراً
            </button>
          )}
        </div>

        {adding && (
          <form action={wrap(createItem)} style={{ marginBottom: 18 }}>
            <input type="hidden" name="store_id" value={storeId} />
            <div className="ar-row">
              <label className="ar-field">
                <span>الاسم</span>
                <input className="ar-input" name="name" required autoFocus placeholder="قميص أسود قطن" />
              </label>
              <label className="ar-field">
                <span>النوع</span>
                <select className="ar-select" name="kind" defaultValue={hasServices ? 'service' : 'product'}>
                  <option value="product">منتج</option>
                  <option value="service">خدمة</option>
                </select>
              </label>
            </div>
            <div className="ar-row">
              <label className="ar-field">
                <span>السعر (دينار)</span>
                <input className="ar-input ar-num" name="price" inputMode="numeric" placeholder="25000" />
              </label>
              <label className="ar-field">
                <span>التصنيف</span>
                <input className="ar-input" name="category" placeholder="اختياري" />
              </label>
            </div>
            <label className="ar-field">
              <span>الوصف</span>
              <input className="ar-input" name="description" placeholder="ما يحتاج الزبون معرفته" />
            </label>
            <div className="ar-reply-bar">
              <button type="button" className="ar-btn ar-btn-ghost ar-btn-sm" onClick={() => setAdding(false)}>
                إلغاء
              </button>
              <SubmitButton pendingText="جارٍ الإضافة…">أضف العنصر</SubmitButton>
            </div>
          </form>
        )}

        {items.length === 0 ? (
          <Empty
            title="لا عناصر بعد"
            body="أضف أول منتج أو خدمة — البوت لا يستطيع عرض ما لا يعرفه."
          />
        ) : (
          <div className="ar-list">
            {items.map((it) =>
              editing === it.id ? (
                <form className="ar-item" key={it.id} action={wrap(updateItem)}>
                  <input type="hidden" name="id" value={it.id} />
                  <input type="hidden" name="kind" value={it.kind} />
                  <div className="ar-item-main">
                    <div className="ar-row">
                      <label className="ar-field">
                        <span>الاسم</span>
                        <input className="ar-input" name="name" defaultValue={it.name} required />
                      </label>
                      <label className="ar-field">
                        <span>السعر</span>
                        <input className="ar-input ar-num" name="price" defaultValue={it.price ?? ''} inputMode="numeric" />
                      </label>
                    </div>
                    <div className="ar-row">
                      <label className="ar-field">
                        <span>الوصف</span>
                        <input className="ar-input" name="description" defaultValue={it.description ?? ''} />
                      </label>
                      {it.kind === 'product' ? (
                        <label className="ar-field">
                          <span>المخزون</span>
                          <input className="ar-input ar-num" name="stock" type="number" min={0}
                                 defaultValue={it.stock ?? 0} />
                        </label>
                      ) : (
                        <label className="ar-field">
                          <span>التصنيف</span>
                          <input className="ar-input" name="category" defaultValue={it.category ?? ''} />
                        </label>
                      )}
                    </div>
                    <div className="ar-item-actions">
                      <SubmitButton small>احفظ</SubmitButton>
                      <button type="button" className="ar-btn ar-btn-ghost ar-btn-sm" onClick={() => setEditing(null)}>
                        إلغاء
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="ar-item" key={it.id}>
                  <div className="ar-item-main">
                    <div className="ar-item-title">
                      {it.name}{' '}
                      <span className="ar-badge">{it.kind === 'service' ? 'خدمة' : 'منتج'}</span>{' '}
                      {!it.is_active && <span className="ar-badge ar-badge-brass">مخفي</span>}
                      {it.kind === 'product' && it.stock === 0 && (
                        <span className="ar-badge ar-badge-pom">نفد المخزون</span>
                      )}
                    </div>
                    <div className="ar-item-sub">
                      {it.price != null && <span className="ar-num">{it.price.toLocaleString('ar-IQ')} د.ع</span>}
                      {it.price != null && it.description ? ' — ' : ''}
                      {it.description}
                    </div>
                  </div>
                  <div className="ar-item-actions">
                    <button className="ar-btn ar-btn-ghost ar-btn-sm" onClick={() => setEditing(it.id)}>
                      <IconEdit size={14} /> تعديل
                    </button>
                    <form action={wrap(toggleItem)}>
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="kind" value={it.kind} />
                      <input type="hidden" name="next" value={it.is_active ? '0' : '1'} />
                      <SubmitButton variant={it.is_active ? 'danger' : 'ghost'} small pendingText="…">
                        {it.is_active ? <><IconEyeOff size={14} /> إخفاء</> : <><IconEye size={14} /> إظهار</>}
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
