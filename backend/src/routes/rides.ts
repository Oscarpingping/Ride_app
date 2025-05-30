import express from 'express';
import { auth } from '../middleware/auth';
import {
  createRide,
  getRides,
  getRide,
  updateRide,
  deleteRide,
  joinRide,
  leaveRide,
} from '../controllers/rideController';

const router = express.Router();

// 公开路由
router.get('/', getRides);
router.get('/:id', getRide);

// 需要认证的路由
router.use(auth);
router.post('/', createRide);
router.put('/:id', updateRide);
router.delete('/:id', deleteRide);
router.post('/:id/join', joinRide);
router.post('/:id/leave', leaveRide);

export default router; 