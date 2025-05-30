import { format as dateFnsFormat } from 'date-fns';
import { Ride, PaceLevel } from '../types/ride';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, 'yyyy-MM-dd HH:mm');
};

export const formatDistance = (distance: number): string => {
  return `${distance.toFixed(1)} km`;
};

export const formatElevation = (elevation: number): string => {
  return `${elevation} m`;
};

export const formatPace = (pace: PaceLevel): string => {
  switch (pace) {
    case 'Casual':
      return '休闲';
    case 'Moderate':
      return '中等';
    case 'Fast':
      return '快速';
    default:
      return pace;
  }
};

export const formatRideStatus = (status: Ride['status']): string => {
  switch (status) {
    case 'upcoming':
      return '即将开始';
    case 'ongoing':
      return '进行中';
    case 'completed':
      return '已完成';
    case 'cancelled':
      return '已取消';
    default:
      return status;
  }
};
