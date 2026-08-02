/**
 * INFERRED DATABASE SCHEMA — PLACEHOLDER
 * ======================================
 * These types were inferred from the table names declared in the project spec
 * plus the frontend domain model. They are a working contract for the typed
 * repositories and MUST be replaced by the real generated file:
 *
 *     supabase gen types typescript --project-id <PROJECT_ID> \
 *       > lib/supabase/database.types.ts
 *
 * Run this once `supabase` CLI + project access keys are available.
 * Do not hand-edit generated output beyond that point.
 *
 * @todo regenerate with `supabase gen types typescript`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "delivered"
  | "cancelled";

export type OrderChannel = "telegram" | "web" | "phone" | "instore";

export type PaymentMethod = "cod" | "card" | "wallet";

export type ConversationStatus = "open" | "awaiting" | "resolved";

export type MessageActor = "bot" | "customer" | "staff";

export type FollowupStatus = "pending" | "resolved";

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          slug: string | null;
          persona: string | null;
          business_hours: Json | null;
          bot_active: boolean;
          ai_model: string | null;
          language: string | null;
          currency: string | null;
          plan_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          slug?: string | null;
          persona?: string | null;
          business_hours?: Json | null;
          bot_active?: boolean;
          ai_model?: string | null;
          language?: string | null;
          currency?: string | null;
          plan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stores"]["Insert"]>;
        Relationships: [];
      };

      plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number | null;
          features: Json | null;
          token_limit: number | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price?: number | null;
          features?: Json | null;
          token_limit?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
        Relationships: [];
      };

      customers: {
        Row: {
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
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          phone?: string | null;
          telegram?: string | null;
          telegram_id?: string | null;
          email?: string | null;
          city?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };

      customer_memories: {
        Row: {
          id: string;
          customer_id: string;
          store_id: string;
          kind: string | null;
          content: string;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          store_id: string;
          kind?: string | null;
          content: string;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customer_memories"]["Insert"]>;
        Relationships: [];
      };

      conversations: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string | null;
          channel: string;
          status: ConversationStatus;
          bot_handled: boolean;
          muted: boolean;
          assigned_to: string | null;
          last_message_at: string;
          unread_count: number;
          telegram_chat_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id?: string | null;
          channel?: string;
          status?: ConversationStatus;
          bot_handled?: boolean;
          muted?: boolean;
          assigned_to?: string | null;
          last_message_at?: string;
          unread_count?: number;
          telegram_chat_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
        Relationships: [];
      };

      messages: {
        Row: {
          id: string;
          conversation_id: string;
          actor: MessageActor;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          actor: MessageActor;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [];
      };

      orders: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string | null;
          channel: OrderChannel;
          status: OrderStatus;
          payment_method: PaymentMethod | null;
          city: string | null;
          address: string | null;
          notes: string | null;
          total: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id?: string | null;
          channel?: OrderChannel;
          status?: OrderStatus;
          payment_method?: PaymentMethod | null;
          city?: string | null;
          address?: string | null;
          notes?: string | null;
          total?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          name: string;
          qty: number;
          unit_price: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          name: string;
          qty: number;
          unit_price: number;
          total: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };

      order_status_log: {
        Row: {
          id: string;
          order_id: string;
          from_status: string | null;
          to_status: string;
          actor: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          from_status?: string | null;
          to_status: string;
          actor?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_status_log"]["Insert"]>;
        Relationships: [];
      };

      products: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          sku: string | null;
          category: string | null;
          description: string | null;
          price: number;
          cost: number | null;
          stock: number;
          low_stock_threshold: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          sku?: string | null;
          category?: string | null;
          description?: string | null;
          price: number;
          cost?: number | null;
          stock?: number;
          low_stock_threshold?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };

      product_media: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          kind: string | null;
          position: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          kind?: string | null;
          position?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_media"]["Insert"]>;
        Relationships: [];
      };

      services: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          description: string | null;
          price: number;
          duration_minutes: number | null;
          category: string | null;
          status: string;
          bookings: number | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          description?: string | null;
          price: number;
          duration_minutes?: number | null;
          category?: string | null;
          status?: string;
          bookings?: number | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };

      policies: {
        Row: {
          id: string;
          store_id: string;
          key: string | null;
          title: string | null;
          content: string;
          enabled: boolean;
          position: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          key?: string | null;
          title?: string | null;
          content: string;
          enabled?: boolean;
          position?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["policies"]["Insert"]>;
        Relationships: [];
      };

      pending_followups: {
        Row: {
          id: string;
          store_id: string;
          conversation_id: string | null;
          customer_id: string | null;
          type: string | null;
          question: string;
          payload: Json | null;
          status: FollowupStatus;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          conversation_id?: string | null;
          customer_id?: string | null;
          type?: string | null;
          question: string;
          payload?: Json | null;
          status?: FollowupStatus;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pending_followups"]["Insert"]>;
        Relationships: [];
      };

      usage_events: {
        Row: {
          id: string;
          store_id: string;
          event_type: string;
          agent: string | null;
          model: string | null;
          tokens: number | null;
          cost: number | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          event_type: string;
          agent?: string | null;
          model?: string | null;
          tokens?: number | null;
          cost?: number | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["usage_events"]["Insert"]>;
        Relationships: [];
      };

      store_platform_credentials: {
        Row: {
          id: string;
          store_id: string;
          platform: string;
          credentials: Json | null;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          platform: string;
          credentials?: Json | null;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["store_platform_credentials"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
      conversation_status: ConversationStatus;
      message_actor: MessageActor;
      payment_method: PaymentMethod;
      followup_status: FollowupStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TableInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TableUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
