import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import webpush from 'web-push';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import ordersRoutes    from './routes/orders.js';
import tokenRoutes     from './routes/tokens.js';
import fcmRoutes       from './routes/fcm.js';
import contactRoutes   from './routes/contact.js';
import subscribeRouter from './subscribe.js';
import './firebase.js';

dotenv.config();
const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS — only allow your frontend ──────────────────────────────────────────
const allowedOrigins = [
  'https://deadstockthrift.com',
  'https://www.deadstockthrift.com',
  // add your Vercel/Netlify preview URL here if needed
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // block oversized payloads

// ── NoSQL Injection Sanitizer ─────────────────────────────────────────────────
app.use(mongoSanitize());

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// General: 100 requests per 15 min per IP
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Contact form: max 5 submissions per hour per IP
app.use('/api/contact', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages sent. Please wait before trying again.' },
}));

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)           // no localhost fallback in production
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
app.use('/api/contact',   contactRoutes);
app.use('/api',           tokenRoutes);
app.use('/api',           fcmRoutes);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));