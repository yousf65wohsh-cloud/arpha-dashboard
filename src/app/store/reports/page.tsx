import Link from 'next/link';
import { requireStoreSession } from '@/lib/auth/store-session';
import { supabaseServer } from '@/lib/supabase/server';
import { getSupportSettings } from '@/lib/settings';
import { StoreChrome } from '@/components/store/StoreChrome';
import { Empty } from '@/components/store/Notice';
import { IconCoins, IconCheck, IconClock, IconTrendUp, IconSparkle, IconAlert } from '@/components/store/Icons';

export const dynamic = 'force-dynamic';

type Daily = { day: string; orders: number; revenue: number };
type Status = { status: string; n: number };
type TopItem = { name: string; item_type: string; qty: number; revenue: number };

const STATUS_LABEL: Record<string, string> = {
  pending_confirmation: 'بانتظار التأكيد',
  confirmed: 'مؤكّد',
  delivered: 'مُسلَّم',
  rejected: 'مرفوض',
  cancelled: 'ملغى',
  customer_reviewed: 'قيّمه الزبون',
  return_requested: 'طلب إرجاع',
};

const money = (n: number) => `${Math.round(n).toLocaleString('ar-IQ')} د.ع`;

// رسم أعمدة بـ SVG خام — لا حزمة رسوم، فلا وزن إضافي ولا خطر بناء.
function RevenueChart({ data }: { data: Daily[] }) {
  if (data.length === 0) return null;

  const W = 700, H = 190, PAD = 26;
  const max = Math.max(...data.map((d) => Number(d.revenue)), 1);
  const bw = (W - PAD * 2) / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ar-chart" role="img"
         aria-label={`الإيراد عبر ${data.length} يوماً`}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={PAD + (H - PAD * 2) * (1 - f)}
              y2={PAD + (H - PAD * 2) * (1 - f)} className="ar-chart-grid" />
      ))}

      {data.map((d, i) => {
        const v = Number(d.revenue);
        const h = Math.max((v / max) * (H - PAD * 2), v > 0 ? 3 : 0);
        // RTL: أحدث يوم على اليسار
        const x = W - PAD - (i + 1) * bw + bw * 0.22;
        return (
          <g key={d.day}>
            <rect x={x} y={H - PAD - h} width={bw * 0.56} height={h} rx="2.5"
                  className="ar-chart-bar" />
            <title>{new Date(d.day).toLocaleDateString('ar-IQ')} — {money(v)}</title>
          </g>
        );
      })}

      <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} className="ar-chart-axis" />
      <text x={W - PAD} y={PAD - 9} className="ar-chart-tick" textAnchor="end">{money(max)}</text>
    </svg>
  );
}

function Kpi({
  icon, label, value, sub, tone,
}: {
  icon: React.ReactNode; label: string; value: string;
  sub?: string; tone?: 'teal' | 'brass' | 'pom';
}) {
  return (
    <div className="ar-kpi" data-tone={tone ?? 'plain'}>
      <span className="ar-kpi-icon">{icon}</span>
      <span className="ar-kpi-label">{label}</span>
      <strong className="ar-kpi-value ar-num">{value}</strong>
      {sub && <span className="ar-kpi-sub">{sub}</span>}
    </div>
  );
}

