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
router.get('/:clubId', auth, getClub);
router.put('/:clubId', auth, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]) as unknown as express.RequestHandler, multerErrorHandler, updateClub);
router.delete('/:clubId', auth, deleteClub);

// 成员管理
router.post('/:clubId/join-requests', auth, requestJoinClub);
router.post('/:clubId/join-requests/:requestId', auth, handleJoinRequest);
router.get('/:clubId/members', auth, getClubMembers);

// 管理员管理
router.post('/:clubId/admins/add', auth, addAdmin);
router.post('/:clubId/admins/remove', auth, removeAdmin);
router.get('/:clubId/admins', auth, getClubAdmins);

export default router; 