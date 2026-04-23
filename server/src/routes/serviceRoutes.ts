import express from 'express';
import {
  getAllServices, createService,
  updateService, deleteService
} from '../controllers/serviceController';
import { verifyToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';
import { upload } from '../utils/upload';

const router = express.Router();

router.get('/', getAllServices);
router.post('/', verifyToken, requireAdmin, upload.single('image'), createService);
router.put('/:id', verifyToken, requireAdmin, updateService);
router.delete('/:id', verifyToken, requireAdmin, deleteService);

export default router;