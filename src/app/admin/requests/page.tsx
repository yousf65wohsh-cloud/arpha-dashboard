import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { RequestsClient } from './RequestsClient';
import '../../store/arpha.css';

export const dynamic = 'force-dynamic';

export default async function RequestsPage({
  searchParams,
}: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const { tab } = await searchParams;
  const closed = tab === 'closed';

  const sb = supabaseAdmin();
  const { data } = await sb
    .from('store_change_requests')
    .select('*')
    .in('status', closed ? ['done', 'rejected'] : ['open'])
    .order('created_at', { ascending: false })
    .limit(60);

  const rows = (data ?? []) as Record<string, any>[];
  const storeIds = [...new Set(rows.map((r) => r.store_id))];
  const { data: stores } = storeIds.length
    ? await sb.from('stores').select('id, name').in('id', storeIds)
    : { data: [] as { id: string; name: string }[] };

  const nameById = new Map(((stores ?? []) as { id: string; name: string }[]).map((s) => [s.id, s.name]));

  return (
    <div className="ar" dir="rtl" lang="ar">
      <div className="ar-shell">
        <header className="ar-top">
          <div className="ar-brand">أرفا <span>طلبات المتاجر</span></div>
          <div className="ar-top-end">
            <Link className="ar-btn ar-btn-ghost ar-btn-sm" href="/admin/accounts">المتاجر</Link>
          </div>
        </header>

        <div className="ar-nav">
          <a href="/admin/requests" aria-current={!closed ? 'page' : undefined}>مفتوحة</a>
          <a href="/admin/requests?tab=closed" aria-current={closed ? 'page' : undefined}>مغلقة</a>
        </div>

        <RequestsClient
          rows={rows.map((r) => ({ ...r, store_name: nameById.get(r.store_id) })) as never}
        />
      </div>
    </div>
  );
}
