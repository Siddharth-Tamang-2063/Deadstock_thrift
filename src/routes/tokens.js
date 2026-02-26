// routes/tokens.js
// Legacy in-memory token store.
// For production use, prefer the DB-backed /api/save-fcm-token route (fcm.js).
import express from 'express';

const router = express.Router();

export const fcmTokens = [];

// ── POST /api/save-token ──────────────────────────────────────────────────────
router.post('/save-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token missing' });

  if (!fcmTokens.includes(token)) {
    fcmTokens.push(token);
    console.log('✅ In-memory FCM token saved. Total:', fcmTokens.length);
  }

  res.status(201).json({ success: true });
});

export default router;