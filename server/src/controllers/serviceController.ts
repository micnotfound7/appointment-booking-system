import { Request, Response } from 'express';
import pool from '../config/db';

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Fetching services...');
    const [rows] = await pool.query('SELECT * FROM services');
    console.log('✅ Services:', rows);
    res.json(rows);
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  const { name, description, duration_minutes, price } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    await pool.query(
      'INSERT INTO services (name, description, duration_minutes, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, duration_minutes, price, image_url]
    );
    res.status(201).json({ message: 'Service created' });
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, duration_minutes, price } = req.body;
  try {
    await pool.query(
      'UPDATE services SET name=?, description=?, duration_minutes=?, price=? WHERE id=?',
      [name, description, duration_minutes, price, id]
    );
    res.json({ message: 'Service updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM services WHERE id = ?', [id]);
    res.json({ message: 'Service deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};