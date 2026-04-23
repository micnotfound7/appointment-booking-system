import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { service_id, appointment_date, appointment_time, notes } = req.body;
  const user_id = req.user.id;
  try {
    await pool.execute(
      'INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?)',
      [user_id, service_id, appointment_date, appointment_time, notes]
    );
    res.status(201).json({ message: 'Appointment booked!' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  const user_id = req.user.id;
  const { status, search, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = `
    SELECT a.*, s.name as service_name, s.price
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.user_id = ?
  `;
  const params: any[] = [user_id];

  if (status) { query += ' AND a.status = ?'; params.push(status); }
  if (search) { query += ' AND s.name LIKE ?'; params.push(`%${search}%`); }
  query += ` LIMIT ${Number(limit)} OFFSET ${offset}`;

  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = `
    SELECT a.*, s.name as service_name, u.name as user_name, u.email
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status) { query += ' AND a.status = ?'; params.push(status); }
  if (search) { query += ' AND (u.name LIKE ? OR s.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ` LIMIT ${Number(limit)} OFFSET ${offset}`;

  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: 'Appointment deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};