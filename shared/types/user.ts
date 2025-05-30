export interface ClubReference {
  club: string;
  joinedAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  rating?: number;
  ridesJoined?: number;
  ridesCreated?: number;
  createdRides?: string[];
  joinedRides?: string[];
  clubs?: ClubReference[];
  createdAt: Date;
  updatedAt: Date;
  profilePicture?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 