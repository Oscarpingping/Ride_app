import express from 'express';
import { auth } from '../middleware/auth';
import { validateClub } from '../middleware/validateClub';
import {
  createClub,
  getClubs,
  getClub,
  updateClub,
  deleteClub,
  requestJoinClub,
  handleJoinRequest,
  getClubMembers,
  addMember,
  removeMember,
  addAdmin,
  removeAdmin,
  getClubAdmins,
  upload,
  multerErrorHandler,
  getUserClubs
} from '../controllers/clubController';

const router = express.Router();

// 俱乐部基本操作
router.post('/', auth, validateClub, createClub);
router.get('/', auth, getClubs);
router.get('/user', auth, getUserClubs);
router.get('/:id', auth, getClub);
router.put('/:id', auth, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]) as unknown as express.RequestHandler, multerErrorHandler, updateClub);
router.delete('/:id', auth, deleteClub);

// 成员管理
router.post('/:id/join-requests', auth, requestJoinClub);
router.post('/:id/join-requests/:requestId', auth, handleJoinRequest);
router.get('/:id/members', auth, getClubMembers);
router.post('/:id/members/add', auth, addMember);
router.post('/:id/members/remove', auth, removeMember);

// 管理员管理
router.post('/:id/admins/add', auth, addAdmin);
router.post('/:id/admins/remove', auth, removeAdmin);
router.get('/:id/admins', auth, getClubAdmins);

export default router; 