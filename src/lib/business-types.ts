// ============================================================================
// أرفا — الملف ٢ من ٧: قاموس أنواع العمل
//
// المكان الوحيد الذي تُكتب فيه أي تسمية تتغيّر حسب نوع العمل.
// «المنيو» و«الخدمات الطبية» و«المنتجات» كلها فوق جدول products نفسه —
// ما يختلف هو الكلمة التي يراها صاحب العمل، لا الجدول ولا المنطق.
//
// لإضافة نوع عمل جديد: صفّ واحد هنا + قيمة في قيد stores_business_type_chk.
// لا صفحة جديدة، ولا فرع في الكود.
// ============================================================================

export type BusinessType = 'restaurant' | 'clinic' | 'online_store' | 'custom';

export type ModuleKey = 'catalog' | 'orders' | 'bookings' | 'reviews' | 'finance';

/** الوحدات الأساسية: تعمل لكل متجر دائماً ولا تُخزَّن في store_modules. */
export const CORE_MODULES = [
  'overview', 'questions', 'policies', 'rules', 'reports', 'account',
] as const;

type Labels = {
  /** اسم النوع في لوحة الأدمن */
  typeName: string;
  /** وصف قصير يساعد الأدمن على الاختيار */
  typeHint: string;

  /** تسمية وحدة catalog */
  catalog: string;
  catalogHint: string;
  /** العنصر الواحد — يظهر في «أضف …» و«لا … بعد» */
  item: string;
  itemPlural: string;
  /** مثال في حقل الاسم، يشرح المطلوب أفضل من أي وصف */
  itemExample: string;

  /** تسمية وحدة orders */
  orders: string;
  /** تسمية وحدة bookings */
  bookings: string;
  bookingsHint: string;
  /** المورد القابل للحجز: طبيب، طاولة، قاعة… */
  resource: string;
  resourcePlural: string;
  resourceExample: string;
  /** الشخص الذي يحجز */
  guest: string;

  /** تسمية وحدة reviews */
  reviews: string;
};

export const BUSINESS_TYPES: Record<BusinessType, Labels> = {
  restaurant: {
    typeName: 'مطعم أو كافيه',
    typeHint: 'منيو، طلبات، وحجز طاولات',
    catalog: 'المنيو',
    catalogHint: 'الأطباق والمشروبات التي يعرضها البوت على الزبون',
    item: 'طبق',
    itemPlural: 'أطباق',
    itemExample: 'برياني دجاج',
    orders: 'الطلبات',
    bookings: 'حجز الطاولات',
    bookingsHint: 'الطاولات المتاحة وأوقاتها',
    resource: 'طاولة',
    resourcePlural: 'الطاولات',
    resourceExample: 'طاولة ٤ أشخاص — الصالة',
    guest: 'الزبون',
    reviews: 'آراء الزبائن',
  },

  clinic: {
    typeName: 'عيادة أو مجمّع طبي',
    typeHint: 'الأطباء، الخدمات، وحجز المواعيد',
    catalog: 'الخدمات',
    catalogHint: 'الخدمات التي تقدّمها العيادة وأسعارها',
    item: 'خدمة',
    itemPlural: 'خدمات',
    itemExample: 'استشارة عامة',
    orders: 'الطلبات',
    bookings: 'المواعيد',
    bookingsHint: 'الأطباء وأوقات دوامهم والمواعيد المحجوزة',
    resource: 'طبيب',
    resourcePlural: 'الأطباء',
    resourceExample: 'د. أحمد الجبوري — باطنية',
    guest: 'المراجع',
    reviews: 'آراء المراجعين',
  },

  online_store: {
    typeName: 'متجر أونلاين',
    typeHint: 'منتجات وطلبات وتوصيل',
    catalog: 'المنتجات',
    catalogHint: 'ما تبيعه، بأسعاره ومخزونه',
    item: 'منتج',
    itemPlural: 'منتجات',
    itemExample: 'قميص قطن أسود',
    orders: 'الطلبات',
    bookings: 'الحجوزات',
    bookingsHint: 'مواعيد قابلة للحجز',
    resource: 'مورد',
    resourcePlural: 'الموارد',
    resourceExample: 'مورد',
    guest: 'الزبون',
    reviews: 'آراء الزبائن',
  },

  custom: {
    typeName: 'نشاط آخر',
    typeHint: 'تسميات عامّة — اختر هذا إن لم ينطبق ما سبق',
    catalog: 'المنتجات والخدمات',
    catalogHint: 'ما يعرفه البوت عن عملك ويستطيع عرضه',
    item: 'عنصر',
    itemPlural: 'عناصر',
    itemExample: 'اسم العنصر',
    orders: 'الطلبات',
    bookings: 'الحجوزات',
    bookingsHint: 'مواعيد قابلة للحجز',
    resource: 'مورد',
    resourcePlural: 'الموارد',
    resourceExample: 'اسم المورد',
    guest: 'الزبون',
    reviews: 'آراء العملاء',
  },
};

/** التسميات مع رجوع آمن إلى custom لأي قيمة غير معروفة. */
export function labelsFor(type?: string | null): Labels {
  return BUSINESS_TYPES[(type as BusinessType)] ?? BUSINESS_TYPES.custom;
}

/** الوحدات المفعَّلة افتراضياً — تطابق apply_business_type_modules في الملف ١. */
export const DEFAULT_MODULES: Record<BusinessType, ModuleKey[]> = {
  restaurant:   ['catalog', 'orders', 'bookings', 'reviews'],
  clinic:       ['catalog', 'bookings', 'reviews'],
  online_store: ['catalog', 'orders', 'reviews'],
  custom:       ['catalog', 'orders'],
};

/** وصف كل وحدة في لوحة الأدمن عند تفعيلها أو إطفائها يدوياً. */
export const MODULE_INFO: Record<ModuleKey, { name: string; hint: string }> = {
  catalog:  { name: 'القائمة',        hint: 'المنتجات أو الخدمات أو المنيو — يعرضها البوت' },
  orders:   { name: 'الطلبات',        hint: 'طلبات بمجاميع مالية يثبّتها البوت' },
  bookings: { name: 'الحجوزات',       hint: 'مواعيد أو طاولات، مع معرفة الأوقات المشغولة' },
  reviews:  { name: 'آراء العملاء',   hint: 'تقييم بعد إتمام الطلب أو الموعد' },
  finance:  { name: 'الإدارة المالية', hint: 'مؤجَّلة — لم تُبنَ بعد' },
};

/**
 * ساعات الدوام القابلة للحساب تخصّ العيادات وحدها في هذا الإصدار.
 *
 * السبب: العيادة تحتاج أن يعرف البوت أن ٤:٣٠ مساءً متاحة أو لا. نصّ السياسات
 * («نداوم ٩–٥») يصلح ليقوله البوت للزبون، ولا يصلح ليحسب به. المطعم يقدر
 * يعمل بحجز يؤكّده صاحبه يدوياً بلا جدول ساعات.
 */
export function usesBookingHours(type?: string | null): boolean {
  return type === 'clinic';
}
