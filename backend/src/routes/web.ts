import express from 'express';
import { resetPasswordWeb } from '../controllers/authController';
import { SYSTEM_CONFIG } from '../config/system';

const router = express.Router();

// Web端密码重置路由
router.get(SYSTEM_CONFIG.PASSWORD_RESET.SERVICE.BASE_PATH + '/password', resetPasswordWeb);

export default router; 