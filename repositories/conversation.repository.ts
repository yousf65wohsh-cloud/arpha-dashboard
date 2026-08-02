/**
 * Conversations + messages repository.
 * Powers the Live Conversations page and future realtime chat.
 *
 * Realtime (V1): subscribe to `conversations` and `messages` postgres_changes.
 * @todo replace last-message embedding with a materialized view / RPC if it
 * becomes a hot path at scale (thousands of stores).
 */
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Db } from "@/repositories/base";
import { ensureStoreId, guard, rel } from "@/repositories/base";
import type { ConversationStatus } from "@/lib/supabase/database.types";
import type {
  Conversation,
  ConversationListItem,
  Customer,
  Message,
} from "@/types/domain";

interface ConversationListRow {
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
  customer?: Customer | null;
  messages?: MessageRow[];
}

interface MessageRow {
  id: string;
  conversation_id: string;
  actor: Message["actor"];
  content: string;
  created_at: string;
}

function mapConversation(row: {
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
}): Conversation {
  return {
    id: row.id,
    storeId: row.store_id,
    customerId: row.customer_id,
    channel: row.channel,
    status: row.status,
    botHandled: row.bot_handled,
    muted: row.muted,
    assignedTo: row.assigned_to,
    lastMessageAt: row.last_message_at,
    unreadCount: row.unread_count,
    telegramChatId: row.telegram_chat_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    actor: row.actor,
    content: row.content,
    createdAt: row.created_at,
  };
}

interface ConversationListFilters {
  search?: string | null;
  status?: ConversationStatus | "all" | null;
  unreadOnly?: boolean;
}

export const conversationRepository = {
  /** List conversations with embedded customer + last message preview. */
  async list(
    client: Db,
    storeId: string,
    filters: ConversationListFilters = {},
  ): Promise<ConversationListItem[]> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      let query = rel(client, "conversations").select(
        `*,
         customer:customers(*),
         messages(order(created_at.desc), limit=1)`,
      );

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.unreadOnly) {
        query = query.gt("unread_count", 0);
      }
      if (filters.search) {
        query = query.or(`telegram_chat_id.ilike.%${filters.search}%`);
      }

      const { data, error } = await query
        .eq("store_id", sid)
        .order("last_message_at", {
          ascending: false,
        });
      if (error) throw error;

      return (data ?? []).map((row: ConversationListRow) => {
        const customer = row.customer ?? null;
        const last = row.messages?.[0];
        return {
          ...mapConversation(row),
          customer,
          lastMessage: last?.content ?? null,
        };
      });
    });
  },

  /** Full conversation: messages (asc) + customer. */
  async findById(client: Db, conversationId: string) {
    return guard(async () => {
      const { data, error } = await rel(client, "conversations")
        .select(
          `*,
           customer:customers(*),
           messages(order(created_at.asc))`,
        )
        .eq("id", conversationId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const row = data as ConversationListRow;
      return {
        conversation: mapConversation(row),
        customer: row.customer ?? null,
        messages: (row.messages ?? []).map(mapMessage),
      };
    });
  },

  async updateStatus(client: Db, id: string, status: ConversationStatus) {
    return guard(async () => {
      const { error } = await client
        .from("conversations")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    });
  },

  async setMuted(client: Db, id: string, muted: boolean) {
    return guard(async () => {
      const { error } = await client
        .from("conversations")
        .update({ muted })
        .eq("id", id);
      if (error) throw error;
    });
  },

  async setBotHandled(client: Db, id: string, botHandled: boolean) {
    return guard(async () => {
      const { error } = await client
        .from("conversations")
        .update({ bot_handled: botHandled })
        .eq("id", id);
      if (error) throw error;
    });
  },

  async assign(client: Db, id: string, assignedTo: string) {
    return guard(async () => {
      const { error } = await client
        .from("conversations")
        .update({ assigned_to: assignedTo, bot_handled: false })
        .eq("id", id);
      if (error) throw error;
    });
  },

  /** Mark a conversation read (owner opened it). */
  async markRead(client: Db, id: string) {
    return guard(async () => {
      const { error } = await client
        .from("conversations")
        .update({ unread_count: 0 })
        .eq("id", id);
      if (error) throw error;
    });
  },

  /** Insert a message as the owner/staff and touch the conversation. */
  async sendMessage(
    client: Db,
    conversationId: string,
    actor: Message["actor"],
    content: string,
  ): Promise<Message> {
    return guard(async () => {
      const { data, error } = await client
        .from("messages")
        .insert({ conversation_id: conversationId, actor, content })
        .select()
        .single();
      if (error) throw error;

      await client
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          bot_handled: actor !== "staff",
        })
        .eq("id", conversationId);

      return mapMessage(data);
    });
  },

  /* ── Realtime ────────────────────────────────────────────────── */

  subscribeToConversations(
    client: Db,
    storeId: string,
    onEvent: (payload: { new: Conversation; old: Conversation | null }) => void,
  ): RealtimeChannel | null {
    return subscribe(
      client,
      `conv-${storeId}`,
      "conversations",
      `store_id=eq.${storeId}`,
      onEvent,
    );
  },

  subscribeToMessages(
    client: Db,
    conversationId: string,
    onEvent: (payload: { new: Message }) => void,
  ): RealtimeChannel | null {
    return subscribe(
      client,
      `msg-${conversationId}`,
      "messages",
      `conversation_id=eq.${conversationId}`,
      onEvent,
    );
  },
};

type Subscription<TNew, TOld = null> = (payload: {
  new: TNew;
  old: TOld | null;
}) => void;

function subscribe<TNew, TOld = null>(
  client: Db,
  channelName: string,
  table: string,
  filter: string,
  onEvent: Subscription<TNew, TOld>,
): RealtimeChannel | null {
  const channel = client.channel(channelName);
  channel.on(
    "postgres_changes",
    { event: "*", schema: "public", table, filter },
    (payload) => {
      onEvent({
        new: payload.new as TNew,
        old: (payload.old as TOld | null) ?? null,
      } as { new: TNew; old: TOld | null });
    },
  );
  channel.subscribe();
  return channel;
}
