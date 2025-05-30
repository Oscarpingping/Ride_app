import { TerrainType, PaceLevel, DifficultyLevel } from '../types/ride';

export const TERRAIN_OPTIONS: TerrainType[] = ['Road', 'Gravel', 'MTB', 'Urban', 'Mixed'];
export const PACE_OPTIONS: PaceLevel[] = ['Casual', 'Moderate', 'Fast'];
export const DIFFICULTY_OPTIONS: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export const DEFAULT_MAX_PARTICIPANTS = 10;
export const DEFAULT_RADIUS = 25; // 默认搜索半径（公里）

export const RIDE_STATUS_COLORS = {
  upcoming: '#4CAF50', // 绿色
  ongoing: '#2196F3',  // 蓝色
  completed: '#9E9E9E', // 灰色
  cancelled: '#F44336', // 红色
};

export const TERRAIN_ICONS = {
  Road: 'road',
  Gravel: 'terrain',
  MTB: 'bike',
  Urban: 'city',
  Mixed: 'layers',
};

export const PACE_ICONS = {
  Casual: 'walk',
  Moderate: 'run',
  Fast: 'run-fast',
};

export const DIFFICULTY_ICONS = {
  Beginner: 'star-outline',
  Intermediate: 'star-half',
  Advanced: 'star',
};
