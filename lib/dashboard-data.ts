import type {
  AppNotification,
  CalendarEvent,
  ChartPoint,
  Conversation,
  Customer,
  DonutSlice,
  Employee,
  Invoice,
  Order,
  OrderStatus,
  Product,
  Service,
  TimelineStep,
} from "@/types/dashboard";

export const STORES = [
  { id: "bgh-beauty", name: "Baghdad Beauty", city: "Baghdad", plan: "Business" },
  { id: "huda-kitchen", name: "Huda's Kitchen", city: "Basra", plan: "Starter" },
  { id: "rawi-perfumes", name: "Rawi Perfumes", city: "Erbil", plan: "Business" },
  { id: "saadi-tech", name: "Al-Saadi Electronics", city: "Baghdad", plan: "Enterprise" },
] as const;

export const CURRENT_STORE_ID = "bgh-beauty";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const now = "2026-08-02T10:30:00";

function daysAgo(n: number, hour = 10, minute = 0): string {
  const d = new Date(2026, 7, 2 - n, hour, minute);
  return d.toISOString();
}

function timeFrom(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function orderTimeline(status: OrderStatus): TimelineStep[] {
  const steps: TimelineStep[] = [
    { label: "Order placed", time: "via Telegram", done: true },
    { label: "Payment confirmed", time: "COD / Card", done: true },
    { label: "Processing", time: "Packed by staff", done: status !== "pending" },
    { label: "Shipped", time: "On route", done: status === "shipped" || status === "delivered" },
    { label: "Delivered", time: "Customer confirmed", done: status === "delivered" },
  ];
  if (status === "cancelled" || status === "refunded") {
    return [
      { label: "Order placed", time: "via Telegram", done: true },
      { label: "Cancelled", time: status === "refunded" ? "Refund issued" : "No refund", done: true },
    ];
  }
  return steps;
}

/* ------------------------------------------------------------------ */
/*  Orders                                                             */
/* ------------------------------------------------------------------ */

export const ORDERS: Order[] = [
  {
    id: "AR-2841",
    customer: "Noor Al-Amiri",
    customerId: "c-01",
    channel: "telegram",
    items: [
      { name: "Glow Face Serum 30ml", qty: 2, price: 24 },
      { name: "Hyaluronic Serum 20ml", qty: 1, price: 20 },
    ],
    total: 68,
    status: "processing",
    payment: "card",
    city: "Baghdad",
    address: "Karrada, Building 12, Apt 4",
    createdAt: daysAgo(0, 9, 12),
    timeline: orderTimeline("processing"),
  },
  {
    id: "AR-2840",
    customer: "Ahmed Jasim",
    customerId: "c-02",
    channel: "telegram",
    items: [{ name: "Wireless Headset Pro", qty: 1, price: 42 }],
    total: 42,
    status: "pending",
    payment: "cod",
    city: "Baghdad",
    address: "Al-Mansour, Street 17",
    createdAt: daysAgo(0, 8, 40),
    timeline: orderTimeline("pending"),
  },
  {
    id: "AR-2839",
    customer: "Sara Mousa",
    customerId: "c-03",
    channel: "web",
    items: [{ name: "Scented Candle Trio", qty: 3, price: 9 }],
    total: 27,
    status: "delivered",
    payment: "wallet",
    city: "Erbil",
    address: "Ainkawa, Villa 8",
    createdAt: daysAgo(0, 7, 5),
    timeline: orderTimeline("delivered"),
  },
  {
    id: "AR-2838",
    customer: "Ali Hamdan",
    customerId: "c-04",
    channel: "telegram",
    items: [{ name: "Leather Wallet Classic", qty: 1, price: 54 }],
    total: 54,
    status: "shipped",
    payment: "cod",
    city: "Basra",
    address: "Al-Ashar, Block 3",
    createdAt: daysAgo(1, 18, 22),
    timeline: orderTimeline("shipped"),
  },
  {
    id: "AR-2837",
    customer: "Rana Khader",
    customerId: "c-05",
    channel: "web",
    items: [
      { name: "Arabic Coffee 500g", qty: 2, price: 11 },
      { name: "Copper Coffee Pot", qty: 1, price: 14 },
    ],
    total: 36,
    status: "delivered",
    payment: "card",
    city: "Mosul",
    address: "Al-Rafidain Street",
    createdAt: daysAgo(1, 15, 10),
    timeline: orderTimeline("delivered"),
  },
  {
    id: "AR-2836",
    customer: "Huda Khalaf",
    customerId: "c-06",
    channel: "telegram",
    items: [{ name: "Glow Face Serum 30ml", qty: 3, price: 24 }],
    total: 72,
    status: "processing",
    payment: "cod",
    city: "Karbala",
    address: "Al-Abbas District",
    createdAt: daysAgo(1, 12, 48),
    timeline: orderTimeline("processing"),
  },
  {
    id: "AR-2835",
    customer: "Mustafa Al-Rawi",
    customerId: "c-07",
    channel: "telegram",
    items: [
      { name: "Oud Perfume 50ml", qty: 1, price: 95 },
      { name: "Bakhoor Gift Set", qty: 1, price: 28 },
    ],
    total: 123,
    status: "delivered",
    payment: "card",
    city: "Baghdad",
    address: "Jadriya, Complex 5",
    createdAt: daysAgo(2, 20, 15),
    timeline: orderTimeline("delivered"),
  },
  {
    id: "AR-2834",
    customer: "Layla Ibrahim",
    customerId: "c-08",
    channel: "web",
    items: [{ name: "Silk Scarf Collection", qty: 2, price: 33 }],
    total: 66,
    status: "cancelled",
    payment: "wallet",
    city: "Najaf",
    address: "Al-Kufa Road",
    createdAt: daysAgo(2, 14, 33),
    timeline: orderTimeline("cancelled"),
  },
  {
    id: "AR-2833",
    customer: "Karim Hassan",
    customerId: "c-09",
    channel: "phone",
    items: [{ name: "Copper Coffee Pot", qty: 4, price: 14 }],
    total: 56,
    status: "delivered",
    payment: "cod",
    city: "Sulaymaniyah",
    address: "Salim Street",
    createdAt: daysAgo(3, 11, 20),
    timeline: orderTimeline("delivered"),
  },
  {
    id: "AR-2832",
    customer: "Zainab Al-Baghdadi",
    customerId: "c-10",
    channel: "telegram",
    items: [
      { name: "Glow Face Serum 30ml", qty: 1, price: 24 },
      { name: "Vitamin C Cream", qty: 1, price: 19 },
      { name: "Night Repair Mask", qty: 1, price: 15 },
    ],
    total: 58,
    status: "pending",
    payment: "card",
    city: "Baghdad",
    address: "Al-Kindy Street, Tower B",
    createdAt: daysAgo(3, 9, 5),
    timeline: orderTimeline("pending"),
  },
  {
    id: "AR-2831",
    customer: "Omar Al-Saadi",
    customerId: "c-11",
    channel: "web",
    items: [{ name: "Wireless Headset Pro", qty: 2, price: 42 }],
    total: 84,
    status: "shipped",
    payment: "card",
    city: "Baghdad",
    address: "Al-Za'afaraniyah, St 9",
    createdAt: daysAgo(3, 8, 11),
    timeline: orderTimeline("shipped"),
  },
  {
    id: "AR-2830",
    customer: "Dina Salman",
    customerId: "c-12",
    channel: "telegram",
    items: [{ name: "Scented Candle Trio", qty: 2, price: 9 }],
    total: 18,
    status: "delivered",
    payment: "cod",
    city: "Diyala",
    address: "Baqubah, Main Street",
    createdAt: daysAgo(4, 17, 44),
    timeline: orderTimeline("delivered"),
  },
  {
    id: "AR-2829",
    customer: "Hassan Al-Mosawi",
    customerId: "c-13",
    channel: "telegram",
    items: [{ name: "Arabic Coffee 500g", qty: 5, price: 11 }],
    total: 55,
    status: "processing",
    payment: "card",
    city: "Basra",
    address: "Al-Jumhuriya St",
    createdAt: daysAgo(4, 13, 2),
    timeline: orderTimeline("processing"),
  },
  {
    id: "AR-2828",
    customer: "Maryam Taha",
    customerId: "c-14",
    channel: "web",
    items: [
      { name: "Hyaluronic Serum 20ml", qty: 1, price: 20 },
      { name: "Vitamin C Cream", qty: 1, price: 19 },
    ],
    total: 39,
    status: "delivered",
    payment: "wallet",
    city: "Erbil",
    address: "60 Meter Road",
    createdAt: daysAgo(5, 16, 30),
    timeline: orderTimeline("delivered"),
  },
  {
    id: "AR-2827",
    customer: "Fadi Aziz",
    customerId: "c-15",
    channel: "telegram",
    items: [{ name: "Oud Perfume 50ml", qty: 1, price: 95 }],
    total: 95,
    status: "refunded",
    payment: "card",
    city: "Baghdad",
    address: "Al-Adhamiya",
    createdAt: daysAgo(5, 10, 18),
    timeline: orderTimeline("refunded"),
  },
  {
    id: "AR-2826",
    customer: "Noor Al-Amiri",
    customerId: "c-01",
    channel: "telegram",
    items: [{ name: "Night Repair Mask", qty: 2, price: 15 }],
    total: 30,
    status: "delivered",
    payment: "card",
    city: "Baghdad",
    address: "Karrada, Building 12, Apt 4",
    createdAt: daysAgo(6, 12, 0),
    timeline: orderTimeline("delivered"),
  },
  {
    id: "AR-2825",
    customer: "Sara Mousa",
    customerId: "c-03",
    channel: "telegram",
    items: [{ name: "Glow Face Serum 30ml", qty: 1, price: 24 }],
    total: 24,
    status: "delivered",
    payment: "cod",
    city: "Erbil",
    address: "Ainkawa, Villa 8",
    createdAt: daysAgo(7, 19, 8),
    timeline: orderTimeline("delivered"),
  },
  {
    id: "AR-2824",
    customer: "Ali Hamdan",
    customerId: "c-04",
    channel: "web",
    items: [{ name: "Copper Coffee Pot", qty: 2, price: 14 }],
    total: 28,
    status: "delivered",
    payment: "card",
    city: "Basra",
    address: "Al-Ashar, Block 3",
    createdAt: daysAgo(8, 14, 25),
    timeline: orderTimeline("delivered"),
  },
];

/* ------------------------------------------------------------------ */
/*  Customers                                                          */
/* ------------------------------------------------------------------ */

export const CUSTOMERS: Customer[] = [
  {
    id: "c-01",
    name: "Noor Al-Amiri",
    phone: "+964 770 123 4567",
    telegram: "@noor_amiri",
    email: "noor.amiri@gmail.com",
    city: "Baghdad",
    orders: 24,
    totalSpent: 620,
    lastVisit: "2 minutes ago",
    joined: "2025-11-04",
    tags: ["vip", "repeat"],
    aiMemory: ["Prefers 30ml serums", "Lives in Karrada", "Usually pays by card", "Allergic to lavender"],
    conversations: 86,
    satisfaction: 96,
    status: "active",
  },
  {
    id: "c-02",
    name: "Ahmed Jasim",
    phone: "+964 780 456 7823",
    telegram: "@ahmed_jasim",
    city: "Baghdad",
    orders: 17,
    totalSpent: 412,
    lastVisit: "38 minutes ago",
    joined: "2025-12-19",
    tags: ["repeat"],
    aiMemory: ["Asks about electronics first", "Prefers COD", "Afternoon contact only"],
    conversations: 44,
    satisfaction: 91,
    status: "active",
  },
  {
    id: "c-03",
    name: "Sara Mousa",
    phone: "+964 751 222 9910",
    telegram: "@sara_mousa",
    email: "sara.m@outlook.com",
    city: "Erbil",
    orders: 12,
    totalSpent: 288,
    lastVisit: "1 hour ago",
    joined: "2026-01-22",
    tags: ["repeat"],
    aiMemory: ["Loves candles & home scents", "Erbil delivery", "Weekend buyer"],
    conversations: 31,
    satisfaction: 94,
    status: "active",
  },
  {
    id: "c-04",
    name: "Ali Hamdan",
    phone: "+964 773 999 0123",
    telegram: "@ali_hamdan",
    city: "Basra",
    orders: 8,
    totalSpent: 176,
    lastVisit: "Yesterday",
    joined: "2026-03-07",
    tags: ["new"],
    aiMemory: ["New customer", "Prefers wallet payments", "Bought coffee pot twice"],
    conversations: 14,
    satisfaction: 88,
    status: "active",
  },
  {
    id: "c-05",
    name: "Rana Khader",
    phone: "+964 781 344 5567",
    telegram: "@rana_khader",
    email: "rana.khader@gmail.com",
    city: "Mosul",
    orders: 5,
    totalSpent: 121,
    lastVisit: "2 days ago",
    joined: "2026-04-15",
    tags: ["new"],
    aiMemory: ["Gift buyer", "Likes premium coffee", "Mosul delivery"],
    conversations: 9,
    satisfaction: 90,
    status: "active",
  },
  {
    id: "c-06",
    name: "Huda Khalaf",
    phone: "+964 790 111 2233",
    telegram: "@huda_kh",
    city: "Karbala",
    orders: 31,
    totalSpent: 710,
    lastVisit: "3 hours ago",
    joined: "2025-09-30",
    tags: ["vip", "wholesale"],
    aiMemory: ["Wholesale customer", "Orders monthly restock", "Karbala warehouse", "Prefers bulk pricing"],
    conversations: 112,
    satisfaction: 98,
    status: "active",
  },
  {
    id: "c-07",
    name: "Mustafa Al-Rawi",
    phone: "+964 772 555 8890",
    telegram: "@mustafa_rawi",
    email: "mustafa@rawiperfumes.iq",
    city: "Baghdad",
    orders: 19,
    totalSpent: 1054,
    lastVisit: "Yesterday",
    joined: "2025-08-12",
    tags: ["vip"],
    aiMemory: ["Perfume connoisseur", "Owns Rawi Perfumes", "Orders Oud monthly", "Needs gift wrapping"],
    conversations: 67,
    satisfaction: 97,
    status: "active",
  },
  {
    id: "c-08",
    name: "Layla Ibrahim",
    phone: "+964 764 888 1122",
    telegram: "@layla_ibrahim",
    city: "Najaf",
    orders: 6,
    totalSpent: 142,
    lastVisit: "5 days ago",
    joined: "2026-02-02",
    tags: ["new"],
    aiMemory: ["Cancelled once", "Prefers web orders", "Najaf city"],
    conversations: 12,
    satisfaction: 82,
    status: "active",
  },
  {
    id: "c-09",
    name: "Karim Hassan",
    phone: "+964 750 777 4433",
    telegram: "@karim_hassan",
    email: "karim@karimfurnishing.iq",
    city: "Sulaymaniyah",
    orders: 11,
    totalSpent: 356,
    lastVisit: "3 days ago",
    joined: "2025-11-21",
    tags: ["repeat"],
    aiMemory: ["Phone-order customer", "Sulaymaniyah", "Buyer of home goods"],
    conversations: 27,
    satisfaction: 93,
    status: "active",
  },
  {
    id: "c-10",
    name: "Zainab Al-Baghdadi",
    phone: "+964 770 656 9090",
    telegram: "@zainab_bb",
    email: "zainab@baghdadbeauty.iq",
    city: "Baghdad",
    orders: 29,
    totalSpent: 880,
    lastVisit: "1 hour ago",
    joined: "2025-07-08",
    tags: ["vip", "repeat"],
    aiMemory: ["Founder of Baghdad Beauty", "VIP customer", "Bulk skincare orders", "Prefers morning delivery"],
    conversations: 134,
    satisfaction: 99,
    status: "active",
  },
  {
    id: "c-11",
    name: "Omar Al-Saadi",
    phone: "+964 782 444 2211",
    telegram: "@omar_saadi",
    email: "omar@saaditech.iq",
    city: "Baghdad",
    orders: 15,
    totalSpent: 732,
    lastVisit: "4 days ago",
    joined: "2025-10-05",
    tags: ["vip", "wholesale"],
    aiMemory: ["Electronics wholesaler", "Bulk headset orders", "Invoice required", "Company account"],
    conversations: 51,
    satisfaction: 95,
    status: "active",
  },
  {
    id: "c-12",
    name: "Dina Salman",
    phone: "+964 769 333 7788",
    telegram: "@dina_salman",
    city: "Diyala",
    orders: 4,
    totalSpent: 64,
    lastVisit: "1 week ago",
    joined: "2026-05-18",
    tags: ["new"],
    aiMemory: ["New to Telegram bot", "Likes candles", "Diyala delivery"],
    conversations: 6,
    satisfaction: 85,
    status: "active",
  },
  {
    id: "c-13",
    name: "Hassan Al-Mosawi",
    phone: "+964 771 909 1122",
    telegram: "@hassan_mosawi",
    city: "Basra",
    orders: 9,
    totalSpent: 240,
    lastVisit: "2 days ago",
    joined: "2026-01-11",
    tags: ["repeat"],
    aiMemory: ["Coffee enthusiast", "Buys 5+ packs", "Basra delivery"],
    conversations: 22,
    satisfaction: 92,
    status: "active",
  },
  {
    id: "c-14",
    name: "Maryam Taha",
    phone: "+964 768 121 3344",
    telegram: "@maryam_taha",
    email: "maryam.taha@gmail.com",
    city: "Erbil",
    orders: 7,
    totalSpent: 173,
    lastVisit: "2 days ago",
    joined: "2026-03-29",
    tags: ["repeat"],
    aiMemory: ["Skincare routine user", "Erbil delivery", "Wallet payments"],
    conversations: 18,
    satisfaction: 89,
    status: "active",
  },
  {
    id: "c-15",
    name: "Fadi Aziz",
    phone: "+964 779 606 2233",
    telegram: "@fadi_aziz",
    city: "Baghdad",
    orders: 3,
    totalSpent: 148,
    lastVisit: "1 week ago",
    joined: "2026-04-22",
    tags: ["new"],
    aiMemory: ["Requested refund once", "Adhamiya area", "Perfume buyer"],
    conversations: 5,
    satisfaction: 76,
    status: "inactive",
  },
];

/* ------------------------------------------------------------------ */
/*  Products                                                           */
/* ------------------------------------------------------------------ */

export const PRODUCTS: Product[] = [
  { id: "p-01", nameKey: "products.name.1", name: "Glow Face Serum 30ml", sku: "SKN-SR-001", categoryKey: "products.cat.Skincare", category: "Skincare", price: 24, cost: 11, stock: 142, lowStock: 20, sold: 342, status: "active", hue: "from-[#6366f1] to-[#4f46e5]" },
  { id: "p-02", nameKey: "products.name.2", name: "Hyaluronic Serum 20ml", sku: "SKN-SR-002", categoryKey: "products.cat.Skincare", category: "Skincare", price: 20, cost: 9, stock: 89, lowStock: 15, sold: 208, status: "active", hue: "from-[#06b6d4] to-[#0e7490]" },
  { id: "p-03", nameKey: "products.name.3", name: "Vitamin C Cream", sku: "SKN-CR-003", categoryKey: "products.cat.Skincare", category: "Skincare", price: 19, cost: 8, stock: 14, lowStock: 18, sold: 164, status: "active", hue: "from-[#f59e0b] to-[#b45309]" },
  { id: "p-04", nameKey: "products.name.4", name: "Night Repair Mask", sku: "SKN-MS-004", categoryKey: "products.cat.Skincare", category: "Skincare", price: 15, cost: 6, stock: 76, lowStock: 12, sold: 121, status: "active", hue: "from-[#ec4899] to-[#be185d]" },
  { id: "p-05", nameKey: "products.name.5", name: "Wireless Headset Pro", sku: "ELC-HS-005", categoryKey: "products.cat.Electronics", category: "Electronics", price: 42, cost: 24, stock: 0, lowStock: 8, sold: 219, status: "active", hue: "from-[#8b5cf6] to-[#6d28d9]" },
  { id: "p-06", nameKey: "products.name.6", name: "Arabic Coffee 500g", sku: "FOD-CF-006", categoryKey: "products.cat.Food", category: "Food", price: 11, cost: 5, stock: 230, lowStock: 30, sold: 411, status: "active", hue: "from-[#a16207] to-[#713f12]" },
  { id: "p-07", nameKey: "products.name.7", name: "Copper Coffee Pot", sku: "HOM-PT-007", categoryKey: "products.cat.Home", category: "Home", price: 14, cost: 7, stock: 54, lowStock: 12, sold: 156, status: "active", hue: "from-[#d97706] to-[#92400e]" },
  { id: "p-08", nameKey: "products.name.8", name: "Scented Candle Trio", sku: "HOM-CN-008", categoryKey: "products.cat.Home", category: "Home", price: 9, cost: 4, stock: 7, lowStock: 15, sold: 298, status: "active", hue: "from-[#10b981] to-[#065f46]" },
  { id: "p-09", nameKey: "products.name.9", name: "Leather Wallet Classic", sku: "ACC-WL-009", categoryKey: "products.cat.Accessories", category: "Accessories", price: 54, cost: 28, stock: 33, lowStock: 10, sold: 98, status: "active", hue: "from-[#78716c] to-[#44403c]" },
  { id: "p-10", nameKey: "products.name.10", name: "Oud Perfume 50ml", sku: "PRF-OD-010", categoryKey: "products.cat.Perfumes", category: "Perfumes", price: 95, cost: 44, stock: 21, lowStock: 8, sold: 132, status: "active", hue: "from-[#4f46e5] to-[#312e81]" },
  { id: "p-11", nameKey: "products.name.11", name: "Bakhoor Gift Set", sku: "PRF-BK-011", categoryKey: "products.cat.Perfumes", category: "Perfumes", price: 28, cost: 13, stock: 12, lowStock: 10, sold: 87, status: "active", hue: "from-[#0ea5e9] to-[#075985]" },
  { id: "p-12", nameKey: "products.name.12", name: "Silk Scarf Collection", sku: "ACC-SC-012", categoryKey: "products.cat.Accessories", category: "Accessories", price: 33, cost: 16, stock: 0, lowStock: 6, sold: 74, status: "draft", hue: "from-[#f43f5e] to-[#9f1239]" },
];

export const PRODUCT_CATEGORIES = [
  "Skincare",
  "Electronics",
  "Food",
  "Home",
  "Accessories",
  "Perfumes",
];

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */

export const SERVICES: Service[] = [
  { id: "s-01", nameKey: "services.name.1", descKey: "services.desc.1", name: "Same-day delivery (Baghdad)", description: "Door-to-door delivery within Baghdad in under 6 hours.", price: 4, durationKey: "services.dur.sameDay", duration: "same day", categoryKey: "services.cat.Delivery", category: "Delivery", status: "active", bookings: 412, rating: 4.8 },
  { id: "s-02", nameKey: "services.name.2", descKey: "services.desc.2", name: "Gift wrapping & card", description: "Premium gift wrap with a handwritten Arabic card.", price: 3, durationKey: "services.dur.atOrder", duration: "at order", categoryKey: "services.cat.Extras", category: "Extras", status: "active", bookings: 158, rating: 4.9 },
  { id: "s-03", nameKey: "services.name.3", descKey: "services.desc.3", name: "Skin consultation (video)", description: "15-minute AI-assisted video consultation with our skincare specialist.", price: 9, durationKey: "services.dur.15min", duration: "15 min", categoryKey: "services.cat.Consulting", category: "Consulting", status: "active", bookings: 74, rating: 4.7 },
  { id: "s-04", nameKey: "services.name.4", descKey: "services.desc.4", name: "Subscription refill", description: "Automatic monthly refill of your favorite products with 10% off.", price: 0, durationKey: "services.dur.monthly", duration: "monthly", categoryKey: "services.cat.Subscription", category: "Subscription", status: "active", bookings: 92, rating: 5.0 },
  { id: "s-05", nameKey: "services.name.5", descKey: "services.desc.5", name: "Express courier (Erbil)", description: "Priority inter-city courier to Erbil within 24 hours.", price: 12, durationKey: "services.dur.24h", duration: "24 hours", categoryKey: "services.cat.Delivery", category: "Delivery", status: "active", bookings: 41, rating: 4.5 },
  { id: "s-06", nameKey: "services.name.6", descKey: "services.desc.6", name: "Bulk wholesale order", description: "Wholesale pricing and consolidated shipment for resellers.", price: 0, durationKey: "services.dur.custom", duration: "custom", categoryKey: "services.cat.Wholesale", category: "Wholesale", status: "paused", bookings: 18, rating: 4.6 },
];

/* ------------------------------------------------------------------ */
/*  Employees                                                          */
/* ------------------------------------------------------------------ */

export const EMPLOYEES: Employee[] = [
  { id: "e-01", name: "Noor Amiri", role: "Owner", email: "noor@arpha.app", phone: "+964 770 000 0001", status: "active", permissions: ["dashboard", "orders", "customers", "products", "services", "billing", "settings", "employees", "ai"], initials: "NA", lastActive: "now" },
  { id: "e-02", name: "Youssef Karim", role: "Store Manager", email: "youssef@arpha.app", phone: "+964 770 000 0002", status: "active", permissions: ["dashboard", "orders", "customers", "products", "services"], initials: "YK", lastActive: "5m" },
  { id: "e-03", name: "Dana Saeed", role: "Customer Care", email: "dana@arpha.app", phone: "+964 770 000 0003", status: "active", permissions: ["orders", "customers", "conversations"], initials: "DS", lastActive: "12m" },
  { id: "e-04", name: "Hiba Mahmoud", role: "AI Trainer", email: "hiba@arpha.app", phone: "+964 770 000 0004", status: "active", permissions: ["ai", "analytics", "reports"], initials: "HM", lastActive: "1h" },
  { id: "e-05", name: "Sarmed Ali", role: "Warehouse Lead", email: "sarmed@arpha.app", phone: "+964 770 000 0005", status: "invited", permissions: ["orders", "products"], initials: "SA", lastActive: "Invited 2h" },
  { id: "e-06", name: "Reem Jassim", role: "Accountant", email: "reem@arpha.app", phone: "+964 770 000 0006", status: "suspended", permissions: ["billing", "reports"], initials: "RJ", lastActive: "2d" },
];

/* ------------------------------------------------------------------ */
/*  Conversations                                                      */
/* ------------------------------------------------------------------ */

export const CONVERSATIONS: Conversation[] = [
  {
    id: "cv-01",
    customer: "Noor Al-Amiri",
    handle: "@noor_amiri",
    channel: "telegram",
    preview: "Yes, please prepare the order as usual — same address.",
    lastMessageAt: "2 min ago",
    unread: 2,
    status: "open",
    botHandled: true,
    messages: [
      { actor: "customer", text: "Salam! Do you have the Glow Face Serum 30ml again?", time: "10:02" },
      { actor: "bot", text: "Wa alaykum as-salam Noor! Yes — we have it in stock. Shall I prepare your usual order of 2?", time: "10:02" },
      { actor: "customer", text: "Yes, please prepare the order as usual — same address.", time: "10:04" },
      { actor: "bot", text: "Done! Order #AR-2841 created. Delivery to Karrada tomorrow morning. 💜", time: "10:04" },
      { actor: "customer", text: "Perfect, thank you!", time: "10:05" },
    ],
  },
  {
    id: "cv-02",
    customer: "Ahmed Jasim",
    handle: "@ahmed_jasim",
    channel: "telegram",
    preview: "Does the headset have noise cancellation?",
    lastMessageAt: "38 min ago",
    unread: 1,
    status: "awaiting",
    botHandled: true,
    messages: [
      { actor: "customer", text: "Does the headset have noise cancellation?", time: "09:45" },
      { actor: "bot", text: "Hi Ahmed! Yes, the Wireless Headset Pro has active noise cancellation. Want me to reserve one for you?", time: "09:46" },
    ],
  },
  {
    id: "cv-03",
    customer: "Huda Khalaf",
    handle: "@huda_kh",
    channel: "telegram",
    preview: "Need the monthly wholesale list sent to my warehouse.",
    lastMessageAt: "3 hours ago",
    unread: 0,
    status: "resolved",
    botHandled: false,
    messages: [
      { actor: "customer", text: "Need the monthly wholesale list sent to my warehouse.", time: "07:10" },
      { actor: "staff", text: "Hi Huda! Sending the wholesale pricelist now. Estimated 420 units for this cycle.", time: "07:31" },
      { actor: "customer", text: "Perfect, approve as usual.", time: "07:45" },
    ],
  },
  {
    id: "cv-04",
    customer: "Zainab Al-Baghdadi",
    handle: "@zainab_bb",
    channel: "telegram",
    preview: "Can you bump the order to morning delivery?",
    lastMessageAt: "1 hour ago",
    unread: 3,
    status: "open",
    botHandled: true,
    messages: [
      { actor: "customer", text: "Can you bump the order to morning delivery?", time: "09:20" },
      { actor: "bot", text: "Of course Zainab! Updated order #AR-2832 to morning delivery (9-11 AM).", time: "09:21" },
    ],
  },
  {
    id: "cv-05",
    customer: "Rana Khader",
    handle: "@rana_khader",
    channel: "telegram",
    preview: "Is the copper pot dishwasher safe?",
    lastMessageAt: "Yesterday",
    unread: 0,
    status: "resolved",
    botHandled: true,
    messages: [
      { actor: "customer", text: "Is the copper pot dishwasher safe?", time: "Yesterday" },
      { actor: "bot", text: "Hi Rana! Hand wash recommended to keep the copper shine. We include care instructions.", time: "Yesterday" },
      { actor: "customer", text: "Got it, thanks!", time: "Yesterday" },
    ],
  },
  {
    id: "cv-06",
    customer: "Fadi Aziz",
    handle: "@fadi_aziz",
    channel: "telegram",
    preview: "I haven't received my refund yet.",
    lastMessageAt: "2 days ago",
    unread: 0,
    status: "awaiting",
    botHandled: false,
    messages: [
      { actor: "customer", text: "I haven't received my refund yet.", time: "2 days ago" },
      { actor: "staff", text: "Hi Fadi, refund for #AR-2827 was processed. It may take 3-5 business days to appear.", time: "2 days ago" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n-01", type: "order", titleKey: "notifications.t.order", detailKey: "notifications.d.order", detailArgs: { id: "AR-2841", customer: "Noor Al-Amiri", amount: "68,000 د.ع" }, time: "2 min ago", date: "Today", read: false },
  { id: "n-02", type: "ai", titleKey: "notifications.t.ai", titleArgs: { n: "48" }, detailKey: "notifications.d.ai", time: "12 min ago", date: "Today", read: false },
  { id: "n-03", type: "alert", titleKey: "notifications.t.lowStock", titleArgs: { name: "Vitamin C Cream" }, detailKey: "notifications.d.lowStock", detailArgs: { n: "14", t: "18" }, time: "41 min ago", date: "Today", read: false },
  { id: "n-04", type: "billing", titleKey: "notifications.t.invoicePaid", titleArgs: { id: "#4821" }, detailKey: "notifications.d.invoicePaid", detailArgs: { amount: "49,000 د.ع" }, time: "2 hours ago", date: "Today", read: true },
  { id: "n-05", type: "order", titleKey: "notifications.t.orderDelivered", detailKey: "notifications.d.orderDelivered", detailArgs: { id: "AR-2839", customer: "Sara Mousa" }, time: "4 hours ago", date: "Today", read: true },
  { id: "n-06", type: "ai", titleKey: "notifications.t.memoryUpdated", detailKey: "notifications.d.memoryUpdated", detailArgs: { name: "Noor" }, time: "5 hours ago", date: "Today", read: true },
  { id: "n-07", type: "system", titleKey: "notifications.t.reportReady", detailKey: "notifications.d.reportReady", time: "Yesterday", date: "Yesterday", read: false },
  { id: "n-08", type: "order", titleKey: "notifications.t.pendingApproval", titleArgs: { n: "3" }, detailKey: "notifications.d.pendingApproval", time: "Yesterday", date: "Yesterday", read: true },
  { id: "n-09", type: "alert", titleKey: "notifications.t.refundProcessed", detailKey: "notifications.d.refundProcessed", detailArgs: { id: "AR-2827", amount: "95,000 د.ع" }, time: "Yesterday", date: "Yesterday", read: true },
  { id: "n-10", type: "billing", titleKey: "notifications.t.usage", titleArgs: { n: "68" }, detailKey: "notifications.d.usage", detailArgs: { used: "1.4M", quota: "2M" }, time: "2 days ago", date: "Earlier", read: true },
];

/* ------------------------------------------------------------------ */
/*  Invoices                                                           */
/* ------------------------------------------------------------------ */

export const INVOICES: Invoice[] = [
  { id: "INV-4821", date: "Jul 01, 2026", description: "Business plan — monthly", amount: 49, plan: "Business", status: "paid" },
  { id: "INV-4788", date: "Jun 01, 2026", description: "Business plan — monthly", amount: 49, plan: "Business", status: "paid" },
  { id: "INV-4751", date: "May 01, 2026", description: "Business plan — monthly", amount: 49, plan: "Business", status: "paid" },
  { id: "INV-4719", date: "Apr 01, 2026", description: "Business plan — monthly", amount: 49, plan: "Business", status: "paid" },
  { id: "INV-4682", date: "Mar 01, 2026", description: "Business plan — monthly", amount: 49, plan: "Business", status: "paid" },
  { id: "INV-4640", date: "Feb 01, 2026", description: "Business plan — monthly", amount: 49, plan: "Business", status: "paid" },
  { id: "INV-4597", date: "Jan 01, 2026", description: "Business plan — monthly", amount: 49, plan: "Business", status: "overdue" },
];

export const PAYMENT_METHODS = [
  { id: "pm-1", brand: "Visa", last4: "4242", holder: "Noor Amiri", primary: true },
  { id: "pm-2", brand: "Mastercard", last4: "8831", holder: "Noor Amiri", primary: false },
];

/* ------------------------------------------------------------------ */
/*  Calendar                                                           */
/* ------------------------------------------------------------------ */

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "ce-01", title: "Restock: Serums", date: "2026-08-03", time: "09:00", type: "restock" },
  { id: "ce-02", title: "Delivery — Karrada", date: "2026-08-03", time: "11:30", type: "delivery" },
  { id: "ce-03", title: "Order: 120 units (Huda)", date: "2026-08-05", time: "10:00", type: "order" },
  { id: "ce-04", title: "AI weekly report", date: "2026-08-08", time: "08:00", type: "ai" },
  { id: "ce-05", title: "Delivery — Erbil", date: "2026-08-08", time: "14:00", type: "delivery" },
  { id: "ce-06", title: "Campaign review", date: "2026-08-12", time: "16:00", type: "meeting" },
  { id: "ce-07", title: "Delivery — Basra", date: "2026-08-14", time: "09:30", type: "delivery" },
  { id: "ce-08", title: "Wholesale approval", date: "2026-08-19", time: "11:00", type: "order" },
  { id: "ce-09", title: "Billing cycle", date: "2026-08-21", time: "00:00", type: "ai" },
  { id: "ce-10", title: "Delivery — Mosul", date: "2026-08-26", time: "10:00", type: "delivery" },
  { id: "ce-11", title: "Restock: Candles", date: "2026-08-28", time: "09:00", type: "restock" },
  { id: "ce-12", title: "New product photoshoot", date: "2026-08-02", time: "13:00", type: "meeting" },
  { id: "ce-13", title: "Same-day delivery wave", date: "2026-08-02", time: "17:00", type: "delivery" },
  { id: "ce-14", title: "AI prompt tuning", date: "2026-08-02", time: "10:00", type: "ai" },
];

/* ------------------------------------------------------------------ */
/*  Analytics series                                                   */
/* ------------------------------------------------------------------ */

export const REVENUE_MONTHLY: ChartPoint[] = [
  { label: "Sep", value: 28, secondary: 22 },
  { label: "Oct", value: 33, secondary: 26 },
  { label: "Nov", value: 37, secondary: 30 },
  { label: "Dec", value: 44, secondary: 35 },
  { label: "Jan", value: 39, secondary: 34 },
  { label: "Feb", value: 48, secondary: 38 },
  { label: "Mar", value: 45, secondary: 41 },
  { label: "Apr", value: 56, secondary: 44 },
  { label: "May", value: 61, secondary: 49 },
  { label: "Jun", value: 58, secondary: 52 },
  { label: "Jul", value: 66, secondary: 55 },
  { label: "Aug", value: 72, secondary: 58 },
];

export const ORDERS_WEEKLY: ChartPoint[] = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 58 },
  { label: "Wed", value: 49 },
  { label: "Thu", value: 67 },
  { label: "Fri", value: 52 },
  { label: "Sat", value: 78 },
  { label: "Sun", value: 64 },
];

