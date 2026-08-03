import Link from 'next/link';
import { signOut } from '@/app/store/login/actions';
import type { StoreSession } from '@/lib/auth/store-session';

type Tab = { href: string; label: string; badge?: 'pending' };

const TABS: Tab[] = [
  { href: '/store',          label: 'نظرة عامة' },
  { href: '/store/questions',label: 'الأسئلة المعلقة', badge: 'pending' },
  { href: '/store/catalog',  label: 'الكتالوج' },
  { href: '/store/policies', label: 'السياسات' },
  { href: '/store/rules',    label: 'قواعد البوت' },
  { href: '/store/orders',   label: 'الطلبات' },
  { href: '/store/account',  label: 'الحساب' },
];

export function StoreChrome({
  session, current, children,
}: { session: StoreSession; current: string; children: React.ReactNode }) {
  return (
    <div className="ar-shell">
      <header className="ar-top">
        <div className="ar-brand">
          أرفا <span>{session.storeName}</span>
        </div>
        <div className="ar-top-end">
          <span className="ar-hint">{session.user.full_name}</span>
          <form action={signOut}>
            <button type="submit" className="ar-btn ar-btn-ghost ar-btn-sm">خروج</button>
          </form>
        </div>
      </header>

      <nav className="ar-nav">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={t.href === current ? 'page' : undefined}>
            {t.label}
            {t.badge === 'pending' && session.limits?.pending_count > 0 && (
              <span className="ar-badge ar-badge-pom">{session.limits.pending_count}</span>
            )}
          </Link>
        ))}
      </nav>

      <main>{children}</main>
    </div>
  );
}
