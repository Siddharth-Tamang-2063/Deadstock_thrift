
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express   from 'express';
import mongoose  from 'mongoose';
import cors      from 'cors';
import dotenv    from 'dotenv';
import rateLimit from 'express-rate-limit';

import ordersRoutes  from './routes/orders.js';
import tokenRoutes   from './routes/tokens.js';
import fcmRoutes     from './routes/fcm.js';
import contactRoutes from './routes/contact.js';
import adminRoutes   from './routes/admin.js';
dotenv.config();
console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD); // ← add this

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://deadstockthrift.com',
  'https://www.deadstockthrift.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use('/api/contact', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages sent. Please wait before trying again.' },
}));

app.use('/api/admin/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
}));

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/orders',  ordersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api',         tokenRoutes);
app.use('/api',         fcmRoutes);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));