export default async function ReportsPage({
  searchParams,
}: { searchParams: Promise<{ days?: string }> }) {
  const { days: rawDays } = await searchParams;
  const days = [7, 30, 90].includes(Number(rawDays)) ? Number(rawDays) : 30;

  const [session, support] = await Promise.all([
    requireStoreSession(),
    getSupportSettings(),
  ]);

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc('store_report', { p_days: days });

  const r = data as {
    totals: Record<string, number>;
    daily: Daily[]; by_status: Status[]; top_items: TopItem[];
    bot: Record<string, number>;
  } | null;

  const t = r?.totals;
  const doneRate = t && t.orders_all > 0 ? Math.round((t.orders_done / t.orders_all) * 100) : 0;

  return (
    <StoreChrome session={session} current="/store/reports" support={support}>
      <div className="ar-card-head">
        <h1>التقارير</h1>
        <span className="ar-hint">أرقام آخر {days} يوماً</span>
      </div>

      <div className="ar-nav" style={{ marginBottom: 16 }}>
        {[7, 30, 90].map((d) => (
          <Link key={d} href={`/store/reports?days=${d}`} prefetch
                aria-current={d === days ? 'page' : undefined}>
            {d === 7 ? 'أسبوع' : d === 30 ? 'شهر' : '٣ أشهر'}
          </Link>
        ))}
      </div>

      {error && (
        <div className="ar-note ar-note-err">
          تعذّر حساب التقرير: {error.message}
        </div>
      )}

      {!r || !t ? (
        <div className="ar-card">
          <Empty title="لا بيانات بعد"
                 body="تظهر الأرقام هنا بعد أول طلب يستلمه البوت." />
        </div>
      ) : (
        <>
          <div className="ar-kpi-grid">
            <Kpi tone="teal" icon={<IconCoins />} label="إيراد مُسلَّم"
                 value={money(t.revenue)} sub={`${t.orders_done} طلب مكتمل`} />
            <Kpi icon={<IconClock />} label="قيد التنفيذ"
                 value={money(t.revenue_open)} sub={`${t.orders_open} طلب مفتوح`} />
            <Kpi icon={<IconTrendUp />} label="متوسط الطلب" value={money(t.avg_order)} />
            <Kpi tone={doneRate >= 70 ? 'teal' : 'brass'} icon={<IconCheck />}
                 label="نسبة الإكمال" value={`${doneRate}%`}
                 sub={t.orders_lost > 0 ? `${t.orders_lost} ملغى أو مرفوض` : 'لا إلغاءات'} />
          </div>

          <div className="ar-card">
            <div className="ar-card-head">
              <h2>الإيراد يوماً بيوم</h2>
              <span className="ar-hint">الطلبات المُسلَّمة فقط</span>
            </div>
            {r.daily.length === 0
              ? <p className="ar-hint">لا طلبات في هذه المدّة.</p>
              : <RevenueChart data={r.daily} />}
          </div>

          <div className="ar-grid">
            <div className="ar-card">
              <div className="ar-card-head"><h2>حالات الطلبات</h2></div>
              {r.by_status.length === 0 ? (
                <p className="ar-hint">لا شيء بعد.</p>
              ) : (
                <div className="ar-bars">
                  {r.by_status.map((s) => {
                    const max = Math.max(...r.by_status.map((x) => x.n), 1);
                    return (
                      <div className="ar-bar-row" key={s.status}>
                        <span className="ar-bar-label">{STATUS_LABEL[s.status] ?? s.status}</span>
                        <span className="ar-bar-track">
                          <span className="ar-bar-fill" style={{ width: `${(s.n / max) * 100}%` }} />
                        </span>
                        <span className="ar-bar-num ar-num">{s.n}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="ar-card">
              <div className="ar-card-head">
                <h2>نشاط البوت</h2>
                <span className="ar-hint"><IconSparkle size={15} /></span>
              </div>
              <table className="ar-table">
                <tbody>
                  <tr><td>أسئلة جديدة</td><td className="ar-num">{r.bot.questions_new}</td></tr>
                  <tr><td>أسئلة أجبتَ عنها</td><td className="ar-num">{r.bot.questions_answered}</td></tr>
                  <tr><td>ما زالت معلّقة</td><td className="ar-num">{r.bot.questions_open}</td></tr>
                  <tr>
                    <td>سياسات تعلّمها البوت منك</td>
                    <td className="ar-num">{r.bot.policies_learned}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="ar-card">
            <div className="ar-card-head"><h2>الأكثر طلباً</h2></div>
            {r.top_items.length === 0 ? (
              <p className="ar-hint">لا عناصر مطلوبة في هذه المدّة.</p>
            ) : (
              <table className="ar-table">
                <thead>
                  <tr><th>العنصر</th><th>النوع</th><th>الكمية</th><th>الإيراد</th></tr>
                </thead>
                <tbody>
                  {r.top_items.map((it) => (
                    <tr key={`${it.name}-${it.item_type}`}>
                      <td>{it.name}</td>
                      <td><span className="ar-badge">{it.item_type === 'service' ? 'خدمة' : 'منتج'}</span></td>
                      <td className="ar-num">{it.qty}</td>
                      <td className="ar-num">{money(Number(it.revenue))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="ar-note ar-note-warn">
            <IconAlert size={15} />{' '}
            الأرقام أعلاه <strong>إيراد</strong> لا ربح. لحساب الربح يلزم سعر
            كلفة لكل عنصر — أضِف عمود «الكلفة» من صفحة المنتجات والخدمات، وسيظهر
            هامش الربح هنا تلقائياً.
          </div>
        </>
      )}
    </StoreChrome>
  );
}
