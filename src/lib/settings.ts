import { supabaseServer } from './supabase/server';

export type SupportSettings = {
  phone: string;
  whatsapp: string | null;
  telegram: string | null;
  hours: string | null;
};

// يُقرأ بمفتاح anon عبر سياسة القراءة العامة على platform_settings.
// الفشل لا يوقف الصفحة — الزر يختفي فقط.
export async function getSupportSettings(): Promise<SupportSettings | null> {
  try {
    const sb = await supabaseServer();
    const { data } = await sb.from('platform_settings').select('key, value');
    if (!data?.length) return null;

    const map = new Map((data as { key: string; value: string }[]).map((r) => [r.key, r.value]));
    const phone = (map.get('support_phone') ?? '').trim();
    if (!phone) return null;

    return {
      phone,
      whatsapp: (map.get('support_whatsapp') ?? '').trim() || null,
      telegram: (map.get('support_telegram') ?? '').trim() || null,
      hours: (map.get('support_hours') ?? '').trim() || null,
    };
  } catch {
    return null;
  }
}
