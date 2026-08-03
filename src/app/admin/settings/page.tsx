import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SettingsForm } from './SettingsForm';
import '../../store/arpha.css';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data } = await sb.from('platform_settings').select('key, value');

  const values = Object.fromEntries(
    ((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value ?? '']),
  );

  return (
    <div className="ar" dir="rtl" lang="ar">
      <div className="ar-shell">
        <header className="ar-top">
          <div className="ar-brand">أرفا <span>إعدادات المنصّة</span></div>
          <div className="ar-top-end">
            <Link className="ar-btn ar-btn-ghost ar-btn-sm" href="/admin/accounts">المتاجر</Link>
          </div>
        </header>

        <SettingsForm values={values} />
      </div>
    </div>
  );
}
