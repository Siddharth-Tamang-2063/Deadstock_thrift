import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import webpush from 'web-push';

import ordersRoutes from './routes/orders.js';
import tokenRoutes from './routes/tokens.js';
import fcmRoutes from './routes/fcm.js';       // ✅ was missing
import subscribeRouter from './subscribe.js';
import './firebase.js';                         // ✅ initialise Firebase Admin SDK on startup

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

// ── MongoDB ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/deadstock')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ── Web-Push VAPID (set ONCE here — removed duplicate in orders.js) ──────────
webpush.setVapidDetails(
  'mailto:siddharth20630901@gmail.com',
  process.env.VAPID_PUBLIC_KEY  || 'BLZnZxOUqsvxn-pWQdyI0KVIZml6MhTI5pUGwT9tcOMUFvF_TqZSnjslVRHufL-hw1JJExQ_anFFqyXYdLNyxVI',
  process.env.VAPID_PRIVATE_KEY || '2IF4Rm2pjkOAhEDq8Xv4htupHSXBV1H6cII_WARBw0Y'
);
console.log('✅ VAPID keys loaded');

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/subscribe', subscribeRouter);   // POST  /api/subscribe
app.use('/api/orders',    ordersRoutes);      // POST  /api/orders
app.use('/api',           tokenRoutes);       // POST  /api/save-token  (legacy in-memory)
app.use('/api',           fcmRoutes);         // POST  /api/save-fcm-token  ✅

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));