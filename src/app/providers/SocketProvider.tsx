import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ isLoggedIn, children }: { isLoggedIn: boolean; children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    const s = io(import.meta.env.VITE_API_BASE_URL || undefined, {
      withCredentials: true,
      transports: ['websocket'], // cluster has no sticky sessions, so no long-polling
    });
    s.on('connect', () => console.log('socket connected', s.id));
    s.on('connect_error', (e) => console.error('socket connect_error:', e.message));
    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [isLoggedIn]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}