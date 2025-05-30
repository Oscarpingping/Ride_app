import { ClubReference } from '../shared/types/user';

export type TerrainType = 'Road' | 'Gravel' | 'MTB' | 'Urban' | 'Mixed';
export type PaceLevel = 'Casual' | 'Moderate' | 'Fast';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type GenderPreference = 'All' | 'Men' | 'Women' | 'Non-binary';

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
  id: string;
  title: string;
  description: string;
  startTime: Date;
  route: Route;
  meetingPoint: Location;
  maxParticipants: number;
  currentParticipants: number;
  terrain: TerrainType;
  pace: PaceLevel;
  difficulty: DifficultyLevel;
  genderPreference: GenderPreference;
  organizer: Organizer;
  participants: string[];
}

export const PaceLevelRanges: Record<PaceLevel, { minSpeed: number; maxSpeed: number }> = {
  Casual: { minSpeed: 15, maxSpeed: 20 },
  Moderate: { minSpeed: 20, maxSpeed: 25 },
  Fast: { minSpeed: 25, maxSpeed: 35 },
};

export interface User {
  id: string;
  name: string;
  email: string;
  rating: number;
  ridesJoined?: number;
  ridesCreated?: number;
  clubs?: ClubReference[];
  profilePicture?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
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
  members: User[];
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
    user: User;
    progress: number;
  }[];
} 