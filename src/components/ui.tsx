import Link from "next/link";
import type { Tone } from "@/lib/format";

const TONE: Record<Tone, string> = {
  petrol: "bg-petrolSoft text-petrol",
  amber:  "bg-amberSoft text-amber",
  alert:  "bg-alertSoft text-alert",
  good:   "bg-goodSoft text-good",
  muted:  "bg-paper text-muted",
};

export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${TONE[tone]}`}>
      {children}
    </span>
  );
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-muted mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card p-10 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="text-sm text-muted mt-1">{hint}</p>}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="card border-alert/30 bg-alertSoft p-5">
      <p className="font-medium text-alert">تعذّر جلب البيانات</p>
      <p className="text-sm text-ink/70 mt-1 id break-all">{message}</p>
      <p className="text-sm text-muted mt-3">
        تحقّق من <code className="id">NEXT_PUBLIC_SUPABASE_URL</code> و
        <code className="id"> SUPABASE_SERVICE_ROLE_KEY</code>، ومن أن الجدول موجود بالقاعدة.
      </p>
    </div>
  );
}

/**
 * The signature element: a single strip that answers "what needs me now".
 * Zero items is a real state worth showing — a quiet strip means nothing is
 * waiting, which is the thing an operator most wants to know at a glance.
 */
export function AttentionStrip({ items }: { items: { label: string; count: number; href: string; tone: Tone }[] }) {
  const total = items.reduce((s, i) => s + i.count, 0);
  return (
    <div className="card overflow-hidden mb-8">
      <div className="flex items-center gap-3 px-5 h-12 border-b border-line bg-paper/60">
        <span className={`h-2 w-2 rounded-full ${total ? "bg-amber" : "bg-good"}`} />
        <span className="text-sm font-medium">
          {total ? `${total} بند ينتظرك` : "لا شيء ينتظرك الآن"}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-line">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="p-5 hover:bg-paper transition-colors">
            <div className="label">{i.label}</div>
            <div className={`mt-1 text-3xl font-semibold ${i.count ? "" : "text-muted"}`}>{i.count}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="label">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
    </div>
  );
}
