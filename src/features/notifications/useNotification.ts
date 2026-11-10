import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/app/providers/SocketProvider';
import type { SidebarNotification } from '@/layouts/components/Sidebar/Sidebar'; // adjust path

interface ServerNotification { type?: string; title?: string; message?: string; createdAt?: string }
type Item = SidebarNotification & { read: boolean };

const formatTime = (ts: string) => {
  const d = new Date(ts);
  return Number.isNaN(d.getTime())
    ? 'Just now'
    : d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export function useNotifications() {
  const socket = useSocket();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!socket) return;
    const onNotification = (raw: ServerNotification) => {
      const createdAt = raw.createdAt ?? new Date().toISOString();
      const title = raw.title || 'New notification';
      const message = raw.message || 'You have a new notification.';
      const id = `${title}-${message}-${createdAt}`; // same dedupe key the old Header used
      setItems((prev) =>
        [{ id, title, message, category: raw.type, time: formatTime(createdAt), read: false },
         ...prev.filter((n) => n.id !== id)].slice(0, 50));
    };
    socket.on('notification', onNotification);
    return () => { socket.off('notification', onNotification); };
  }, [socket]);

  const markAllRead = useCallback(() => setItems((p) => p.map((n) => ({ ...n, read: true }))), []);
  const unreadCount = items.filter((n) => !n.read).length;
  return { notifications: items, unreadCount, markAllRead };
}