// subscribe.js
import express from 'express';

const router = express.Router();

// In-memory store for web-push subscriptions.
// Exported so orders.js can read it directly (same process, same array reference).
export const subscriptions = [];

// ── POST /api/subscribe ───────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const subscription = req.body;

  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }

  if (!subscriptions.find((s) => s.endpoint === subscription.endpoint)) {
    subscriptions.push(subscription);
    console.log('✅ New web-push subscription added. Total:', subscriptions.length);
  }

  res.status(201).json({ success: true });
});

export default router;