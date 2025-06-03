import { TerrainType, PaceLevel, DifficultyLevel } from '../../shared/types/ride';

export interface FilterState {
  terrain: TerrainType[];
  pace: PaceLevel[];
  difficulty: DifficultyLevel[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  genderPreference: 'All' | 'Men' | 'Women' | 'Non-binary';
  minDistance: number;
  maxDistance: number;
  minElevation: number;
  maxElevation: number;
  maxParticipants: number | null;
  sortBy: 'date' | 'distance' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export const defaultFilterState: FilterState = {
  terrain: [],
  pace: [],
  difficulty: [],
  dateRange: {
    start: null,
    end: null
  },
  location: {
    latitude: 0,
    longitude: 0,
    radius: 25
  },
  genderPreference: 'All',
  minDistance: 0,
  maxDistance: 100,
  minElevation: 0,
  maxElevation: 1000,
  maxParticipants: null,
  sortBy: 'date',
  sortOrder: 'asc'
}; 