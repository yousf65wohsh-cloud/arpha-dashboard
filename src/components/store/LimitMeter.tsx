import { meterState } from '@/lib/limits';

// خانات الباقة كشرطات منفصلة: الحد عدد قابل للعدّ، لا نسبة مئوية.
// فوق 120 خانة نضغط الشرطات بدل أن نلفّ الصفحة.
export function LimitMeter({
  label, used, limit, note,
}: { label: string; used: number; limit: number; note?: string }) {
  const state = meterState(used, limit);
  const shown = Math.min(limit, 240);
  const dense = limit > 120;
  const scale = limit > shown ? shown / limit : 1;

  return (
    <div className="ar-meter" data-state={state}>
      <div className="ar-meter-top">
        <span className="ar-meter-label">{label}</span>
        <span className="ar-meter-num">
          <b>{used}</b> <i>/ {limit}</i>
        </span>
      </div>
      <div className="ar-slots" data-dense={dense ? '1' : '0'} aria-hidden="true">
        {Array.from({ length: shown }, (_, i) => (
          <span key={i} className="ar-slot" data-on={i < Math.round(used * scale) ? '1' : '0'} />
        ))}
      </div>
      <p className="ar-meter-note">
        {state === 'full'
          ? `الخانات ممتلئة. يمكنك تعديل الموجود، والإضافة تحتاج ترقية باقة من الإدارة.`
          : note ?? `تبقّى ${limit - used} خانة`}
      </p>
    </div>
  );
}
