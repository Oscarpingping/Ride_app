import { Request, Response } from 'express';
import { Ride } from '../models/Ride';
// import { User } from '../models/User';
import { ApiResponse } from '../../../shared/api/types';
import { AuthRequest } from '../types/auth';

export const createRide = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '请先登录',
      } as ApiResponse);
    }

    console.log('Creating ride with data:', req.body);

    const {
      title,
      description,
      dateTime,
      meetingPoint,
      terrain,
      difficulty,
      pace,
      maxParticipants,
    } = req.body;

    // 验证必需字段
    if (!title || !description || !dateTime || !meetingPoint || !difficulty) {
      return res.status(400).json({
        success: false,
        error: '缺少必需字段',
      } as ApiResponse);
    }

    // 转换前端数据格式到后端格式
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // 默认3小时后结束

    // 转换meetingPoint格式
    const backendMeetingPoint = {
      latitude: meetingPoint.coordinates?.lat || 0,
      longitude: meetingPoint.coordinates?.lng || 0,
      address: meetingPoint.address || '',
    };

    // 转换difficulty格式
    const difficultyMap: { [key: string]: string } = {
      'Beginner': 'easy',
      'Intermediate': 'medium',
      'Advanced': 'hard',
    };
    const backendDifficulty = difficultyMap[difficulty] || 'easy';

    // 转换terrain到route格式
    const terrainMap: { [key: string]: string } = {
      'Urban': 'road',
      'Mountain': 'mountain',
      'Gravel': 'gravel',
    };
    const routeType = terrainMap[terrain] || 'road';

    // 转换pace格式（取平均值）
    const backendPace = pace?.min && pace?.max ? (pace.min + pace.max) / 2 : 20;

    const ride = new Ride({
      title,
      description,
      startTime,
      endTime,
      meetingPoint: backendMeetingPoint,
      route: {
        type: routeType,
        distance: 20, // 默认距离
        elevation: 100, // 默认爬升
      },
      difficulty: backendDifficulty,
      pace: backendPace,
      maxParticipants: maxParticipants || 10,
      isPrivate: false, // 默认公开
      organizer: req.user._id,
      participants: [req.user._id],
      currentParticipants: 1,
    });

    await ride.save();

    console.log('Ride created successfully:', ride._id);

    return res.status(201).json({
      success: true,
      data: ride,
    } as ApiResponse);
  } catch (error) {
    console.error('Error creating ride:', error);
    return res.status(500).json({
      success: false,
      error: '创建活动失败，请稍后重试',
    } as ApiResponse);
  }
};

export const getRides = async (_req: Request, res: Response) => {
  try {
    const rides = await Ride.find({ isPrivate: false })
      .populate('organizer', 'name avatar')
      .populate('participants', 'name avatar')
      .sort({ startTime: 1 });

    return res.json({
      success: true,
      data: rides,
    } as ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '获取活动列表失败，请稍后重试',
    } as ApiResponse);
  }
};

export const getRide = async (req: AuthRequest, res: Response) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('organizer', 'name avatar')
      .populate('participants', 'name avatar');

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: '活动不存在',
      } as ApiResponse);
    }

    // 检查权限
    if (ride.isPrivate && req.user && !ride.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: '无权访问此活动',
      } as ApiResponse);
    }

    return res.json({
      success: true,
      data: ride,
    } as ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '获取活动详情失败，请稍后重试',
    } as ApiResponse);
  }
};

export const updateRide = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '请先登录',
      } as ApiResponse);
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: '活动不存在',
      } as ApiResponse);
    }

    // 检查权限
    if (ride.organizer.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        error: '无权修改此活动',
      } as ApiResponse);
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate('organizer', 'name avatar')
      .populate('participants', 'name avatar');

    return res.json({
      success: true,
      data: updatedRide,
    } as ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '更新活动失败，请稍后重试',
    } as ApiResponse);
  }
};

export const deleteRide = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '请先登录',
      } as ApiResponse);
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: '活动不存在',
      } as ApiResponse);
    }

    // 检查权限
    if (ride.organizer.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        error: '无权删除此活动',
      } as ApiResponse);
    }

    await ride.deleteOne();

    return res.json({
      success: true,
      data: null,
    } as ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '删除活动失败，请稍后重试',
    } as ApiResponse);
  }
};

export const joinRide = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '请先登录',
      } as ApiResponse);
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: '活动不存在',
      } as ApiResponse);
    }

    // 检查是否已参加
    if (ride.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: '您已参加此活动',
      } as ApiResponse);
    }

    // 检查人数限制
    if (ride.currentParticipants >= ride.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: '活动人数已满',
      } as ApiResponse);
    }

    ride.participants.push(req.user._id);
    ride.currentParticipants += 1;
    await ride.save();

    return res.json({
      success: true,
      data: ride,
    } as ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '参加活动失败，请稍后重试',
    } as ApiResponse);
  }
};

export const leaveRide = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '请先登录',
      } as ApiResponse);
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: '活动不存在',
      } as ApiResponse);
    }

    // 检查是否是组织者
    if (ride.organizer.toString() === req.user._id) {
      return res.status(400).json({
        success: false,
        error: '组织者不能退出活动',
      } as ApiResponse);
    }

    // 检查是否已参加
    if (!ride.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: '您未参加此活动',
      } as ApiResponse);
    }

    // 保存用户ID到变量中，避免重复访问可能为undefined的req.user
    const userId = req.user._id;
    ride.participants = ride.participants.filter(
      (id) => id.toString() !== userId
    );
    ride.currentParticipants -= 1;
    await ride.save();

    return res.json({
      success: true,
      data: ride,
    } as ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '退出活动失败，请稍后重试',
    } as ApiResponse);
  }
};

// 导出控制器对象
export const rideController = {
  getAllRides: getRides,
  createRide,
  getRide,
  updateRide,
  deleteRide,
  joinRide,
  leaveRide,
}; 