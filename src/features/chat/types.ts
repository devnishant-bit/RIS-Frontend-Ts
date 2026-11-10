export interface ChatUser { userid: number | string; fname: string; lname: string; username: string }
export interface ChatMessage { id: string; text: string; senderid: number; receiverid: number; timestamp: string }
export interface Conversation { id: number; name: string; messages: ChatMessage[]; unread: number }
export interface ServerMessage {
  id: string; senderid: number; receiverid: number; message: string; sentat: string;
}
export interface ConversationRow {
  other_id: number; id: number; senderid: number; receiverid: number;
  message: string; sentat: string; readat: string | null; unread: number;
}