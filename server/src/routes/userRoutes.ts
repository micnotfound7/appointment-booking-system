import express from 'express';
import { getProfile, updateProfile, getAllUsers } from '../controllers/userController';
import { verifyToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';
import { upload } from '../utils/upload';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('profile_image'), updateProfile);
router.get('/', verifyToken, requireAdmin, getAllUsers);

export default router;