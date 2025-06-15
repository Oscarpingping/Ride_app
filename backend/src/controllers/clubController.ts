import { Request, Response, NextFunction } from 'express';
import { Club } from '../models/Club';
import { ChatRoom } from '../models/ChatRoom';
//import { IUser } from '../models/User';
import { uploadImage } from '../services/uploadService';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiResponse } from '../../../shared/api/types';

// 配置multer内存存储
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and GIF images are allowed'));
    }
  }
});

// 文件上传错误处理中间件
export const multerErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 2MB limit'
      } as ApiResponse);
    }
    return res.status(400).json({
      success: false,
      error: err.message
    } as ApiResponse);
  }
  
  if (err.message === 'Only JPEG, PNG and GIF images are allowed') {
    return res.status(400).json({
      success: false,
      error: err.message
    } as ApiResponse);
  }
  
  next(err);
};

// 扩展IClub接口，添加populated字段的类型
//interface PopulatedClub extends Omit<IClub, 'founder' | 'members' | 'admins' | 'chatRoom'> {
//  founder: IUser;
//  members: IUser[];
//  admins: IUser[];
//  chatRoom: IChatRoom;
//}

// 统一的错误处理函数
const handleError = (error: any, res: Response, operation: string): Response => {
  console.error(`[${new Date().toISOString()}] ${operation} failed:`, {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  });

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }

  return res.status(500).json({
    success: false,
    error: `${operation} failed, please try again later`
  } as ApiResponse);
};

// 创建俱乐部
export const createClub = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      name,
      description,
      type,
      location,
      isPrivate,
      tags,
      rules,
      contactEmail
    } = req.body;

    // 验证必填字段
    if (!name || !type || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse);
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      } as ApiResponse);
    }

    // 生成 clubId
    const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8);
    const clubId = `${baseName}-${randomStr}`;

    // 创建俱乐部
    const club = new Club({
      clubId,
      name,
      description,
      type,
      location,
      isPrivate,
      tags,
      rules,
      contactEmail,
      founder: userId,
      admins: [userId],
      members: [userId],
      stats: {
        memberCount: 1,
        activityCount: 0
      }
    });

    // 创建聊天室
    const chatRoom = new ChatRoom({
      name: `${name} Chat`,
      type: 'club',
      club: club._id,
      members: [userId]
    });

    // 保存聊天室
    await chatRoom.save();

    // 更新俱乐部的聊天室引用
    club.chatRoom = chatRoom._id;

    // 保存俱乐部
    await club.save();

    return res.status(201).json({
      success: true,
      data: club
    } as ApiResponse);
  } catch (error: any) {
    return handleError(error, res, 'Create club');
  }
};

// 获取俱乐部列表
export const getClubs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { type, city, search } = req.query;
    const query: any = { isPrivate: false };
    
    if (type) query.type = type;
    if (city) query['location.city'] = city;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { clubId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const clubs = await Club.find(query)
      .populate('founder', 'name avatar')
      .select('clubId name description type logo coverImage location stats tags')
      .limit(20);
    
    return res.json({
      success: true,
      data: clubs
    } as ApiResponse);
  } catch (error: any) {
    return handleError(error, res, 'Get clubs');
  }
};

// 获取俱乐部详情
export const getClub = async (req: Request, res: Response): Promise<Response> => {
  try {
    const club = await Club.findOne({ clubId: req.params.clubId })
      .populate('founder', 'name avatar')
      .populate('members', 'name avatar')
      .populate('admins', 'name avatar')
      .populate('chatRoom');
    
    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      } as ApiResponse);
    }

    return res.json({
      success: true,
      data: club
    } as ApiResponse);
  } catch (error: any) {
    return handleError(error, res, 'Get club');
  }
};

export const addAdmin = async (req: Request, res: Response): Promise<Response> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const club = await Club.findOne({ clubId: req.params.clubId });
    
    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      } as ApiResponse);
    }
    
    if (club.founder.toString() !== req.user?.userId) {
      return res.status(403).json({
        success: false,
        error: 'Only founder can add admins'
      } as ApiResponse);
    }
    
    const { userId } = req.body;
    if (!club.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'User must be a member first'
      } as ApiResponse);
    }
    
    if (club.admins.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'User is already an admin'
      } as ApiResponse);
    }
    
    club.admins.push(userId);
    await club.save({ session });
    
    await session.commitTransaction();
    return res.json({
      success: true,
      data: club
    } as ApiResponse);
  } catch (error: any) {
    await session.abortTransaction();
    return handleError(error, res, 'Add admin');
  } finally {
    session.endSession();
  }
};

