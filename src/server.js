import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import webpush from 'web-push';

import ordersRoutes    from './routes/orders.js';
import tokenRoutes     from './routes/tokens.js';
import fcmRoutes       from './routes/fcm.js';
import contactRoutes   from './routes/contact.js';   // ← ADD THIS
import subscribeRouter from './subscribe.js';
import './firebase.js';

dotenv.config();
const app = express();

app.use(express.json());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors());

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
app.use('/api/contact',   contactRoutes);   // ← ADD THIS
app.use('/api',           tokenRoutes);
app.use('/api',           fcmRoutes);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));