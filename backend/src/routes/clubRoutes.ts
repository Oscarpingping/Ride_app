import express from 'express';
import { createClub, getClubs, joinClub, getUserClubs } from '../controllers/clubController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/', auth, createClub);
router.get('/', auth, getClubs);
router.post('/:clubId/join', auth, joinClub);
router.get('/user', auth, getUserClubs);

export default router; 