import { requireStoreSession } from '@/lib/auth/store-session';
import { supabaseServer } from '@/lib/supabase/server';
import { StoreChrome } from '@/components/store/StoreChrome';
import { getSupportSettings } from '@/lib/settings';
import { LimitMeter } from '@/components/store/LimitMeter';
import { CatalogClient } from './CatalogClient';
import type { CatalogItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

// select('*') مقصود: أسماء الأعمدة الدقيقة في products / services لم تُتحقّق
// مقابل القاعدة الحية، وselect بأسماء صريحة يفشل كلياً إن اختلف عمود واحد.
function mapRows(rows: Record<string, unknown>[] | null, kind: 'product' | 'service'): CatalogItem[] {
  return (rows ?? []).map((r) => ({
    id: String(r.id),
    store_id: String(r.store_id ?? ''),
    name: String(r.name ?? ''),
    description: (r.description as string) ?? null,
    price: r.price != null ? Number(r.price) : null,
    category: (r.category as string) ?? null,
    is_active: (r.is_active as boolean) ?? true,
    counts_against_limit: (r.counts_against_limit as boolean) ?? true,
    stock: kind === 'product' && r.stock != null ? Number(r.stock) : null,
    available: kind === 'service' ? ((r.available as boolean) ?? null) : null,
    kind,
  }));
}

export default async function CatalogPage() {
  const [session, support] = await Promise.all([
    requireStoreSession(),
    getSupportSettings(),
  ]);
  const sb = await supabaseServer();

  const [p, s] = await Promise.all([
    sb.from('products').select('*').order('name'),
    sb.from('services').select('*').order('name'),
  ]);

  const items = [...mapRows(p.data, 'product'), ...mapRows(s.data, 'service')]
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  const { limits } = session;
  const isFull = limits.catalog_used >= limits.catalog_limit;

  return (
    <StoreChrome session={session} current="/store/catalog" support={support}>
      <div className="ar-card-head">
        <h1>المنتجات والخدمات</h1>
        <span className="ar-hint">ما يعرفه البوت عن عملك ويستطيع عرضه على الزبون</span>
      </div>

      <div className="ar-card">
        <LimitMeter
          label="خانات باقتك"
          used={limits.catalog_used}
          limit={limits.catalog_limit}
          note={`تبقّى ${limits.catalog_limit - limits.catalog_used} خانة — إخفاء عنصر يحرّر خانته`}
        />
      </div>

      {(p.error || s.error) && (
        <div className="ar-note ar-note-err">
          تعذّر قراءة جزء من القائمة: {p.error?.message ?? s.error?.message}
          {' — '}تحقّق من سياسات RLS في الهجرة 021 ومن أسماء الأعمدة.
        </div>
      )}

      <CatalogClient
        items={items}
        storeId={session.storeId}
        isFull={isFull}
        hasServices={(s.data?.length ?? 0) > (p.data?.length ?? 0)}
      />
    </StoreChrome>
  );
}
