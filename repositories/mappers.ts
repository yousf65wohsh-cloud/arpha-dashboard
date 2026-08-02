/**
 * Row → domain mappers shared by repositories.
 * Keeps domain models (types/domain.ts) decoupled from DB row shapes.
 */
import type { BusinessHours, Customer, Store } from "@/types/domain";

export interface CustomerRow {
  id: string;
  store_id: string;
  name: string;
  phone: string | null;
  telegram: string | null;
  telegram_id: string | null;
  email: string | null;
  city: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    phone: row.phone,
    telegram: row.telegram,
    telegramId: row.telegram_id,
    email: row.email,
    city: row.city,
    notes: row.notes,
    status: row.status === "inactive" ? "inactive" : "active",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface StoreRow {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string | null;
  persona: string | null;
  business_hours: unknown;
  bot_active: boolean;
  ai_model: string | null;
  language: string | null;
  currency: string | null;
  plan_id: string | null;
  created_at: string;
  updated_at: string;
}

export function mapStore(row: StoreRow): Store {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    persona: row.persona,
    businessHours: (row.business_hours as BusinessHours | null) ?? null,
    botActive: row.bot_active,
    aiModel: row.ai_model,
    language: row.language,
    currency: row.currency,
    planId: row.plan_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
