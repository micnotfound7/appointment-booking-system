import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role, profile_image, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  const profile_image = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    if (profile_image) {
      await pool.execute(
        'UPDATE users SET name=?, profile_image=? WHERE id=?',
        [name, profile_image, req.user.id]
      );
    } else {
      await pool.execute(
        'UPDATE users SET name=? WHERE id=?',
        [name, req.user.id]
      );
    }
    res.json({ message: 'Profile updated' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};