export const ORDERS_MONTHLY: ChartPoint[] = [
  { label: "Mar", value: 320 },
  { label: "Apr", value: 384 },
  { label: "May", value: 366 },
  { label: "Jun", value: 428 },
  { label: "Jul", value: 471 },
  { label: "Aug", value: 512 },
];

export const MESSAGES_WEEKLY: ChartPoint[] = [
  { label: "Mon", value: 120 },
  { label: "Tue", value: 168 },
  { label: "Wed", value: 141 },
  { label: "Thu", value: 210 },
  { label: "Fri", value: 189 },
  { label: "Sat", value: 256 },
  { label: "Sun", value: 233 },
];

export const AI_SPEND_MONTHLY: ChartPoint[] = [
  { label: "Mar", value: 9 },
  { label: "Apr", value: 12 },
  { label: "May", value: 11 },
  { label: "Jun", value: 15 },
  { label: "Jul", value: 18 },
  { label: "Aug", value: 21 },
];

export const GROWTH_CUSTOMERS: ChartPoint[] = [
  { label: "Mar", value: 1450 },
  { label: "Apr", value: 1712 },
  { label: "May", value: 2040 },
  { label: "Jun", value: 2480 },
  { label: "Jul", value: 2960 },
  { label: "Aug", value: 3421 },
];

