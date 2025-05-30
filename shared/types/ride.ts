import { User } from './user';

export type TerrainType = 'Road' | 'Mountain' | 'Gravel' | 'Urban';
export type PaceLevel = 'Casual' | 'Moderate' | 'Fast';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type GenderPreference = 'All' | 'Male' | 'Female';

export interface Route {
  distance: number;
  elevationGain: number;
  gpxFile: string | null;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Organizer {
  id: string;
  name: string;
  rating: number;
}

export interface Ride {
  _id: string;
  title: string;
  description: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  creatorId: string;
  creator: User;
  participants: RideParticipant[];
  route: {
    distance: number;
    elevationGain: number;
    startPoint: {
      latitude: number;
      longitude: number;
    };
    endPoint: {
      latitude: number;
      longitude: number;
    };
  };
  pace: string;
  terrain: string;
  difficulty: string;
  genderPreference: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PaceLevelRanges: Record<PaceLevel, { minSpeed: number; maxSpeed: number }> = {
  Casual: { minSpeed: 15, maxSpeed: 20 },
  Moderate: { minSpeed: 20, maxSpeed: 25 },
  Fast: { minSpeed: 25, maxSpeed: 35 },
};

export interface RideParticipant {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export type PaceRange = {
  minSpeed: number; // km/h
  maxSpeed: number; // km/h
};

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  rideId?: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  members: RideParticipant[];
  rides: Ride[];
  location: Location;
  type: TerrainType[];
  skillLevel: DifficultyLevel;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: 'elevation' | 'distance' | 'rides' | 'custom';
  target: number;
  participants: {
    user: RideParticipant;
    progress: number;
  }[];
} 