import { useEffect, useRef, useCallback } from "react";
import type { ChatMessage, PresenceStatus } from "@/lib/types";
import { useSocket } from "@/lib/socket-context";

export interface ChatSocketCallbacks {
  onMessage: (msg: ChatMessage) => void;
  onMessageEdited: (data: { messageId: string; body: string; editedAt: string }) => void;
  onMessageDeleted: (data: { messageId: string }) => void;
  onMessagesRead: (data: { threadId: string; readBy: string }) => void;
  onMessageStatusUpdate: (data: { messageId: string; status: string }) => void;
  onTyping: (data: { userId: string }) => void;
  onStopTyping: (data: { userId: string }) => void;
  onThreadLocked: (data: { threadId: string; reason: string }) => void;
  onPresenceUpdate: (data: { userId: string; status: PresenceStatus }) => void;
  onNewMessageNotification: (data: { threadId: string; message: ChatMessage }) => void;
  onReactionAdded?: (data: { threadId: string; messageId: string; reaction: any }) => void;
  onReactionRemoved?: (data: { threadId: string; messageId: string; userId: string; emoji: string }) => void;
}

export function useChatSocket(callbacks: ChatSocketCallbacks) {
  const { socket } = useSocket();
  const seenIds = useRef<Set<string>>(new Set());
  const callbacksRef = useRef(callbacks);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { callbacksRef.current = callbacks; });

  useEffect(() => {
    if (!socket) return;

    const onNewMsg = (msg: ChatMessage & { _tempId?: string }) => {
      if (msg.id && seenIds.current.has(msg.id)) return;
      if (msg.id) seenIds.current.add(msg.id);
      callbacksRef.current.onMessage(msg);
    };

    const onMsgEdited = (data: any) => callbacksRef.current.onMessageEdited(data);
    const onMsgDeleted = (data: any) => callbacksRef.current.onMessageDeleted(data);
    const onMsgsRead = (data: any) => callbacksRef.current.onMessagesRead(data);
    const onMsgStatusUpdate = (data: any) => callbacksRef.current.onMessageStatusUpdate(data);
    const onUserTyping = (data: any) => callbacksRef.current.onTyping(data);
    const onUserStopTyping = (data: any) => callbacksRef.current.onStopTyping(data);
    const onThreadLockedEvent = (data: any) => callbacksRef.current.onThreadLocked(data);
    const onPresence = (data: any) => callbacksRef.current.onPresenceUpdate(data);
    const onReactionAddedEvent = (data: any) => callbacksRef.current.onReactionAdded?.(data);
    const onReactionRemovedEvent = (data: any) => callbacksRef.current.onReactionRemoved?.(data);

    socket.on("new_message", onNewMsg);
    socket.on("message_edited", onMsgEdited);
    socket.on("message_deleted", onMsgDeleted);
    socket.on("messages_read", onMsgsRead);
    socket.on("message_status_update", onMsgStatusUpdate);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stop_typing", onUserStopTyping);
    socket.on("thread_locked", onThreadLockedEvent);
    socket.on("presence_update", onPresence);
    socket.on("reaction_added", onReactionAddedEvent);
    socket.on("reaction_removed", onReactionRemovedEvent);

    activityTimerRef.current = setInterval(() => {
      if (socket.connected) socket.emit("user_activity");
    }, 30_000);

    const onActivity = () => {
      if (socket.connected) socket.emit("user_activity");
    };
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity, { passive: true });

    return () => {
      socket.off("new_message", onNewMsg);
      socket.off("message_edited", onMsgEdited);
      socket.off("message_deleted", onMsgDeleted);
      socket.off("messages_read", onMsgsRead);
      socket.off("message_status_update", onMsgStatusUpdate);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stop_typing", onUserStopTyping);
      socket.off("thread_locked", onThreadLockedEvent);
      socket.off("presence_update", onPresence);
      socket.off("reaction_added", onReactionAddedEvent);
      socket.off("reaction_removed", onReactionRemovedEvent);

      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [socket]);

  const joinThread = useCallback((threadId: string) => {
    socket?.emit("join_thread", { threadId });
  }, [socket]);

  const leaveThread = useCallback((threadId: string) => {
    socket?.emit("leave_thread", { threadId });
    seenIds.current.clear();
  }, [socket]);

  const emitTyping = useCallback((threadId: string) => {
    socket?.emit("typing", { threadId });
  }, [socket]);

  const emitStopTyping = useCallback((threadId: string) => {
    socket?.emit("stop_typing", { threadId });
  }, [socket]);

  const emitDelivered = useCallback((threadId: string, messageId: string) => {
    socket?.emit("message_delivered", { threadId, messageId });
  }, [socket]);

  const markSeenId = useCallback((id: string) => {
    seenIds.current.add(id);
  }, []);

  return { socketRef: { current: socket }, joinThread, leaveThread, emitTyping, emitStopTyping, emitDelivered, markSeenId };
}
