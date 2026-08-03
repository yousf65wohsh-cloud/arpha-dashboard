// ترجمة أخطاء القاعدة إلى رسائل يفهمها صاحب المتجر.
// المصدر: raise exception 'ARPHA_LIMIT:<kind>:<used>:<limit>' في الهجرة 020.

const KIND_LABEL: Record<string, string> = {
  catalog:  'المنتجات والخدمات',
  rules:    'قواعد البوت',
  policies: 'السياسات',
};

export function humanizeDbError(message?: string | null): string {
  const raw = message ?? '';

  const limit = raw.match(/ARPHA_LIMIT:(\w+):(\d+):(\d+)/);
  if (limit) {
    const [, kind, , max] = limit;
    const label = KIND_LABEL[kind] ?? kind;
    return `وصلت إلى حد باقتك: ${max} من ${label}. عدّل عنصراً موجوداً، أو راجع الإدارة لترقية الباقة.`;
  }

  if (raw.includes('ARPHA_NOT_FOUND')) return 'العنصر غير موجود، أو لا يخص متجرك.';
  if (raw.includes('ARPHA_STATE'))     return 'تمت معالجة هذا السؤال مسبقاً.';
  if (raw.includes('ARPHA_INPUT'))     return 'النص فارغ أو قصير جداً.';

  if (raw.includes('duplicate key'))   return 'هذه القيمة مستخدمة مسبقاً.';
  if (raw.includes('row-level security') || raw.includes('violates row-level'))
    return 'ليس لديك صلاحية على هذا العنصر.';
  if (raw.includes('JWT') || raw.includes('expired'))
    return 'انتهت الجلسة. سجّل الدخول من جديد.';

  return raw || 'تعذّر تنفيذ العملية.';
}

// حالة العدّاد: تُلوّن مؤشر الخانات
export function meterState(used: number, limit: number): 'ok' | 'near' | 'full' {
  if (limit <= 0) return 'full';
  if (used >= limit) return 'full';
  if (used / limit >= 0.85) return 'near';
  return 'ok';
}
