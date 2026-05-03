import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, phone, location, role, profile_image, created_at FROM users WHERE id=?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, location } = req.body;
  const profile_image = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    if (profile_image) {
      await pool.execute(
        'UPDATE users SET name=?, phone=?, location=?, profile_image=? WHERE id=?',
        [name, phone || null, location || null, profile_image, req.user.id]
      );
    } else {
      await pool.execute(
        'UPDATE users SET name=?, phone=?, location=? WHERE id=?',
        [name, phone || null, location || null, req.user.id]
      );
    }
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, phone, location, role, profile_image, created_at FROM users WHERE id=?',
      [req.user.id]
    );
    res.json({ message: 'Profile updated', ...rows[0] });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, location, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};