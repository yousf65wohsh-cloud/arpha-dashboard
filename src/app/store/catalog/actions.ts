'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { humanizeDbError } from '@/lib/limits';
import type { ActionResult } from '@/lib/types';

// الأعمدة مؤكَّدة بالفحص المباشر للقاعدة:
//   products: name, description, price, stock, category, counts_against_limit, is_active
//   services: name, description, price, available, category, counts_against_limit, is_active
// is_active أضيف في الكتلة ١٤ — لم يكن موجوداً، ولا يوجد بديل عنه للإخفاء.
// counts_against_limit لا يُعرض ولا يُعدَّل من هنا: هو قرار الأدمن، ولو ملكه
// صاحب المتجر لصار تجاوز الحد بضغطة زر.

function table(kind: string) {
  return kind === 'service' ? 'services' : 'products';
}

function parsePrice(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const n = Number(s.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export async function createItem(formData: FormData): Promise<ActionResult> {
  const kind = String(formData.get('kind') ?? 'product');
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const price = parsePrice(formData.get('price'));
  const storeId = String(formData.get('store_id') ?? '');

  if (name.length < 2) return { ok: false, error: 'اكتب اسم العنصر.' };

  const sb = await supabaseServer();

  // الحد يُفرض بـ trigger في القاعدة (الهجرة 020). هذا الفحص للرسالة الودّية فقط،
  // ولا يُعتمد عليه أمنياً: نافذتان مفتوحتان قد تتجاوزانه، والـ trigger لا يُتجاوز.
  const { data: limits } = await sb.rpc('store_my_limits');
  if (limits && limits.catalog_used >= limits.catalog_limit) {
    return {
      ok: false,
      error: `خانات باقتك ممتلئة (${limits.catalog_limit}). عدّل عنصراً موجوداً أو راجع الإدارة لترقية الباقة.`,
    };
  }

  const row: Record<string, unknown> = {
    store_id: storeId,
    name,
    description: description || null,
    price,
    category: String(formData.get('category') ?? '').trim() || null,
    is_active: true,
  };
  if (kind === 'service') row.available = true;
  else row.stock = Number(formData.get('stock') ?? 0) || 0;

  const { error } = await sb.from(table(kind)).insert(row);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/store/catalog');
  revalidatePath('/store');
  return { ok: true, message: 'أُضيف العنصر.' };
}

export async function updateItem(formData: FormData): Promise<ActionResult> {
  const kind = String(formData.get('kind') ?? 'product');
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const price = parsePrice(formData.get('price'));

  if (name.length < 2) return { ok: false, error: 'اسم العنصر لا يمكن أن يكون فارغاً.' };

  const sb = await supabaseServer();

  // تعديل الاسم مسموح هنا عمداً: قاعدة المشروع تمنع الوكلاء الآليين من إعادة
  // التسمية (لأنها طريقة الالتفاف على حد الكتالوج)، وتسمح للإنسان بتحرير
  // كتالوجه. هذا المسار إنسان مصادَق يعدّل متجره هو، عبر RLS.
  const patch: Record<string, unknown> = {
    name,
    description: description || null,
    price,
    category: String(formData.get('category') ?? '').trim() || null,
    updated_at: new Date().toISOString(),
  };
  if (kind === 'product' && formData.get('stock') !== null) {
    patch.stock = Number(formData.get('stock') ?? 0) || 0;
  }

  const { error } = await sb.from(table(kind)).update(patch).eq('id', id);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/store/catalog');
  return { ok: true, message: 'حُفظت التعديلات.' };
}

export async function toggleItem(formData: FormData): Promise<ActionResult> {
  const kind = String(formData.get('kind') ?? 'product');
  const id = String(formData.get('id') ?? '');
  const next = formData.get('next') === '1';

  const sb = await supabaseServer();
  // إعادة الإظهار قد يفشل بـ ARPHA_LIMIT إن كانت الخانات ممتلئة — بقصد،
  // وإلا صار الإخفاء طريقاً للالتفاف على الحد.
  const { error } = await sb
    .from(table(kind))
    .update({ is_active: next, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { ok: false, error: humanizeDbError(error.message) };

  revalidatePath('/store/catalog');
  revalidatePath('/store');
  return {
    ok: true,
    message: next ? 'أُعيد تفعيل العنصر.' : 'أُخفي العنصر وتحرّرت خانته.',
  };
}
