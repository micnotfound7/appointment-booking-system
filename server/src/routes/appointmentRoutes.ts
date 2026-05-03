import express from 'express';
import {
  createAppointment, getMyAppointments, getAllAppointments,
  updateAppointmentStatus, deleteAppointment, checkSlots
} from '../controllers/appointmentController';
import { verifyToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = express.Router();
router.get('/check', checkSlots);
router.get('/my', verifyToken, getMyAppointments);
router.get('/', verifyToken, requireAdmin, getAllAppointments);
router.post('/', verifyToken, createAppointment);
router.patch('/:id/status', verifyToken, requireAdmin, updateAppointmentStatus);
router.delete('/:id', verifyToken, deleteAppointment);
export default router;