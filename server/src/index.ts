import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

// Swagger Docs
const swaggerDoc = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BookEase API Docs'
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Michael#12345',
  database: process.env.DB_NAME || 'appointment_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

const JWT_SECRET = 'appointment_super_secret_key_2026';

// Middleware
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: 'Invalid token' });
  }
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

// Upload
const upload = multer({ dest: 'uploads/' });

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register', async (req: any, res: any) => {
  const { name, email, phone, location, password } = req.body;
  if (!name || !email || !phone || !location || !password)
    return res.status(400).json({ message: 'All fields required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (name, email, phone, location, password) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, location, hashed]
    );
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'All fields required' });
  try {
    const [rows]: any = await pool.execute(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'User not found' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid password' });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== SERVICES ROUTES ====================
app.get('/api/services', async (req: any, res: any) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM services');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/services', verifyToken, requireAdmin, upload.single('image'), async (req: any, res: any) => {
  const { name, description, duration_minutes, price } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    await pool.execute(
      'INSERT INTO services (name, description, duration_minutes, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, duration_minutes, price, image_url]
    );
    res.status(201).json({ message: 'Service created' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/services/:id', verifyToken, requireAdmin, async (req: any, res: any) => {
  const { id } = req.params;
  const { name, description, duration_minutes, price } = req.body;
  try {
    await pool.execute(
      'UPDATE services SET name=?, description=?, duration_minutes=?, price=? WHERE id=?',
      [name, description, duration_minutes, price, id]
    );
    res.json({ message: 'Service updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/services/:id', verifyToken, requireAdmin, async (req: any, res: any) => {
  try {
    await pool.execute('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== APPOINTMENTS ROUTES ====================
app.post('/api/appointments', verifyToken, async (req: any, res: any) => {
  const { service_id, appointment_date, appointment_time, notes } = req.body;
  try {
    await pool.execute(
      'INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, service_id, appointment_date, appointment_time, notes]
    );
    res.status(201).json({ message: 'Appointment booked!' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Check booked slots for a specific date and service
app.get('/api/appointments/check', async (req: any, res: any) => {
  const { date, service_id } = req.query;
  if (!date || !service_id) {
    return res.status(400).json({ message: 'date and service_id required' });
  }
  try {
    const [rows] = await pool.execute(
      `SELECT appointment_time FROM appointments 
       WHERE appointment_date = ? 
       AND service_id = ? 
       AND status NOT IN ('cancelled')`,
      [date, service_id]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/appointments/my', verifyToken, async (req: any, res: any) => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  let query = `
    SELECT a.*, s.name as service_name, s.price
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.user_id = ?
  `;
  const params: any[] = [req.user.id];
  if (status) { query += ' AND a.status = ?'; params.push(status); }
  if (search) { query += ' AND s.name LIKE ?'; params.push(`%${search}%`); }
  query += ` LIMIT ${Number(limit)} OFFSET ${offset}`;
  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/appointments', verifyToken, requireAdmin, async (req: any, res: any) => {
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
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/appointments/:id/status', verifyToken, requireAdmin, async (req: any, res: any) => {
  const { status } = req.body;
  try {
    await pool.execute('UPDATE appointments SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/appointments/:id', verifyToken, async (req: any, res: any) => {
  try {
    await pool.execute('DELETE FROM appointments WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== USER ROUTES ====================
app.get('/api/users/profile', verifyToken, async (req: any, res: any) => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, phone, location, role, profile_image, created_at FROM users WHERE id=?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/users/profile', verifyToken, upload.single('profile_image'), async (req: any, res: any) => {
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
});

app.get('/api/users', verifyToken, requireAdmin, async (req: any, res: any) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, phone, location, role, created_at FROM users');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Root
app.get('/', (req: any, res: any) => {
  res.json({ message: 'Appointment Booking API is running' });
});

// Start
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.log('Run: netstat -ano | findstr :3000 then taskkill /PID <number> /F');
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});
