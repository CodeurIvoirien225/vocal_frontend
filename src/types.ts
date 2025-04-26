export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface VocalMessage {
  id: number;
  user_id: number;
  audio_url: string;
  created_at: string;
  reactions: {
    laugh: number;
    cry: number;
    like: number;
  };
  comments: Comment[];
}

export interface Comment {
  id: number;
  user_id: number;
  message_id: number;
  content: string;
  is_audio: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: 'comment' | 'reaction' | 'report';
  content: string;
  created_at: string;
  read: boolean;
}