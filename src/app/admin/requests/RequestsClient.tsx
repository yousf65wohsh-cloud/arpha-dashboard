'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resolveRequest } from './actions';
import { SubmitButton } from '@/components/store/SubmitButton';
import { REQUEST_TYPES, type ChangeRequest } from '@/lib/types';

type Row = ChangeRequest & { store_name?: string };

export function RequestsClient({ rows }: { rows: Row[] }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function act(fd: FormData) {
    const r = await resolveRequest(fd);
    setMsg({ ok: r.ok, text: r.ok ? (r.message ?? 'تم.') : (r.error ?? 'خطأ.') });
  }

  if (rows.length === 0) {
    return (
      <div className="ar-card">
        <div className="ar-empty">
          <h3>لا طلبات مفتوحة</h3>
          <p>يظهر الطلب هنا حين يرسله صاحب متجر من صفحة حسابه.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {msg && <div className={`ar-note ar-note-${msg.ok ? 'info' : 'err'}`}>{msg.text}</div>}

      <div style={{ display: 'grid', gap: 12 }}>
        {rows.map((r) => (
          <div className="ar-card" key={r.id}>
            <div className="ar-card-head">
              <span className="ar-badge ar-badge-brass">{REQUEST_TYPES[r.request_type]}</span>
              <strong>{r.store_name ?? r.store_id}</strong>
              <span className="ar-hint">{new Date(r.created_at).toLocaleString('ar-IQ')}</span>
            </div>

            {r.details && <p style={{ marginBottom: 12 }}>{r.details}</p>}

            <p className="ar-hint" style={{ marginBottom: 12 }}>
              {r.request_type === 'password_reset' || r.request_type === 'login_id_change'
                ? 'نفّذ التغيير من صفحة المتجر أولاً، ثم أغلق الطلب هنا.'
                : 'عدّل الباقة أو التجاوز من صفحة المتجر، ثم أغلق الطلب.'}
            </p>

            <form action={act}>
              <input type="hidden" name="request_id" value={r.id} />
              <label className="ar-field">
                <span>ردّ يراه صاحب المتجر</span>
                <input className="ar-input" name="admin_note" placeholder="اختياري" />
              </label>
              <div className="ar-item-actions">
                <Link className="ar-btn ar-btn-ghost ar-btn-sm" href={`/admin/accounts/${r.store_id}`}>
                  افتح المتجر
                </Link>
                <button type="submit" name="status" value="done" className="ar-btn ar-btn-primary ar-btn-sm">
                  نُفّذ
                </button>
                <button type="submit" name="status" value="rejected" className="ar-btn ar-btn-danger ar-btn-sm">
                  ارفض
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
