import express from 'express';
import { createClub, getClubs, joinClub, getUserClubs } from '../controllers/clubController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createClub);
router.get('/', authenticate, getClubs);
router.post('/:clubId/join', authenticate, joinClub);
router.get('/user', authenticate, getUserClubs);

export default router; 