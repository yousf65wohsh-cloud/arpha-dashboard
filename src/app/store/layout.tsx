// غلاف بوابة المتجر. الجذر ar + dir=rtl، والـ CSS مستورد هنا مرة واحدة.
// ملاحظة: إذا كان app/layout.tsx الجذري يضبط lang="en" فالأفضل تحويله إلى
// lang="ar" أو تركه — dir على هذا العنصر يكفي للتخطيط.

import './arpha.css';

export const metadata = {
  title: 'أرفا — لوحة المتجر',
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ar" dir="rtl" lang="ar">
      {children}
    </div>
  );
}
