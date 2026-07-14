export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  location: string;
  address: string;
  sport: "러닝" | "농구" | "축구" | "배드민턴" | "기타";
  status: "모집중" | "모집마감";
  createdAt: string;
  author: string;
  views: number;
  description: string;
  tags: string[];
  joinedCount: number;
  maxCount: number;
  lat: number; // percentage top (e.g. 30)
  lng: number; // percentage left (e.g. 40)
  comments: Comment[];
  image?: string; // Header image url
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface ChatConversation {
  id: string; // matches post id
  title: string;
  joinedCount: number;
  maxCount: number;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  messages: ChatMessage[];
}
