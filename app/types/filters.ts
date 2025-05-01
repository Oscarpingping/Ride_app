import { TerrainType, PaceLevel, DifficultyLevel } from '../../types/ride';

export interface FilterState {
  searchText: string;
  genderPreference: 'All' | 'Men' | 'Women' | 'Non-binary';
  maxDistance: number;
  minDistance: number;
  terrain: TerrainType[];
  pace: PaceLevel[];
  difficulty: DifficultyLevel[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sortBy: 'date' | 'distance' | 'rating';
  sortOrder: 'asc' | 'desc';
  clubId: string | null;
  minElevation: number;
  maxElevation: number;
  maxParticipants: number | null;
  location: {
    latitude: number | null;
    longitude: number | null;
    radius: number; // in kilometers
  };
}

export const defaultFilterState: FilterState = {
  searchText: '',
  genderPreference: 'All',
  maxDistance: 50,
  minDistance: 0,
  terrain: [],
  pace: [],
  difficulty: [],
  dateRange: {
    start: null,
    end: null
  },
  sortBy: 'date',
  sortOrder: 'desc',
  clubId: null,
  minElevation: 0,
  maxElevation: 5000,
  maxParticipants: null,
  location: {
    latitude: null,
    longitude: null,
    radius: 25
  }
}; 