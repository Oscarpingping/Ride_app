import { Request, Response } from 'express';
import { Club } from '../models/Club';
import { User } from '../models/User';
import { AuthRequest } from '../types/auth';

export const createClub = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { name, description, type, location, rules, tags, isPrivate } = req.body;
    const founderId = req.user._id;

    const club = new Club({
      name,
      description,
      type,
      founder: founderId,
      location,
      rules,
      tags,
      isPrivate,
      stats: {
        memberCount: 1,
        activityCount: 0
      }
    });

    await club.save();

    await User.findByIdAndUpdate(founderId, {
      $addToSet: {
        createdClubs: club._id,
        managedClubs: club._id
      }
    });

    return res.status(201).json({
      success: true,
      data: club
    });
  } catch (error: any) {
    console.error('创建俱乐部失败:', error);
    return res.status(500).json({
      success: false,
      error: '创建俱乐部失败'
    });
  }
};

export const getClubs = async (_req: Request, res: Response) => {
  try {
    const clubs = await Club.find()
      .populate('creatorId', 'name email')
      .populate('members', 'name email');
    return res.json(clubs);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const joinClub = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { clubId } = req.params;
    const userId = req.user._id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.members.includes(userId as any)) {
      return res.status(400).json({ message: 'Already a member of this club' });
    }

    club.members.push(userId as any);
    await club.save();

    return res.json(club);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserClubs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user._id;
    const clubs = await Club.find({
      $or: [
        { creatorId: userId },
        { members: userId }
      ]
    })
    .populate('creatorId', 'name email')
    .populate('members', 'name email');
    
    return res.json(clubs);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}; 