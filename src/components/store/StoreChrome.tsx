import Link from 'next/link';
import { signOut } from '@/app/store/login/actions';
import { SupportWidget } from './SupportWidget';
import {
  IconHome, IconQuestion, IconBox, IconBook, IconRules,
  IconCart, IconChart, IconUser, IconLogout,
} from './Icons';
import type { StoreSession } from '@/lib/auth/store-session';

type Tab = {
  href: string; label: string;
  icon: React.ReactNode; badge?: 'pending';
};

const TABS: Tab[] = [
  { href: '/store',           label: 'نظرة عامة',          icon: <IconHome size={16} /> },
  { href: '/store/questions', label: 'الأسئلة المعلقة',    icon: <IconQuestion size={16} />, badge: 'pending' },
  { href: '/store/catalog',   label: 'المنتجات والخدمات',  icon: <IconBox size={16} /> },
  { href: '/store/policies',  label: 'السياسات',           icon: <IconBook size={16} /> },
  { href: '/store/rules',     label: 'قواعد البوت',        icon: <IconRules size={16} /> },
  { href: '/store/orders',    label: 'الطلبات',            icon: <IconCart size={16} /> },
  { href: '/store/reports',   label: 'التقارير',           icon: <IconChart size={16} /> },
  { href: '/store/account',   label: 'الحساب',             icon: <IconUser size={16} /> },
];

export type SupportInfo = {
  phone: string;
  whatsapp?: string | null;
  telegram?: string | null;
  hours?: string | null;
};

export function StoreChrome({
  session, current, support, children,
}: {
  session: StoreSession;
  current: string;
  support?: SupportInfo | null;
  children: React.ReactNode;
}) {
  return (
    <div className="ar-shell">
      <header className="ar-top">
        <div className="ar-brand">
          أرفا <span>{session.storeName}</span>
        </div>
        <div className="ar-top-end">
          <span className="ar-hint">{session.user.full_name}</span>
          <form action={signOut}>
            <button type="submit" className="ar-btn ar-btn-ghost ar-btn-sm">
              <IconLogout size={15} /> خروج
            </button>
          </form>
        </div>
      </header>

      <nav className="ar-nav">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} prefetch
                aria-current={t.href === current ? 'page' : undefined}>
            {t.icon}
            {t.label}
            {t.badge === 'pending' && session.limits?.pending_count > 0 && (
              <span className="ar-badge ar-badge-pom">{session.limits.pending_count}</span>
            )}
          </Link>
        ))}
      </nav>

      <main>{children}</main>

      {support?.phone && (
        <SupportWidget
          phone={support.phone}
          whatsapp={support.whatsapp}
          telegram={support.telegram}
          hours={support.hours}
        />
      )}
    </div>
  );
}
