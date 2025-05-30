import { TerrainType, PaceLevel, DifficultyLevel } from './common';

export interface FilterState {
  // 基本搜索
  searchText: string;
  
  // 活动类型过滤
  activityType: string[];
  
  // 距离和海拔
  distance: {
    min: number;
    max: number;
  };
  elevation: {
    min: number;
    max: number;
  };
  
  // 难度和速度
  terrain: TerrainType[];
  pace: PaceLevel[];
  difficulty: DifficultyLevel[];
  
  // 时间范围
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  
  // 排序
  sortBy: 'date' | 'distance' | 'rating' | 'participants';
  sortOrder: 'asc' | 'desc';
  
  // 位置
  location: {
    latitude: number | null;
    longitude: number | null;
    radius: number; // 搜索半径（公里）
  };
  
  // 其他过滤条件
  genderPreference: 'All' | 'Men' | 'Women' | 'Non-binary';
  maxParticipants: number | null;
  clubId: string | null;
}

export const defaultFilterState: FilterState = {
  searchText: '',
  activityType: [],
  distance: {
    min: 0,
    max: 50
  },
  elevation: {
    min: 0,
    max: 5000
  },
  terrain: [],
  pace: [],
  difficulty: [],
  dateRange: {
    start: null,
    end: null
  },
  sortBy: 'date',
  sortOrder: 'desc',
  location: {
    latitude: null,
    longitude: null,
    radius: 25
  },
  genderPreference: 'All',
  maxParticipants: null,
  clubId: null
}; 