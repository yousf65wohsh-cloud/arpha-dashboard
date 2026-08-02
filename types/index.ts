import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Landing content types                                              */
/* ------------------------------------------------------------------ */

export interface Feature {
  icon: LucideIcon;
  id: string;
  accent: "primary" | "success" | "accent" | "warning" | "danger";
}

export interface PricingTier {
  id: "starter" | "business" | "enterprise";
  priceMonthly: number;
  priceYearly: number;
  featureCount: number;
  cta: string;
  highlighted?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  store: string;
  initials: string;
  rating: number;
}

export interface FaqItem {
  id: string;
}

export interface PipelineStep {
  step: string;
  id: string;
  icon: LucideIcon;
  accent: "primary" | "accent" | "success" | "warning" | "danger";
}

/* ------------------------------------------------------------------ */
/*  Dashboard preview types                                            */
/* ------------------------------------------------------------------ */

export type OrderStatus = "completed" | "processing" | "pending" | "cancelled";

export type CustomerStatus = "active" | "new" | "vip";

export interface OrderRow {
  id: string;
  customer: string;
  channel: "telegram" | "web";
  items: string;
  total: number;
  status: OrderStatus;
  time: string;
}

export interface CustomerRow {
  name: string;
  handle: string;
  orders: number;
  spend: number;
  status: CustomerStatus;
  initials: string;
}

export interface ChartPoint {
  label: string;
  value: number;
  previous?: number;
}

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export type DashboardViewId =
  | "overview"
  | "orders"
  | "analytics"
  | "customers"
  | "ai-usage"
  | "revenue"
  | "calendar";

export interface DashboardViewMeta {
  id: DashboardViewId;
  label: string;
  url: string;
}
