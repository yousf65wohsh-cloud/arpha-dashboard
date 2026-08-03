export type Tone = "petrol" | "amber" | "alert" | "good" | "muted";

/** IQD has no minor unit — never show decimals. */
export function money(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v) + " د.ع";
}

export function num(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(v);
}

export function when(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ar-IQ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Baghdad",
    numberingSystem: "latn",
  }).format(new Date(iso));
}

export function ago(iso: string | null | undefined) {
  if (!iso) return "—";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `قبل ${hrs} ساعة`;
  return `قبل ${Math.floor(hrs / 24)} يوم`;
}

export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending_confirmation: { label: "بانتظار التأكيد", tone: "amber" },
  confirmed:            { label: "مؤكد",            tone: "petrol" },
  delivered:            { label: "مُسلَّم",           tone: "good" },
  customer_reviewed:    { label: "قُيِّم",             tone: "good" },
  rejected:             { label: "مرفوض",           tone: "alert" },
  cancelled:            { label: "ملغى",            tone: "muted" },
  return_requested:     { label: "طلب إرجاع",       tone: "alert" },
};

export const GAP_TYPE: Record<string, string> = {
  product_attribute:    "صفة منتج",
  product_availability: "توفّر منتج",
  service_availability: "توفّر خدمة",
  policy_question:      "سؤال سياسة",
  custom_request:       "طلب خاص",
};
