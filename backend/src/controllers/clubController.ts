import { Request, Response } from 'express';
import Club, { IClub } from '../models/Club';
import User from '../models/User';

export const createClub = async (req: Request, res: Response) => {
  try {
    const { name, contactEmail, description } = req.body;
    const creatorId = req.user._id;

    const club = new Club({
      name,
      contactEmail,
      description,
      creatorId,
      members: [creatorId]
    });

    await club.save();
    res.status(201).json(club);
  } catch (error) {
    res.status(400).json({ message: error.message });
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