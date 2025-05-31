import { Request, Response } from 'express';
import { Club } from '../models/Club';
import { User } from '../models/User';

export const createClub = async (req: Request, res: Response) => {
  try {
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

    res.status(201).json({
      success: true,
      data: club
    });
  } catch (error) {
    console.error('创建俱乐部失败:', error);
    res.status(500).json({
      success: false,
      error: '创建俱乐部失败'
    });
  }
};

export const getClubs = async (req: Request, res: Response) => {
  try {
    const clubs = await Club.find()
      .populate('creatorId', 'name email')
      .populate('members', 'name email');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinClub = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params;
    const userId = req.user._id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.members.includes(userId)) {
      return res.status(400).json({ message: 'Already a member of this club' });
    }

    club.members.push(userId);
    await club.save();

    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserClubs = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const clubs = await Club.find({
      $or: [
        { creatorId: userId },
        { members: userId }
      ]
    })
    .populate('creatorId', 'name email')
    .populate('members', 'name email');
    
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 