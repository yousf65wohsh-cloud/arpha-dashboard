import {
  Bot,
  MessagesSquare,
  BarChart3,
  ShoppingBag,
  Store,
  CreditCard,
  BrainCircuit,
  FileText,
  Send,
  Workflow,
  Database,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import type {
  ChartPoint,
  CustomerRow,
  DashboardViewMeta,
  DonutSlice,
  FaqItem,
  Feature,
  OrderRow,
  PipelineStep,
  PricingTier,
  Testimonial,
} from "@/types";

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { key: "landing.nav.features", href: "#features" },
  { key: "landing.nav.how", href: "#how-it-works" },
  { key: "landing.nav.pricing", href: "#pricing" },
  { key: "landing.nav.testimonials", href: "#testimonials" },
  { key: "landing.nav.faq", href: "#faq" },
] as const;

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

export const FEATURES: Feature[] = [
  { icon: Bot, id: "ai", accent: "primary" },
  { icon: MessagesSquare, id: "telegram", accent: "accent" },
  { icon: BarChart3, id: "analytics", accent: "success" },
  { icon: ShoppingBag, id: "orders", accent: "warning" },
  { icon: Store, id: "multiStore", accent: "primary" },
  { icon: CreditCard, id: "billing", accent: "accent" },
  { icon: BrainCircuit, id: "memory", accent: "success" },
  { icon: FileText, id: "reports", accent: "danger" },
];

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */

export const PIPELINE_STEPS: PipelineStep[] = [
  { step: "01", id: "s1", icon: Send, accent: "accent" },
  { step: "02", id: "s2", icon: Workflow, accent: "primary" },
  { step: "03", id: "s3", icon: Database, accent: "success" },
  { step: "04", id: "s4", icon: Sparkles, accent: "warning" },
  { step: "05", id: "s5", icon: LayoutDashboard, accent: "danger" },
];

/* ------------------------------------------------------------------ */
/*  Pricing                                                            */
/* ------------------------------------------------------------------ */

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    priceMonthly: 19000,
    priceYearly: 15000,
    featureCount: 5,
    cta: "landing.features.ctaButton",
  },
  {
    id: "business",
    priceMonthly: 49000,
    priceYearly: 39000,
    featureCount: 6,
    cta: "landing.features.ctaButton",
    highlighted: true,
  },
  {
    id: "enterprise",
    priceMonthly: 149000,
    priceYearly: 119000,
    featureCount: 6,
    cta: "plan.contactSales",
  },
];

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Zainab Al-Baghdadi",
    role: "landing.testimonials.t1.role",
    store: "Baghdad Beauty",
    initials: "ZB",
    rating: 5,
  },
  {
    id: "t2",
    name: "Omar Al-Saadi",
    role: "landing.testimonials.t2.role",
    store: "Al-Saadi Electronics",
    initials: "OS",
    rating: 5,
  },
  {
    id: "t3",
    name: "Huda Khalaf",
    role: "landing.testimonials.t3.role",
    store: "Huda's Kitchen",
    initials: "HK",
    rating: 5,
  },
  {
    id: "t4",
    name: "Mustafa Al-Rawi",
    role: "landing.testimonials.t4.role",
    store: "Rawi Perfumes",
    initials: "MR",
    rating: 5,
  },
  {
    id: "t5",
    name: "Layla Ibrahim",
    role: "landing.testimonials.t5.role",
    store: "Nineveh Retail Group",
    initials: "LI",
    rating: 5,
  },
  {
    id: "t6",
    name: "Karim Hassan",
    role: "landing.testimonials.t6.role",
    store: "Karim Furnishings",
    initials: "KH",
    rating: 5,
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

export const FAQ_ITEMS: FaqItem[] = [
  { id: "q1" },
  { id: "q2" },
  { id: "q3" },
  { id: "q4" },
  { id: "q5" },
  { id: "q6" },
];

/* ------------------------------------------------------------------ */
/*  Dashboard shell                                                    */
/* ------------------------------------------------------------------ */

export const DASHBOARD_VIEWS: DashboardViewMeta[] = [
  { id: "overview", label: "group.overview", url: "app.arpha.ai/overview" },
  { id: "orders", label: "nav.orders", url: "app.arpha.ai/orders" },
  { id: "analytics", label: "nav.analytics", url: "app.arpha.ai/analytics" },
  { id: "customers", label: "nav.customers", url: "app.arpha.ai/customers" },
  { id: "ai-usage", label: "nav.aiCenter", url: "app.arpha.ai/ai-usage" },
  { id: "revenue", label: "revenue.trend", url: "app.arpha.ai/revenue" },
  { id: "calendar", label: "nav.calendar", url: "app.arpha.ai/calendar" },
];

export const SIDEBAR_NAV = [
  { label: "group.overview", icon: "layout", active: true },
  { label: "nav.orders", icon: "bag" },
  { label: "nav.customers", icon: "users" },
  { label: "nav.products", icon: "box" },
  { label: "nav.analytics", icon: "chart" },
  { label: "nav.aiCenter", icon: "bot" },
  { label: "nav.billing", icon: "card" },
] as const;

/* ------------------------------------------------------------------ */
/*  Charts                                                             */
/* ------------------------------------------------------------------ */

export const REVENUE_SERIES: ChartPoint[] = [
  { label: "Jan", value: 24, previous: 18 },
  { label: "Feb", value: 31, previous: 24 },
  { label: "Mar", value: 28, previous: 27 },
  { label: "Apr", value: 42, previous: 30 },
  { label: "May", value: 47, previous: 36 },
  { label: "Jun", value: 54, previous: 40 },
  { label: "Jul", value: 51, previous: 44 },
  { label: "Aug", value: 63, previous: 48 },
  { label: "Sep", value: 71, previous: 55 },
  { label: "Oct", value: 68, previous: 60 },
  { label: "Nov", value: 82, previous: 66 },
  { label: "Dec", value: 96, previous: 72 },
];

export const ORDERS_SERIES: ChartPoint[] = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 58 },
  { label: "Wed", value: 49 },
  { label: "Thu", value: 67 },
  { label: "Fri", value: 52 },
  { label: "Sat", value: 78 },
  { label: "Sun", value: 64 },
];