export const RETENTION_SERIES: ChartPoint[] = [
  { label: "W1", value: 82 },
  { label: "W2", value: 76 },
  { label: "W3", value: 71 },
  { label: "W4", value: 68 },
  { label: "W5", value: 64 },
  { label: "W6", value: 61 },
  { label: "W7", value: 59 },
];

export const TRAFFIC_HOURS: ChartPoint[] = [
  { label: "00", value: 4 },
  { label: "03", value: 2 },
  { label: "06", value: 8 },
  { label: "09", value: 22 },
  { label: "12", value: 38 },
  { label: "15", value: 45 },
  { label: "18", value: 52 },
  { label: "21", value: 33 },
];

export const CHANNEL_DONUT: DonutSlice[] = [
  { name: "Telegram", value: 62, color: "#6366f1" },
  { name: "Web", value: 24, color: "#06b6d4" },
  { name: "Phone", value: 9, color: "#22c55e" },
  { name: "In-store", value: 5, color: "#f59e0b" },
];

export const ORDER_STATUS_DONUT: DonutSlice[] = [
  { name: "Delivered", value: 68, color: "#22c55e" },
  { name: "Processing", value: 16, color: "#06b6d4" },
  { name: "Pending", value: 10, color: "#f59e0b" },
  { name: "Cancelled", value: 6, color: "#ef4444" },
];

