import { Ride, User } from '../types/ride';

export const validateRide = (ride: Partial<Ride>): string[] => {
  const errors: string[] = [];

  if (!ride.title?.trim()) {
    errors.push('标题不能为空');
  }

  if (!ride.description?.trim()) {
    errors.push('描述不能为空');
  }

  if (!ride.startTime) {
    errors.push('开始时间不能为空');
  } else if (new Date(ride.startTime) < new Date()) {
    errors.push('开始时间不能早于当前时间');
  }

  if (!ride.route?.distance || ride.route.distance <= 0) {
    errors.push('距离必须大于0');
  }

  if (!ride.maxParticipants || ride.maxParticipants <= 0) {
    errors.push('最大参与人数必须大于0');
  }

  return errors;
};

export const validateUser = (user: Partial<User>): string[] => {
  const errors: string[] = [];

  if (!user.name?.trim()) {
    errors.push('用户名不能为空');
  }

  if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('邮箱格式不正确');
  }

  return errors;
};