export const MESSAGES_SERIES: ChartPoint[] = [
  { label: "Mon", value: 120 },
  { label: "Tue", value: 168 },
  { label: "Wed", value: 141 },
  { label: "Thu", value: 210 },
  { label: "Fri", value: 189 },
  { label: "Sat", value: 256 },
  { label: "Sun", value: 233 },
];

export const AI_SPEND_SERIES: ChartPoint[] = [
  { label: "W1", value: 8 },
  { label: "W2", value: 13 },
  { label: "W3", value: 11 },
  { label: "W4", value: 18 },
];

export const CUSTOMERS_SERIES: ChartPoint[] = [
  { label: "Jan", value: 120 },
  { label: "Feb", value: 168 },
  { label: "Mar", value: 212 },
  { label: "Apr", value: 274 },
  { label: "May", value: 316 },
  { label: "Jun", value: 389 },
  { label: "Jul", value: 452 },
  { label: "Aug", value: 498 },
  { label: "Sep", value: 560 },
  { label: "Oct", value: 612 },
  { label: "Nov", value: 688 },
  { label: "Dec", value: 742 },
];

export const TRAFFIC_SERIES: ChartPoint[] = [
  { label: "00", value: 12 },
  { label: "04", value: 22 },
  { label: "08", value: 48 },
  { label: "12", value: 74 },
  { label: "16", value: 92 },
  { label: "20", value: 66 },
  { label: "24", value: 34 },
];

export const CHANNEL_DONUT: DonutSlice[] = [
  { name: "Telegram", value: 62, color: "#4f46e5" },
  { name: "Web", value: 24, color: "#06b6d4" },
  { name: "In-store", value: 14, color: "#22c55e" },
];

export const AI_SPEND_DONUT: DonutSlice[] = [
  { name: "Assistant", value: 46, color: "#4f46e5" },
  { name: "Manager", value: 32, color: "#06b6d4" },
  { name: "Reports", value: 22, color: "#22c55e" },
];

/* ------------------------------------------------------------------ */
/*  Tables                                                             */
/* ------------------------------------------------------------------ */

