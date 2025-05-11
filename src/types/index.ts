
export interface Channel {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount?: string;
  description?: string;
  isKidFriendly?: boolean;
  category?: string;
  url?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export interface AuthData {
  accessToken: string;
  expiresAt: number; // Timestamp when the token expires
  user: User;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
