import express from 'express';
import { resetPasswordWeb, resetPasswordSuccess, resetPasswordError } from '../controllers/authController';

const router = express.Router();

// Web端密码重置路由
router.get('/reset-password', resetPasswordWeb);
router.get('/reset-success', resetPasswordSuccess);
router.get('/reset-error', resetPasswordError);

export default router; 