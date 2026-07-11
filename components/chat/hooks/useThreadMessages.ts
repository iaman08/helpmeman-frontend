"use client";
import { useState, useCallback, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import api from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

interface UseThreadMessagesReturn {
  messages: ChatMessage[];
  hasMore: boolean;
  loadingMore: boolean;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  loadMessages: (threadId: string) => Promise<void>;
  loadMore: (threadId: string) => Promise<void>;
  appendMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  addOptimistic: (msg: ChatMessage) => void;
  confirmOptimistic: (tempId: string, realMsg: ChatMessage) => void;
  failOptimistic: (tempId: string) => void;
  clearMessages: () => void;
}

export function useThreadMessages(): UseThreadMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const nextCursorRef = useRef<string | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const loadMessages = useCallback(async (threadId: string) => {
    nextCursorRef.current = null;
    seenIdsRef.current = new Set();
    try {
      const res = await api.get(`/chat/threads/${threadId}/messages`, {
        params: { limit: 40 },
      });
      const { messages: msgs, hasMore: more, nextCursor } = res.data;
      seenIdsRef.current = new Set((msgs as ChatMessage[]).map((m) => m.id));
      nextCursorRef.current = nextCursor ?? null;
      setHasMore(!!more);
      setMessages(msgs ?? []);
    } catch (e: any) {
      if (e?.response?.status === 404 || e?.response?.status === 405) {
        try {
          const fallback = await api.get(`/chat/threads/${threadId}`);
          const msgs: ChatMessage[] = fallback.data?.thread?.messages ?? [];
          seenIdsRef.current = new Set(msgs.map((m) => m.id));
          setHasMore(false);
          setMessages(msgs);
          return;
        } catch {
          // ignore
        }
      }
      console.error("[MESSAGES] loadMessages error:", e);
      setMessages([]);
      setHasMore(false);
    }
  }, []);

  const loadMore = useCallback(async (threadId: string) => {
    if (loadingMore || !hasMore || !nextCursorRef.current) return;
    setLoadingMore(true);
    try {
      const res = await api.get(`/chat/threads/${threadId}/messages`, {
        params: { limit: 40, cursor: nextCursorRef.current },
      });
      const { messages: older, hasMore: more, nextCursor } = res.data;
      nextCursorRef.current = nextCursor;
      setHasMore(more);
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newOnes = (older as ChatMessage[]).filter((m) => !existingIds.has(m.id));
        newOnes.forEach((m) => seenIdsRef.current.add(m.id));
        return [...newOnes, ...prev];
      });
    } catch (e) {
      console.error("[MESSAGES] loadMore error:", e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  const appendMessage = useCallback((msg: ChatMessage) => {
    if (!msg.id || seenIdsRef.current.has(msg.id)) return;
    seenIdsRef.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, deletedAt: new Date().toISOString() } : m))
    );
  }, []);

  const addOptimistic = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const confirmOptimistic = useCallback((tempId: string, realMsg: ChatMessage) => {
    if (realMsg.id) seenIdsRef.current.add(realMsg.id);
    setMessages((prev) =>
      prev.map((m) => (m._tempId === tempId ? { ...realMsg, _tempId: undefined, _sending: false } : m))
    );
  }, []);

  const failOptimistic = useCallback((tempId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m._tempId === tempId ? { ...m, _sending: false, _failed: true } : m))
    );
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setHasMore(false);
    nextCursorRef.current = null;
    seenIdsRef.current = new Set();
  }, []);

  return {
    messages,
    hasMore,
    loadingMore,
    setMessages,
    loadMessages,
    loadMore,
    appendMessage,
    updateMessage,
    removeMessage,
    addOptimistic,
    confirmOptimistic,
    failOptimistic,
    clearMessages,
  };
}
