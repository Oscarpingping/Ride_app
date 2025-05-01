import { TerrainType, PaceLevel, DifficultyLevel } from '../../types/ride';

export interface FilterState {
  searchText: string;
  genderPreference: 'All' | 'Men' | 'Women' | 'Non-binary';
  maxDistance: number;
  terrain: TerrainType[];
  pace: PaceLevel[];
  difficulty: DifficultyLevel[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sortBy: 'date' | 'distance' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export const defaultFilterState: FilterState = {
  searchText: '',
  genderPreference: 'All',
  maxDistance: 50,
  terrain: [],
  pace: [],
  difficulty: [],
  dateRange: {
    start: null,
    end: null
  },
  sortBy: 'date',
  sortOrder: 'desc'
}; 