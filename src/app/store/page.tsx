import Link from 'next/link';
import { requireStoreSession } from '@/lib/auth/store-session';
import { supabaseServer } from '@/lib/supabase/server';
import { StoreChrome } from '@/components/store/StoreChrome';
import { getSupportSettings } from '@/lib/settings';
import { LimitMeter } from '@/components/store/LimitMeter';
import { IconQuestion, IconCheck } from '@/components/store/Icons';

export const dynamic = 'force-dynamic';

export default async function StoreHome() {
  const [session, support] = await Promise.all([
    requireStoreSession(),
    getSupportSettings(),
  ]);
  const sb = await supabaseServer();
  const { limits } = session;

  const { data: recent } = await sb
    .from('pending_followups')
    .select('id, question_text, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <StoreChrome session={session} current="/store" support={support}>
      {limits.pending_count > 0 ? (
        <div className="ar-note ar-note-warn">
          <IconQuestion size={15} />{' '}<strong>{limits.pending_count}</strong> سؤال ينتظر جوابك. كل جواب تكتبه يصبح
          معرفة يستخدمها البوت مع بقية الزبائن.{' '}
          <Link href="/store/questions">افتح الأسئلة المعلقة ←</Link>
        </div>
      ) : (
        <div className="ar-note ar-note-info">
          <IconCheck size={15} />{' '}لا توجد أسئلة معلقة. البوت فهم كل ما وصله حتى الآن.
        </div>
      )}

      <div className="ar-grid">
        <div className="ar-card">
          <LimitMeter label="المنتجات والخدمات" used={limits.catalog_used} limit={limits.catalog_limit} />
        </div>
        <div className="ar-card">
          <LimitMeter label="السياسات" used={limits.policies_used} limit={limits.policies_limit} />
        </div>
        <div className="ar-card">
          <LimitMeter label="قواعد البوت" used={limits.rules_used} limit={limits.rules_limit} />
        </div>
      </div>

      {recent && recent.length > 0 && (
        <div className="ar-card" style={{ marginTop: 12 }}>
          <div className="ar-card-head">
            <h2>آخر ما لم يفهمه البوت</h2>
            <Link className="ar-hint" href="/store/questions">عرض الكل</Link>
          </div>
          <div className="ar-list">
            {(recent as { id: string; question_text: string; created_at: string }[]).map((q) => (
              <div className="ar-item" key={q.id}>
                <div className="ar-item-main">
                  <div className="ar-item-title">{q.question_text}</div>
                  <div className="ar-item-sub">
                    {new Date(q.created_at).toLocaleString('ar-IQ')}
                  </div>
                </div>
                <div className="ar-item-actions">
                  <Link className="ar-btn ar-btn-ghost ar-btn-sm" href="/store/questions">
                    جاوب
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </StoreChrome>
  );
}
