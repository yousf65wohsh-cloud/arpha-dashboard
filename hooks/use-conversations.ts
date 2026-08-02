/**
 * Conversations hooks — list + detail + actions + realtime.
 *
 * Realtime (V1): subscribes to `conversations` (store scope) and `messages`
 * (per conversation) postgres_changes and refetches, keeping the Live
 * Conversations page current without a websocket client of our own.
 */
import { useCallback, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useStore } from "@/hooks/use-store";
import { useAsync } from "@/hooks/use-async";
import { conversationRepository } from "@/repositories";
import type { ConversationStatus, MessageActor } from "@/lib/supabase/database.types";
import type { Conversation, ConversationListItem, Customer, Message } from "@/types/domain";

export interface ConversationFilters {
  search?: string | null;
  status?: ConversationStatus | "all" | null;
  unreadOnly?: boolean;
}

export function useConversations(filters: ConversationFilters = {}) {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;
  const { search, status, unreadOnly } = filters;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve<ConversationListItem[]>([]);
    return conversationRepository.list(client, storeId, { search, status, unreadOnly });
  }, [client, storeId, search, status, unreadOnly]);

  const { data: conversations, loading, error, refetch, setData } = useAsync(fetch, [
    client,
    storeId,
    search,
    status,
    unreadOnly,
  ], Boolean(client && storeId));

  // Realtime: any conversation change in the store refreshes the list.
  useEffect(() => {
    if (!client || !storeId) return;
    const channel = conversationRepository.subscribeToConversations(client, storeId, () => {
      void refetch();
    });
    return () => {
      channel?.unsubscribe();
    };
  }, [client, storeId, refetch]);

  const updateStatus = useCallback(async (id: string, nextStatus: ConversationStatus) => {
    if (!client) return;
    await conversationRepository.updateStatus(client, id, nextStatus);
    void refetch();
  }, [client, refetch]);

  const toggleMute = useCallback(async (id: string, muted: boolean) => {
    if (!client) return;
    await conversationRepository.setMuted(client, id, muted);
    void refetch();
  }, [client, refetch]);

  const setBotHandled = useCallback(async (id: string, botHandled: boolean) => {
    if (!client) return;
    await conversationRepository.setBotHandled(client, id, botHandled);
    void refetch();
  }, [client, refetch]);

  const takeOver = useCallback(async (id: string) => {
    if (!client) return;
    await conversationRepository.assign(client, id, "owner");
    void refetch();
  }, [client, refetch]);

  const markRead = useCallback(async (id: string) => {
    if (!client) return;
    await conversationRepository.markRead(client, id);
    void refetch();
  }, [client, refetch]);

  return {
    conversations,
    loading,
    error,
    refetch,
    setConversations: setData,
    updateStatus,
    toggleMute,
    setBotHandled,
    takeOver,
    markRead,
  };
}

export interface ConversationDetail {
  conversation: Conversation;
  customer: Customer | null;
  messages: Message[];
}

export function useConversationDetail(conversationId: string | null) {
  const client = useSupabase();

  const fetch = useCallback(() => {
    if (!client || !conversationId) return Promise.resolve<ConversationDetail | null>(null);
    return conversationRepository.findById(client, conversationId);
  }, [client, conversationId]);

  const { data, loading, error, refetch, setData } = useAsync<ConversationDetail | null>(
    fetch,
    [client, conversationId],
    Boolean(client && conversationId),
  );

  // Realtime: live messages within the open conversation.
  useEffect(() => {
    if (!client || !conversationId) return;
    const channel = conversationRepository.subscribeToMessages(client, conversationId, () => {
      void refetch();
    });
    return () => {
      channel?.unsubscribe();
    };
  }, [client, conversationId, refetch]);

  const sendMessage = useCallback(
    async (content: string, actor: MessageActor = "staff"): Promise<Message | null> => {
      if (!client || !conversationId) return null;
      const message = await conversationRepository.sendMessage(client, conversationId, actor, content);
      void refetch();
      return message;
    },
    [client, conversationId, refetch],
  );

  return {
    detail: data,
    loading,
    error,
    refetch,
    sendMessage,
    setDetail: setData,
  };
}