export const requestJoinClub = async (req: Request, res: Response): Promise<Response> => {
  try {
    const club = await Club.findOne({ clubId: req.params.clubId });
    
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    
    if (club.members.includes(req.user.userId)) {
      return res.status(400).json({ success: false, error: 'Already a member' });
    }
    
    const { message } = req.body;
    
    club.joinRequests.pending.push({
      user: req.user.userId,
      message,
      createdAt: new Date()
    });
    
    await club.save();
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(400).json({ success: false, error: e.message });
  }
};

export const handleJoinRequest = async (req: Request, res: Response): Promise<Response> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { clubId, requestId } = req.params;
    const { status, response } = req.body;
    const adminId = req.user?.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      } as ApiResponse);
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      } as ApiResponse);
    }

    // 初始化 joinRequests 如果不存在
    if (!club.joinRequests) {
      club.joinRequests = {
        pending: [],
        history: []
      };
    }

    const request = club.joinRequests.pending.find(r => r.user.toString() === requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Join request not found'
      } as ApiResponse);
    }

    // 更新请求状态
    club.joinRequests.pending = club.joinRequests.pending.filter(r => r.user.toString() !== requestId);
    club.joinRequests.history.push({
      user: request.user,
      status,
      message: request.message,
      response,
      handledBy: adminId,
      createdAt: request.createdAt,
      handledAt: new Date()
    });

    if (status === 'approved') {
      club.members.push(request.user);
      club.stats.memberCount = (club.stats.memberCount || 0) + 1;
    }

    await club.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      data: club
    } as ApiResponse);
  } catch (error: any) {
    await session.abortTransaction();
    return handleError(error, res, 'Handle join request');
  } finally {
    session.endSession();
  }
};

export const getJoinRequests = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { clubId } = req.params;
    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      } as ApiResponse);
    }

    // 初始化 joinRequests 如果不存在
    if (!club.joinRequests) {
      club.joinRequests = {
        pending: [],
        history: []
      };
    }

    return res.json({
      success: true,
      data: club.joinRequests
    } as ApiResponse);
  } catch (error: any) {
    return handleError(error, res, 'Get join requests');
  }
};

export const updateClub = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { clubId } = req.params;
    const {
      name,
      description,
      type,
      location,
      isPrivate,
      tags,
      rules,
      contactEmail
    } = req.body;

    const club = await Club.findOne({ clubId });
    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      } as ApiResponse);
    }

    // 检查权限
    if (club.founder.toString() !== req.user?.userId && !club.admins.includes(req.user?.userId)) {
      return res.status(403).json({
        success: false,
        error: 'Only founder and admins can update club'
      } as ApiResponse);
    }

    // 处理图片上传
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files) {
      if (files.logo?.[0]) {
        const logoPath = await uploadImage(files.logo[0], clubId);
        club.logo = logoPath;
      }
      if (files.coverImage?.[0]) {
        const coverPath = await uploadImage(files.coverImage[0], clubId);
        club.coverImage = coverPath;
      }
    }

    // 更新俱乐部信息
    if (name) club.name = name;
    if (description !== undefined) club.description = description;
    if (type) club.type = type;
    if (location) club.location = location;
    if (isPrivate !== undefined) club.isPrivate = isPrivate;
    if (tags) club.tags = tags;
    if (rules) club.rules = rules;
    if (contactEmail) club.contactEmail = contactEmail;

    await club.save();

    return res.json({
      success: true,
      data: club
    } as ApiResponse);
  } catch (error: any) {
    return handleError(error, res, 'Update club');
  }
};

