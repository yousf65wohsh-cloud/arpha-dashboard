/**
 * Arpha domain models — framework-agnostic.
 * These map 1:1 to the Supabase tables and are the contract used by
 * repositories, hooks and UI. Kept free of UI/Next/Supabase imports so the
 * same types can later be mirrored by the Flutter client (OpenAPI/JSON).
 *
 * Schema status: inferred (see lib/supabase/database.types.ts). Regenerate
 * once `supabase gen types` is available and reconcile any drift here.
 */
import type {
  ConversationStatus,
  MessageActor,
  OrderChannel,
  OrderStatus,
  PaymentMethod,
} from "@/lib/supabase/database.types";

/* ── Stores & plans ─────────────────────────────────────────────── */

export interface Store {
  id: string;
  ownerId: string | null;
  name: string;
  slug: string | null;
  persona: string | null;
  businessHours: BusinessHours | null;
  botActive: boolean;
  aiModel: string | null;
  language: string | null;
  currency: string | null;
  planId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Stored as JSON on `stores.business_hours`. */
export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // "09:00"
  close: string; // "18:00"
  closed?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  features: string[] | null;
  tokenLimit: number | null;
  active: boolean;
  createdAt: string;
}

export interface StorePlatformCredential {
  id: string;
  storeId: string;
  platform: string;
  credentials: Record<string, unknown> | null;
  enabled: boolean;
}

/* ── Customers ──────────────────────────────────────────────────── */

export interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone: string | null;
  telegram: string | null;
  telegramId: string | null;
  email: string | null;
  city: string | null;
  notes: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CustomerMemory {
  id: string;
  customerId: string;
  storeId: string;
  kind: string | null;
  content: string;
  source: string | null;
  createdAt: string;
}

/** Customer + derived aggregates (computed by the repository layer). */
export interface CustomerWithStats extends Customer {
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  lastConversationAt: string | null;
  memories: CustomerMemory[];
  favoriteProductIds: string[];
}

/* ── Conversations ──────────────────────────────────────────────── */

export interface Conversation {
  id: string;
  storeId: string;
  customerId: string | null;
  channel: string;
  status: ConversationStatus;
  botHandled: boolean;
  muted: boolean;
  assignedTo: string | null;
  lastMessageAt: string;
  unreadCount: number;
  telegramChatId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  actor: MessageActor;
  content: string;
  createdAt: string;
}

/** A conversation joined with its customer + last message (list row). */
export interface ConversationListItem extends Conversation {
  customer: Customer | null;
  lastMessage: string | null;
}

/* ── Orders ─────────────────────────────────────────────────────── */

export interface Order {
  id: string;
  storeId: string;
  customerId: string | null;
  channel: OrderChannel;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  city: string | null;
  address: string | null;
  notes: string | null;
  total: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface OrderStatusLog {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  actor: string | null;
  note: string | null;
  createdAt: string;
}

/** An order with its items, customer and status history (detail view). */
export interface OrderDetail extends Order {
  items: OrderItem[];
  customer: Customer | null;
  statusLog: OrderStatusLog[];
}

/* ── Catalog ────────────────────────────────────────────────────── */

export interface Product {
  id: string;
  storeId: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
  price: number;
  cost: number | null;
  stock: number;
  lowStockThreshold: number | null;
  status: "active" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface ProductMedia {
  id: string;
  productId: string;
  url: string;
  kind: string | null;
  position: number | null;
}

/** Product joined with its media (list/grid view). */
export interface ProductWithMedia extends Product {
  media: ProductMedia[];
}

export interface Service {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number | null;
  category: string | null;
  status: "active" | "paused";
  bookings: number | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}

/* ── Policies ───────────────────────────────────────────────────── */

export interface Policy {
  id: string;
  storeId: string;
  key: string | null;
  title: string | null;
  content: string;
  enabled: boolean;
  position: number | null;
  createdAt: string;
  updatedAt: string;
}

/* ── Notifications / follow-ups ─────────────────────────────────── */

export interface PendingFollowup {
  id: string;
  storeId: string;
  conversationId: string | null;
  customerId: string | null;
  type: string | null;
  question: string;
  payload: Record<string, unknown> | null;
  status: "pending" | "resolved";
  resolvedAt: string | null;
  createdAt: string;
}

/* ── AI usage ───────────────────────────────────────────────────── */

export interface UsageEvent {
  id: string;
  storeId: string;
  eventType: string;
  agent: string | null;
  model: string | null;
  tokens: number | null;
  cost: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/** Aggregated AI usage for a period (computed by the repository). */
export interface UsageSummary {
  messages: number;
  tokens: number;
  estimatedCost: number;
  currentPlan: Plan | null;
  /** Null until the plan token quota is wired (stores→plans join). */
  usagePercent: number | null;
  byDay: Array<{ date: string; tokens: number; cost: number }>;
}

/* ── Reports ────────────────────────────────────────────────────── */

export type ReportGranularity = "daily" | "weekly" | "monthly" | "yearly";

export interface ReportPoint {
  bucket: string;
  revenue: number;
  orders: number;
  customers: number;
  cancelledOrders: number;
  conversion: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface ReportSummary {
  series: ReportPoint[];
  topProducts: TopProduct[];
  totals: {
    revenue: number;
    orders: number;
    customers: number;
    cancelledOrders: number;
    conversion: number;
  };
}
