import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NewStoreForm } from './NewStoreForm';
import '../../../store/arpha.css';

export const dynamic = 'force-dynamic';

export default async function NewStorePage() {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: plans } = await sb.from('plans').select('*').order('name');

  return (
    <div className="ar" dir="rtl" lang="ar">
      <div className="ar-shell">
        <header className="ar-top">
          <div className="ar-brand">أرفا <span>متجر جديد</span></div>
          <div className="ar-top-end">
            <Link className="ar-btn ar-btn-ghost ar-btn-sm" href="/admin/accounts">رجوع</Link>
          </div>
        </header>

        <NewStoreForm plans={(plans ?? []) as { id: string; name: string }[]} />
      </div>
    </div>
  );
}
