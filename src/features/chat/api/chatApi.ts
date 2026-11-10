import axios from 'axios';
import type { ChatUser, ConversationRow, ServerMessage } from '../types';

const base = import.meta.env.VITE_API_BASE_URL ?? '';
const post = <T>(path: string, body: object) =>
  axios.post<T>(`${base}/tiservice/${path}`, body, { withCredentials: true });

export function getFeatureId(name: string): number | null {
  const features = JSON.parse(localStorage.getItem('features') || '[]');
  return features.find((f: { featurename: string }) => f.featurename === name)?.featureid ?? null;
}

export async function fetchUsers(featureid: number | null): Promise<ChatUser[]> {
  const { data } = await post<{ retval: string; userlist?: ChatUser[] }>('user/getallusers', { featureid });
  return data.retval === 'SUCCESS' ? data.userlist ?? [] : [];
}

// export async function fetchChatHistory(featureid: number | null, me: number, otherId: number): Promise<ServerMessage[]> {
//   const { data } = await post<{ retval: string; userchats?: ServerMessage[] }>(
//     'userchats/getchathistory', { featureid, senderid: me, receiverid: otherId });
//   if (data.retval !== 'SUCCESS' && data.retval !== 'NO_CHATS_FOUND') throw new Error(data.retval);
//   return data.userchats ?? [];
// }

// export async function fetchConversations(featureid: number | null): Promise<ConversationRow[]> {
//   const { data } = await post<{ retval: string; conversations?: ConversationRow[] }>(
//     'userchats/getconversations', { featureid });
//   return data.retval === 'SUCCESS' ? data.conversations ?? [] : [];
// }