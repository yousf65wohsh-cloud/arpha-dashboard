import { requireStoreSession } from '@/lib/auth/store-session';
import { supabaseServer } from '@/lib/supabase/server';
import { StoreChrome } from '@/components/store/StoreChrome';
import { LimitMeter } from '@/components/store/LimitMeter';
import { PoliciesClient } from './PoliciesClient';
import type { StorePolicy } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PoliciesPage() {
  const session = await requireStoreSession();
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from('policies')
    .select('*')
    .order('updated_at', { ascending: false });

  const rows = (data ?? []) as StorePolicy[];
  const { limits } = session;

  return (
    <StoreChrome session={session} current="/store/policies">
      <div className="ar-card-head">
        <h1>السياسات</h1>
        <span className="ar-hint">أجوبة جاهزة يبحث فيها البوت قبل أن يرد</span>
      </div>

      <div className="ar-card">
        <LimitMeter label="خانات السياسات" used={limits.policies_used} limit={limits.policies_limit} />
      </div>

      {error && <div className="ar-note ar-note-err">{error.message}</div>}

      <PoliciesClient
        rows={rows}
        storeId={session.storeId}
        isFull={limits.policies_used >= limits.policies_limit}
      />
    </StoreChrome>
  );
}
