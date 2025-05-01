export interface RideFilters {
  gender?: 'All' | 'Women Only' | 'Men Only' | 'Non-binary Only';
  ageRange?: {
    min: number;
    max: number;
  };
  distance?: {
    min: number;
    max: number;
  };
  terrain?: TerrainType[];
  pace?: PaceLevel[];
  clubId?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  startDate?: Date;
  endDate?: Date;
  difficulty?: DifficultyLevel[];
}

export interface SortOption {
  field: 'date' | 'distance' | 'rating' | 'participants';
  order: 'asc' | 'desc';
}

import { TerrainType, PaceLevel, DifficultyLevel } from './ride';

export interface FilterState extends RideFilters {
  sort: SortOption;
  searchQuery: string;
} 