export const RECENT_ORDERS: OrderRow[] = [
  {
    id: "AR-2841",
    customer: "Noor Al-Amiri",
    channel: "telegram",
    items: "2 × Skin set, 1 × Serum",
    total: 68000,
    status: "completed",
    time: "2m",
  },
  {
    id: "AR-2840",
    customer: "Ahmed Jasim",
    channel: "telegram",
    items: "1 × Wireless headset",
    total: 42000,
    status: "processing",
    time: "8m",
  },
  {
    id: "AR-2839",
    customer: "Sara Mousa",
    channel: "web",
    items: "3 × Candle set",
    total: 27000,
    status: "completed",
    time: "19m",
  },
  {
    id: "AR-2838",
    customer: "Ali Hamdan",
    channel: "telegram",
    items: "1 × Leather wallet",
    total: 54000,
    status: "pending",
    time: "31m",
  },
  {
    id: "AR-2837",
    customer: "Rana Khader",
    channel: "web",
    items: "2 × Arabic coffee, 1 × Pot",
    total: 36000,
    status: "completed",
    time: "47m",
  },
];

export const CUSTOMERS: CustomerRow[] = [
  {
    name: "Noor Al-Amiri",
    handle: "noor.amiri",
    orders: 24,
    spend: 420000,
    status: "vip",
    initials: "NA",
  },
  {
    name: "Ahmed Jasim",
    handle: "ahmed.jasim",
    orders: 17,
    spend: 296000,
    status: "active",
    initials: "AJ",
  },
  {
    name: "Sara Mousa",
    handle: "sara.mousa",
    orders: 12,
    spend: 188000,
    status: "active",
    initials: "SM",
  },
  {
    name: "Ali Hamdan",
    handle: "ali.hamdan",
    orders: 8,
    spend: 142000,
    status: "new",
    initials: "AH",
  },
  {
    name: "Rana Khader",
    handle: "rana.khader",
    orders: 5,
    spend: 87000,
    status: "new",
    initials: "RK",
  },
];

export const TOP_PRODUCTS = [
  { name: "Glow Face Serum", sold: 342, revenue: 6840000, color: "#4f46e5" },
  { name: "Wireless Headset", sold: 208, revenue: 8736000, color: "#06b6d4" },
  { name: "Arabic Coffee Set", sold: 164, revenue: 2952000, color: "#22c55e" },
  { name: "Leather Wallet", sold: 121, revenue: 6534000, color: "#f59e0b" },
];

/* ------------------------------------------------------------------ */
/*  Calendar                                                           */
/* ------------------------------------------------------------------ */

export const CALENDAR_EVENTS: Record<string, { title: string; type: "delivery" | "order" | "ai" }> = {
  "2026-08-03": { title: "calendar.ev1", type: "order" },
  "2026-08-05": { title: "calendar.ev2", type: "delivery" },
  "2026-08-08": { title: "calendar.ev3", type: "ai" },
  "2026-08-12": { title: "calendar.ev4", type: "delivery" },
  "2026-08-14": { title: "calendar.ev5", type: "order" },
  "2026-08-19": { title: "calendar.ev6", type: "ai" },
  "2026-08-21": { title: "calendar.ev2", type: "delivery" },
  "2026-08-26": { title: "calendar.ev3", type: "ai" },
  "2026-08-28": { title: "calendar.ev2", type: "delivery" },
};

/* ------------------------------------------------------------------ */
/*  Footer / misc                                                      */
/* ------------------------------------------------------------------ */

export const FOOTER_LINKS = [
  {
    id: "product",
    links: [
      { key: "landing.footer.product.features", href: "#features" },
      { key: "landing.footer.product.pricing", href: "#pricing" },
      { key: "landing.footer.product.how", href: "#how-it-works" },
      { key: "landing.footer.product.changelog", href: "#" },
    ],
  },
  {
    id: "company",
    links: [
      { key: "landing.footer.company.about", href: "#" },
      { key: "landing.footer.company.blog", href: "#" },
      { key: "landing.footer.company.careers", href: "#" },
      { key: "landing.footer.company.contact", href: "#" },
    ],
  },
  {
    id: "resources",
    links: [
      { key: "landing.footer.resources.docs", href: "#" },
      { key: "landing.footer.resources.api", href: "#" },
      { key: "landing.footer.resources.support", href: "#" },
      { key: "landing.footer.resources.status", href: "#" },
    ],
  },
];

export const STORE_LOGOS = [
  "Baghdad Beauty",
  "Al-Saadi Electronics",
  "Huda's Kitchen",
  "Rawi Perfumes",
  "Nineveh Retail",
  "Karim Furnishings",
  "Basra Coffee",
  "Erbil Fashion",
] as const;
