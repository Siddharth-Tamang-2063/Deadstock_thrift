// routes/fcm.js
import express from 'express';
import FcmToken from '../models/FcmToken.js';

const router = express.Router();

// ── POST /api/save-fcm-token ─────────────────────────────────────────────────
router.post('/save-fcm-token', async (req, res) => {
  try {
    const { token, adminSecret } = req.body;
    if (!token) return res.status(400).json({ error: 'Token missing' });

    // ✅ Only mark as admin if the secret matches
    const isAdmin = adminSecret === (process.env.ADMIN_SECRET || 'deadstock2024');

    await FcmToken.findOneAndUpdate(
      { token },
      { token, isAdmin },
      { upsert: true, returnDocument: 'after' }
    );

    console.log(`✅ FCM token saved — isAdmin: ${isAdmin}`);
    res.status(201).json({ success: true, isAdmin });
  } catch (err) {
    console.error('Save FCM token error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/save-fcm-token ───────────────────────────────────────────────
router.delete('/save-fcm-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token missing' });
    await FcmToken.deleteOne({ token });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;