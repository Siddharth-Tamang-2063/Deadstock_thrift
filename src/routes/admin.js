// routes/admin.js
import express from 'express';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import Contact from '../models/Contact.js';

const router = express.Router();

// ── Middleware: verify JWT ────────────────────────────────────────────────────
export function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorised' });
  }
  try {
    req.admin = jwt.verify(auth.slice(7), process.env.ADMIN_JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── POST /api/admin/login ─────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

// ── GET /api/admin/orders ─────────────────────────────────────────────────────
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/admin/orders/:id ───────────────────────────────────────────────
router.patch('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/messages ───────────────────────────────────────────────────
router.get('/messages', requireAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/admin/messages/:id/read ───────────────────────────────────────
router.patch('/messages/:id/read', requireAdmin, async (req, res) => {
  try {
    const msg = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [totalOrders, totalMessages, unreadMessages] = await Promise.all([
      Order.countDocuments(),
      Contact.countDocuments(),
      Contact.countDocuments({ read: false }),
    ]);
    res.json({ totalOrders, totalMessages, unreadMessages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;