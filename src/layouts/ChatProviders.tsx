import { Outlet } from 'react-router-dom'
import { SocketProvider } from '@/app/providers/SocketProvider'
import { ChatProvider } from '@/features/chat/ChatProvider'
import { useAuth } from '@/shared/auth/useAuth'

export function ChatProviders() {
  const { user } = useAuth()
  return (
    <SocketProvider isLoggedIn>
      <ChatProvider myId={Number(user?.id)}>   {/* use whatever field holds the numeric userid */}
        <Outlet />
      </ChatProvider>
    </SocketProvider>
  )
}