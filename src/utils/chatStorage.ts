export interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_KEY = "traffic-chat-history";

export const saveChat = (messages: Message[]) => {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
};

export const loadChat = (): Message[] => {
  const raw = localStorage.getItem(CHAT_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const clearChatStorage = () => {
  localStorage.removeItem(CHAT_KEY);
};