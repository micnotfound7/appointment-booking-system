import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { service_id, appointment_date, appointment_time, notes } = req.body;
  const user_id = req.user.id;
  if (!service_id || !appointment_date || !appointment_time) {
    res.status(400).json({ message: 'Service, date and time are required' });
    return;
  }
  try {
    await pool.execute(
      'INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?)',
      [user_id, service_id, appointment_date, appointment_time, notes || null]
    );
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  const user_id = req.user.id;
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, s.name as service_name, s.price, s.duration_minutes
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, s.name as service_name, s.price,
              u.name as user_name, u.email
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.execute(
      'UPDATE appointments SET status=? WHERE id=?',
      [status, id]
    );
    res.json({ message: 'Status updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.execute('DELETE FROM appointments WHERE id=?', [req.params.id]);
    res.json({ message: 'Appointment deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const checkSlots = async (req: Request, res: Response): Promise<void> => {
  const { date, service_id } = req.query;
  if (!date || !service_id) {
    res.status(400).json({ message: 'Date and service_id required' });
    return;
  }
  try {
    const [rows] = await pool.execute(
      `SELECT appointment_time FROM appointments
       WHERE appointment_date = ? AND service_id = ?
       AND status != 'cancelled'`,
      [date, service_id]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [total]: any = await pool.execute('SELECT COUNT(*) as count FROM appointments');
    const [pending]: any = await pool.execute("SELECT COUNT(*) as count FROM appointments WHERE status='pending'");
    const [confirmed]: any = await pool.execute("SELECT COUNT(*) as count FROM appointments WHERE status='confirmed'");
    const [completed]: any = await pool.execute("SELECT COUNT(*) as count FROM appointments WHERE status='completed'");
    const [cancelled]: any = await pool.execute("SELECT COUNT(*) as count FROM appointments WHERE status='cancelled'");
    const [users]: any = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [services]: any = await pool.execute('SELECT COUNT(*) as count FROM services');
    const [recent] = await pool.execute(
      `SELECT a.*, s.name as service_name, u.name as user_name, u.email
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC LIMIT 5`
    );
    res.json({
      total: total[0].count,
      pending: pending[0].count,
      confirmed: confirmed[0].count,
      completed: completed[0].count,
      cancelled: cancelled[0].count,
      users: users[0].count,
      services: services[0].count,
      recentAppointments: recent
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};