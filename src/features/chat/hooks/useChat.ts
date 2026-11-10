import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/app/providers/SocketProvider';
import { fetchUsers, getFeatureId } from '../api/chatApi';
import type { ChatMessage, ChatUser, Conversation, ServerMessage } from '../types';

const FEATURE = 'View User';

const toMessage = (m: ServerMessage): ChatMessage => ({
  id: m.id,
  text: m.message,
  senderid: Number(m.senderid),
  receiverid: Number(m.receiverid),
  timestamp: m.sentat,
});

export function useChat(myId: number) {
  const socket = useSocket();
  const [connected, setConnected] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [doctors, setDoctors] = useState<ChatUser[]>([]);
  const [conversations, setConversations] = useState<Record<number, Conversation>>({});
  const [sendError, setSendError] = useState<string | null>(null);

  const activeRef = useRef(activeChatId);
  activeRef.current = activeChatId;
  const doctorsRef = useRef(doctors);
  doctorsRef.current = doctors;

  const nameFor = useCallback((id: number) => {
    const d = doctorsRef.current.find((u) => Number(u.userid) === id);
    return d ? `${d.fname} ${d.lname}`.trim() : `User ${id}`;
  }, []);

  const loadUsers = useCallback(async () => {
    const all = await fetchUsers(getFeatureId(FEATURE));
    const others = all.filter((u) => Number(u.userid) !== myId);
    doctorsRef.current = others;
    setDoctors(others);
  }, [myId]);

  const openChat = useCallback((otherId: number) => {
    setConversations((prev) => ({
      ...prev,
      [otherId]: {
        id: otherId,
        name: prev[otherId]?.name ?? nameFor(otherId),
        messages: prev[otherId]?.messages ?? [],
        unread: 0,
      },
    }));
    setActiveChatId(otherId);
    setSendError(null);
  }, [nameFor]);

  useEffect(() => {
    loadUsers().catch((e) => console.error('Chat load failed:', e));
  }, [loadUsers]);

  useEffect(() => {
    if (!socket) return;
    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onMessage = (m: ServerMessage) => {
      const sender = Number(m.senderid), receiver = Number(m.receiverid);
      if (sender !== myId && receiver !== myId) return;
      const otherId = sender === myId ? receiver : sender;
      const msg = toMessage(m);
      const incoming = sender !== myId;
      const viewing = incoming && activeRef.current === otherId && document.visibilityState === 'visible';

      setConversations((prev) => {
        const conv = prev[otherId] ?? { id: otherId, name: nameFor(otherId), messages: [], unread: 0 };
        if (conv.messages.some((x) => x.id === msg.id)) return prev; // dedupe
        return {
          ...prev,
          [otherId]: {
            ...conv,
            messages: [...conv.messages, msg],
            unread: incoming && !viewing ? conv.unread + 1 : conv.unread,
          },
        };
      });
    };

    // Clear the active thread's unread count when the tab comes back into view
    const onVisible = () => {
      const id = activeRef.current;
      if (document.visibilityState !== 'visible' || id == null) return;
      setConversations((prev) =>
        prev[id]?.unread ? { ...prev, [id]: { ...prev[id], unread: 0 } } : prev,
      );
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chat:message', onMessage);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat:message', onMessage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [socket, myId, nameFor]);

  const send = useCallback((text: string) => {
    const t = text.trim();
    if (!t || activeChatId == null || !socket?.connected) return false;
    setSendError(null);
    socket.timeout(5000).emit(
      'chat:send',
      { receiverId: activeChatId, message: t },
      (err: Error | null, res?: { ok: boolean; error?: string }) => {
        if (err) setSendError('No response from server');
        else if (!res?.ok) setSendError(res?.error ?? 'Message not sent');
      },
    );
    return true;
  }, [socket, activeChatId]);

  const unreadCount = Object.values(conversations).reduce((n, c) => n + c.unread, 0);

  return { connected, activeChatId, setActiveChatId, doctors, conversations, openChat, send, sendError, unreadCount };
}