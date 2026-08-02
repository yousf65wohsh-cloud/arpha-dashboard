/* ------------------------------------------------------------------ */
/*  Arpha Management Dashboard — shared types                          */
/* ------------------------------------------------------------------ */

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderChannel = "telegram" | "web" | "phone" | "instore";

export type PaymentMethod = "cod" | "card" | "wallet";

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface TimelineStep {
  label: string;
  time: string;
  done: boolean;
}

export interface Order {
  id: string;
  customer: string;
  customerId: string;
  channel: OrderChannel;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment: PaymentMethod;
  city: string;
  address: string;
  createdAt: string;
  timeline: TimelineStep[];
}

export type CustomerTag = "vip" | "new" | "repeat" | "wholesale";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  telegram: string;
  email?: string;
  city: string;
  orders: number;
  totalSpent: number;
  lastVisit: string;
  joined: string;
  tags: CustomerTag[];
  aiMemory: string[];
  conversations: number;
  satisfaction: number;
  status: "active" | "inactive";
}

export interface Product {
  id: string;
  nameKey?: string;
  name: string;
  sku: string;
  categoryKey?: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  lowStock: number;
  sold: number;
  status: "active" | "draft" | "archived";
  hue: string;
}

export interface Service {
  id: string;
  nameKey?: string;
  descKey?: string;
  name: string;
  description: string;
  price: number;
  durationKey?: string;
  duration: string;
  categoryKey?: string;
  category: string;
  status: "active" | "paused";
  bookings: number;
  rating: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "active" | "invited" | "suspended";
  permissions: string[];
  initials: string;
  lastActive: string;
}

export type ChatActor = "bot" | "customer" | "staff";

export interface ChatMessage {
  actor: ChatActor;
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  customer: string;
  handle: string;
  channel: "telegram";
  preview: string;
  lastMessageAt: string;
  unread: number;
  status: "open" | "awaiting" | "resolved";
  botHandled: boolean;
  messages: ChatMessage[];
}

export type NotificationType = "order" | "ai" | "billing" | "system" | "alert";

export interface AppNotification {
  id: string;
  type: NotificationType;
  titleKey: string;
  detailKey: string;
  titleArgs?: Record<string, string>;
  detailArgs?: Record<string, string>;
  time: string;
  date: "Today" | "Yesterday" | "Earlier";
  read: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  plan: string;
  status: "paid" | "pending" | "overdue";
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "order" | "delivery" | "ai" | "meeting" | "restock";
}

export interface ChartPoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export type CalendarView = "day" | "week" | "month";

export type DashboardSection =
  | "dashboard"
  | "orders"
  | "customers"
  | "products"
  | "services"
  | "calendar"
  | "conversations"
  | "ai-center"
  | "analytics"
  | "reports"
  | "employees"
  | "billing"
  | "plans"
  | "notifications"
  | "settings";

export type Lang = "en" | "ar";
