import { Request, Response } from 'express';
import pool from '../config/db';

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM services ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  const { name, description, duration_minutes, price } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  if (!name || !duration_minutes || !price) {
    res.status(400).json({ message: 'Name, duration and price are required' });
    return;
  }
  try {
    const [result]: any = await pool.execute(
      'INSERT INTO services (name, description, duration_minutes, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, duration_minutes, price, image_url]
    );
    res.status(201).json({ message: 'Service created', id: result.insertId });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, duration_minutes, price } = req.body;
  try {
    await pool.execute(
      'UPDATE services SET name=?, description=?, duration_minutes=?, price=? WHERE id=?',
      [name, description || null, duration_minutes, price, id]
    );
    res.json({ message: 'Service updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.execute('DELETE FROM services WHERE id=?', [req.params.id]);
    res.json({ message: 'Service deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};