// 删除俱乐部
export const deleteClub = async (req: Request, res: Response): Promise<Response> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({ 
        message: 'Club not found' 
      });
    }

    // 检查权限
    if (club.founder.toString() !== req.user?.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to delete club' 
      });
    }

    // 删除相关图片文件
    if (club.logo) {
      const logoPath = path.join(__dirname, '../../', club.logo.substring(1));
      try {
        await fs.promises.unlink(logoPath);
      } catch (error) {
        console.error('Error deleting logo file:', error);
      }
    }

    if (club.coverImage) {
      const coverPath = path.join(__dirname, '../../', club.coverImage.substring(1));
      try {
        await fs.promises.unlink(coverPath);
      } catch (error) {
        console.error('Error deleting cover image file:', error);
      }
    }

    // 删除聊天室
    if (club.chatRoom) {
      await ChatRoom.findByIdAndDelete(club.chatRoom, { session });
    }

    await Club.findByIdAndDelete(req.params.clubId, { session });
    await session.commitTransaction();
    return res.json({
      success: true,
      message: 'Club deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    await session.abortTransaction();
    return handleError(error, res, 'Delete club');
  } finally {
    session.endSession();
  }
};

// 获取俱乐部成员
export const getClubMembers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const club = await Club.findById(req.params.clubId)
      .populate('members', '_id name_sid avatar');

    if (!club) {
      return res.status(404).json({ 
        message: 'Club not found' 
      });
    }

    const members = club.members.map(member => {
      const populatedMember = member as any;
      return {
        userId: populatedMember._id,
        name_sid: populatedMember.name_sid,
        avatar: populatedMember.avatar
      };
    });

    return res.json({
      success: true,
      data: members
    } as ApiResponse);
  } catch (error: any) {
    return handleError(error, res, 'Get club members');
  }
};

// 移除管理员
export const removeAdmin = async (req: Request, res: Response): Promise<Response> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const club = await Club.findOne({ clubId: req.params.clubId });
    
    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      } as ApiResponse);
    }
    
    if (club.founder.toString() !== req.user?.userId) {
      return res.status(403).json({
        success: false,
        error: 'Only founder can remove admins'
      } as ApiResponse);
    }
    
    const { userId } = req.body;
    if (!club.admins.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'User is not an admin'
      } as ApiResponse);
    }
    
    club.admins = club.admins.filter(id => id.toString() !== userId);
    await club.save({ session });
    
    await session.commitTransaction();
    return res.json({
      success: true,
      data: club
    } as ApiResponse);
  } catch (error: any) {
    await session.abortTransaction();
    return handleError(error, res, 'Remove admin');
  } finally {
    session.endSession();
  }
};

// 获取俱乐部管理员
export const getClubAdmins = async (req: Request, res: Response): Promise<Response> => {
  try {
    const club = await Club.findOne({ clubId: req.params.clubId })
      .populate('admins', '_id name_sid avatar');

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      } as ApiResponse);
    }

    const admins = club.admins.map(admin => {
      const populatedAdmin = admin as any;
      return {
        userId: populatedAdmin._id,
        name_sid: populatedAdmin.name_sid,
        avatar: populatedAdmin.avatar
      };
    });

    return res.json({
      success: true,
      data: admins
    } as ApiResponse);
  } catch (error: any) {
    return handleError(error, res, 'Get club admins');
  }
};

// 获取用户已加入的俱乐部
export const getUserClubs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      } as ApiResponse);
    }

    const clubs = await Club.find({
      $or: [
        { members: userId },
        { admins: userId },
        { founder: userId }
      ]
    })
    .populate('founder', '_id name_sid avatar')
    .populate('admins', '_id name_sid avatar')
    .populate('members', '_id name_sid avatar')
    .select('clubId name description type logo coverImage location stats tags isPrivate');

    const formattedClubs = clubs.map(club => {
      const populatedClub = club.toObject();
      return {
        ...populatedClub,
        founder: {
          userId: (populatedClub.founder as any)._id,
          name_sid: (populatedClub.founder as any).name_sid,
          avatar: (populatedClub.founder as any).avatar
        },
        admins: (populatedClub.admins as any[]).map(admin => ({
          userId: admin._id,
          name_sid: admin.name_sid,
          avatar: admin.avatar
        })),
        members: (populatedClub.members as any[]).map(member => ({
          userId: member._id,
          name_sid: member.name_sid,
          avatar: member.avatar
        }))
      };
    });

    return res.json({
      success: true,
      data: formattedClubs
    } as ApiResponse);
  } catch (error: any) {
    return handleError(error, res, 'Get user clubs');
  }
}; 