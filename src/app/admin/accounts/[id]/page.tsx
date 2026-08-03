import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ManageClient } from './ManageClient';
import '../../../store/arpha.css';

export const dynamic = 'force-dynamic';

export default async function ManageStorePage({
  params,
}: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sb = supabaseAdmin();

  const [{ data: store }, { data: user }, { data: plans }, { data: usageRaw }] = await Promise.all([
    sb.from('stores').select('*').eq('id', id).maybeSingle(),
    sb.from('store_users').select('*').eq('store_id', id).eq('role', 'owner').maybeSingle(),
    sb.from('plans').select('id, name').order('name'),
    sb.rpc('arpha_count_catalog', { p_store_id: id }),
  ]);

  if (!store) notFound();

  const [{ count: policies }, { count: rules }] = await Promise.all([
    sb.from('policies').select('id', { count: 'exact', head: true }).eq('store_id', id).eq('is_active', true),
    sb.from('bot_rules').select('id', { count: 'exact', head: true }).eq('store_id', id).eq('is_active', true),
  ]);

  return (
    <div className="ar" dir="rtl" lang="ar">
      <div className="ar-shell">
        <header className="ar-top">
          <div className="ar-brand">أرفا <span>{store.name}</span></div>
          <div className="ar-top-end">
            <Link className="ar-btn ar-btn-ghost ar-btn-sm" href="/admin/accounts">رجوع</Link>
          </div>
        </header>

        <ManageClient
          store={store}
          user={user}
          plans={(plans ?? []) as { id: string; name: string }[]}
          usage={{
            catalog: Number(usageRaw ?? 0),
            policies: policies ?? 0,
            rules: rules ?? 0,
          }}
        />
      </div>
    </div>
  );
}
