import { requireStoreSession } from '@/lib/auth/store-session';
import { supabaseServer } from '@/lib/supabase/server';
import { StoreChrome } from '@/components/store/StoreChrome';
import { Empty } from '@/components/store/Notice';
import { TeachCard } from './TeachCard';
import type { PendingQuestion } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function QuestionsPage({
  searchParams,
}: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const showAnswered = tab === 'resolved';

  const session = await requireStoreSession();
  const sb = await supabaseServer();

  const { data } = await sb
    .from('pending_followups')
    .select('*')
    .eq('status', showAnswered ? 'resolved' : 'pending')
    .order(showAnswered ? 'resolved_at' : 'created_at', { ascending: false })
    .limit(50);

  const rows = (data ?? []) as PendingQuestion[];
  const policiesFull = session.limits.policies_used >= session.limits.policies_limit;

  return (
    <StoreChrome session={session} current="/store/questions">
      <div className="ar-card-head">
        <h1>الأسئلة المعلقة</h1>
        <span className="ar-hint">
          {showAnswered ? 'ما علّمته للبوت' : 'رسائل لم يفهمها البوت أو أجاب عنها بثقة ضعيفة'}
        </span>
      </div>

      <div className="ar-nav" style={{ marginBottom: 16 }}>
        <a href="/store/questions" aria-current={!showAnswered ? 'page' : undefined}>بانتظار الجواب</a>
        <a href="/store/questions?tab=resolved" aria-current={showAnswered ? 'page' : undefined}>مُجابة</a>
      </div>

      {rows.length === 0 ? (
        <div className="ar-card">
          <Empty
            title={showAnswered ? 'لم تعلّم البوت شيئاً بعد' : 'لا شيء معلّق'}
            body={
              showAnswered
                ? 'كل جواب تكتبه هنا يظهر في هذه القائمة ويصبح سياسة يرجع إليها البوت.'
                : 'يظهر السؤال هنا تلقائياً حين لا يجد البوت جواباً في كتالوجك أو سياساتك.'
            }
          />
        </div>
      ) : showAnswered ? (
        <div className="ar-card">
          <div className="ar-list">
            {rows.map((q) => (
              <div className="ar-item" key={q.id}>
                <div className="ar-item-main">
                  <div className="ar-item-title">{q.question_text}</div>
                  <div className="ar-item-sub">{q.resolved_answer}</div>
                  <div className="ar-item-sub">
                    {q.policy_id && <span className="ar-badge ar-badge-teal">محفوظ في السياسات</span>}{' '}
                    {q.sent_to_customer && <span className="ar-badge ar-badge-teal">أُرسل للزبون</span>}{' '}
                    {q.send_error && <span className="ar-badge ar-badge-pom">فشل الإرسال</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {rows.map((q) => (
            <TeachCard key={q.id} q={q} storeId={session.storeId} policiesFull={policiesFull} />
          ))}
        </div>
      )}
    </StoreChrome>
  );
}
