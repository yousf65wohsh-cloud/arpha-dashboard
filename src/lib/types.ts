// أنواع مشتركة لبوابة المتجر ولوحة الأدمن.
// أضيفت مع الهجرات 016→021.

export type ServiceStatus = 'active' | 'suspended' | 'expired';

export type Store = {
  id: string;
  name: string;
  plan_id: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  service_status: ServiceStatus;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  customer_bot_username: string | null;
  manager_chat_id: string | null;
  max_catalog_items_override: number | null;
  max_bot_rules_override: number | null;
  max_policies_override: number | null;
  admin_notes: string | null;
};

export type StoreUser = {
  id: string;
  auth_user_id: string;
  store_id: string;
  login_id: string;
  full_name: string;
  phone: string;
  role: 'owner' | 'staff';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

export type PolicyCategory =
  | 'general' | 'shipping' | 'returns' | 'payment' | 'hours' | 'pricing' | 'other';

export const POLICY_CATEGORIES: Record<PolicyCategory, string> = {
  general:  'عام',
  shipping: 'التوصيل',
  returns:  'الإرجاع والاستبدال',
  payment:  'الدفع',
  hours:    'أوقات العمل',
  pricing:  'الأسعار',
  other:    'أخرى',
};

// جدول policies القائم في قاعدتك — لا store_policies.
// الحقول question/answer وليست title/body، و source مقيّد بـ manual|auto_learned.
export type StorePolicy = {
  id: string;
  store_id: string;
  question: string;
  answer: string;
  category: PolicyCategory;
  source: 'manual' | 'auto_learned';
  source_question_id: string | null;
  is_active: boolean;
  disabled_by_admin: boolean;
  created_at: string;
  updated_at: string;
};

// جدول pending_followups القائم — لا pending_questions.
export type GapType =
  | 'product_attribute' | 'product_availability' | 'service_availability'
  | 'policy_question' | 'custom_request';

export const GAP_TYPES: Record<GapType, string> = {
  product_attribute:    'تفصيل عن منتج',
  product_availability: 'توفّر منتج',
  service_availability: 'توفّر خدمة',
  policy_question:      'سؤال عن سياسة',
  custom_request:       'طلب خاص',
};

export type PendingQuestion = {
  id: string;
  store_id: string;
  telegram_chat_id: string | null;
  question_text: string;
  bot_reply: string | null;
  gap_type: GapType;
  status: 'pending' | 'resolved' | 'dismissed';
  resolved_answer: string | null;
  suggested_update: string | null;
  confirmed_permanent: boolean;
  resolved_at: string | null;
  policy_id: string | null;
  sent_to_customer: boolean;
  sent_at: string | null;
  send_error: string | null;
  created_at: string;
};

export type BotRule = {
  id: string;
  store_id: string;
  rule_text: string;
  priority: number;
  is_active: boolean;
  created_at: string;
};

// products: name, description, price, stock, category, counts_against_limit, is_active
// services: name, description, price, available, category, counts_against_limit, is_active
export type CatalogItem = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  is_active: boolean;
  counts_against_limit: boolean;
  stock: number | null;        // منتجات فقط
  available: boolean | null;   // خدمات فقط
  kind: 'product' | 'service';
};

export type ChangeRequest = {
  id: string;
  store_id: string;
  request_type: 'password_reset' | 'login_id_change' | 'plan_upgrade' | 'other';
  details: string | null;
  status: 'open' | 'done' | 'rejected';
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
};

export const REQUEST_TYPES: Record<ChangeRequest['request_type'], string> = {
  password_reset:  'تغيير كلمة المرور',
  login_id_change: 'تغيير معرّف الدخول',
  plan_upgrade:    'ترقية الباقة',
  other:           'طلب آخر',
};

export type Limits = {
  store_id: string;
  catalog_used: number;
  catalog_limit: number;
  rules_used: number;
  rules_limit: number;
  policies_used: number;
  policies_limit: number;
  pending_count: number;
};

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };
