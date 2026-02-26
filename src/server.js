import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import webpush from 'web-push';

import ordersRoutes from './routes/orders.js';
import tokenRoutes from './routes/tokens.js';
import fcmRoutes from './routes/fcm.js';
import subscribeRouter from './subscribe.js';
import './firebase.js';

dotenv.config();
const app = express();

app.use(express.json());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://192.168.1.82:5173',
  'http://192.168.1.82:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/deadstock')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ── Web-Push VAPID ────────────────────────────────────────────────────────────
webpush.setVapidDetails(
  'mailto:siddharth20630901@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
console.log('✅ VAPID keys loaded');

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/subscribe', subscribeRouter);
app.use('/api/orders',    ordersRoutes);
app.use('/api',           tokenRoutes);
app.use('/api',           fcmRoutes);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));