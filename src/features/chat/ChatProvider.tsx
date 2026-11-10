import { createContext, useContext, type ReactNode } from 'react'
import { useChat } from './hooks/useChat'

type ChatValue = ReturnType<typeof useChat>
const ChatContext = createContext<ChatValue | null>(null)

export function ChatProvider({ myId, children }: { myId: number; children: ReactNode }) {
  const chat = useChat(myId)
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used inside ChatProvider')
  return ctx
}