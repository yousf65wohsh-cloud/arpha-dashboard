import { requireStoreSession } from '@/lib/auth/store-session';
import { supabaseServer } from '@/lib/supabase/server';
import { StoreChrome } from '@/components/store/StoreChrome';
import { LimitMeter } from '@/components/store/LimitMeter';
import { RulesClient } from './RulesClient';
import type { BotRule } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function RulesPage() {
  const session = await requireStoreSession();
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from('bot_rules')
    .select('*')
    .order('priority')
    .order('created_at');

  const rows = (data ?? []) as BotRule[];
  const { limits } = session;

  return (
    <StoreChrome session={session} current="/store/rules">
      <div className="ar-card-head">
        <h1>قواعد البوت</h1>
        <span className="ar-hint">سلوك عام يطبّقه البوت في كل محادثة</span>
      </div>

      <div className="ar-card">
        <LimitMeter label="خانات القواعد" used={limits.rules_used} limit={limits.rules_limit} />
      </div>

      {error && <div className="ar-note ar-note-err">{error.message}</div>}

      <RulesClient
        rows={rows}
        storeId={session.storeId}
        isFull={limits.rules_used >= limits.rules_limit}
      />
    </StoreChrome>
  );
}