export const CATEGORY_DONUT: DonutSlice[] = [
  { name: "Skincare", value: 38, color: "#6366f1" },
  { name: "Electronics", value: 21, color: "#06b6d4" },
  { name: "Home", value: 18, color: "#22c55e" },
  { name: "Perfumes", value: 15, color: "#8b5cf6" },
  { name: "Other", value: 8, color: "#f59e0b" },
];

export const AI_TASKS_DONUT: DonutSlice[] = [
  { name: "Order assistant", value: 46, color: "#6366f1" },
  { name: "Manager", value: 32, color: "#06b6d4" },
  { name: "Reports", value: 22, color: "#22c55e" },
];

export const AI_USAGE_RADIAL = [
  { name: "This month", value: 68, max: 100 },
];

/* ------------------------------------------------------------------ */
/*  AI configuration                                                   */
/* ------------------------------------------------------------------ */

export const AI_CONFIG = {
  model: "gpt-4o",
  temperature: 0.6,
  botName: "Arpha Assistant",
  status: "online" as const,
  responseTime: "0.4s avg",
  messagesToday: 2312,
  tokensMonth: "1.4M / 2M",
  spendMonth: 18.2,
  prompt: `You are the friendly AI assistant for Baghdad Beauty, a premium beauty and home store in Iraq.

Behaviors:
- Respond in the customer's language (Arabic or English).
- Be warm, polite and concise.
- Recommend products based on the customer's past orders and memory.
- Offer same-day delivery and gift wrapping when relevant.
- If the customer asks for something outside your ability, escalate to staff.
- Never invent prices. Use the product catalog only.`,
  personality: [
    { key: "ai.pTone", value: "ai.pToneVal" },
    { key: "ai.pLanguage", value: "ai.pLanguageVal" },
    { key: "ai.pHumor", value: "ai.pHumorVal" },
    { key: "ai.pFormality", value: "ai.pFormalityVal" },
  ],
  memory: [
    { id: "m-1", key: "ai.memory.1", descKey: "ai.memDesc1", title: "Customer preferences", description: "Recalls past orders, sizes, scents and payment preferences.", enabled: true },
    { id: "m-2", key: "ai.memory.2", descKey: "ai.memDesc2", title: "Delivery history", description: "Remembers addresses and preferred delivery windows.", enabled: true },
    { id: "m-3", key: "ai.memory.3", descKey: "ai.memDesc3", title: "Conversation memory", description: "Keeps context across chats within 90 days.", enabled: true },
    { id: "m-4", key: "ai.memory.4", descKey: "ai.memDesc4", title: "Wholesale agreements", description: "Stores approved bulk pricing and terms.", enabled: false },
  ],
  knowledge: [
    { id: "k-1", titleKey: "ai.know.1", descKey: "ai.knowDesc1", title: "Product catalog", description: "52 products · synced 5 min ago", type: "catalog", status: "synced" },
    { id: "k-2", titleKey: "ai.know.2", descKey: "ai.knowDesc2", title: "Store policy PDF", description: "Returns & delivery policy · 2 pages", type: "document", status: "synced" },
    { id: "k-3", titleKey: "ai.know.3", descKey: "ai.knowDesc3", title: "FAQ collection", description: "24 FAQs about orders and shipping", type: "document", status: "synced" },
    { id: "k-4", titleKey: "ai.know.4", descKey: "ai.knowDesc4", title: "Promo calendar", description: "Upcoming campaigns for August", type: "sheet", status: "needs_update" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Plans                                                              */
/* ------------------------------------------------------------------ */

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    nameKey: "plans.starter.name",
    taglineKey: "plans.starter.tagline",
    ctaKey: "plans.starter.cta",
    price: 19,
    tagline: "For one store getting started with AI.",
    featureKeys: ["plans.starter.f1", "plans.starter.f2", "plans.starter.f3", "plans.starter.f4", "plans.starter.f5"],
    features: ["1 store", "AI Telegram bot", "Order management", "Basic analytics", "Email support"],
    cta: "Switch to Starter",
  },
  {
    id: "business",
    name: "Business",
    nameKey: "plans.business.name",
    taglineKey: "plans.business.tagline",
    ctaKey: "plans.business.cta",
    price: 49,
    tagline: "For growing stores that need the full stack.",
    featureKeys: ["plans.business.f1", "plans.business.f2", "plans.business.f3", "plans.business.f4", "plans.business.f5"],
    features: ["Up to 5 stores", "AI Manager bot", "Advanced analytics & reports", "AI memory & personalization", "Priority support"],
    cta: "Current plan",
    current: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    nameKey: "plans.enterprise.name",
    taglineKey: "plans.enterprise.tagline",
    ctaKey: "plans.enterprise.cta",
    price: 149,
    tagline: "For multi-brand businesses and groups.",
    featureKeys: ["plans.enterprise.f1", "plans.enterprise.f2", "plans.enterprise.f3", "plans.enterprise.f4", "plans.enterprise.f5"],
    features: ["Unlimited stores", "Custom AI workflows", "Dedicated success manager", "SLA & onboarding", "Custom integrations"],
    cta: "Contact sales",
  },
];

/* ------------------------------------------------------------------ */
/*  Reports                                                            */
/* ------------------------------------------------------------------ */

export const REPORT_TEMPLATES = [
  { id: "r-1", nameKey: "reports.tpl1", descKey: "reports.tplDesc1", name: "Daily sales summary", description: "Revenue, orders and top products for today.", interval: "Daily" },
  { id: "r-2", nameKey: "reports.tpl2", descKey: "reports.tplDesc2", name: "Weekly performance", description: "Week-over-week growth, channels and AI impact.", interval: "Weekly" },
  { id: "r-3", nameKey: "reports.tpl3", descKey: "reports.tplDesc3", name: "Customer retention", description: "Repeat rate, VIP segment and churn risk.", interval: "Monthly" },
  { id: "r-4", nameKey: "reports.tpl4", descKey: "reports.tplDesc4", name: "AI assistant report", description: "Messages, resolution rate, escalations and spend.", interval: "Weekly" },
  { id: "r-5", nameKey: "reports.tpl5", descKey: "reports.tplDesc5", name: "Inventory health", description: "Low stock, dead stock and reorder suggestions.", interval: "Weekly" },
];

export const SAVED_REPORTS = [
  { id: "sr-1", nameKey: "reports.saved1", name: "July 2026 performance", type: "Monthly", generated: "2026-07-31", size: "PDF · 2.4 MB" },
  { id: "sr-2", nameKey: "reports.saved2", name: "Q2 AI impact", type: "Quarterly", generated: "2026-07-15", size: "PDF · 1.8 MB" },
  { id: "sr-3", nameKey: "reports.saved3", name: "VIP customer analysis", type: "Custom", generated: "2026-07-08", size: "XLSX · 340 KB" },
  { id: "sr-4", nameKey: "reports.saved4", name: "Top 20 products", type: "Custom", generated: "2026-06-30", size: "XLSX · 210 KB" },
];

/* ------------------------------------------------------------------ */
/*  Misc shared values                                                 */
/* ------------------------------------------------------------------ */

export function orderTime(iso: string): string {
  return timeFrom(iso);
}

export const ORDER_CHANNEL_LABEL: Record<Order["channel"], string> = {
  telegram: "Telegram",
  web: "Web",
  phone: "Phone",
  instore: "In-store",
};

export { now };
