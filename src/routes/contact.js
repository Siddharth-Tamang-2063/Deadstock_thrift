// routes/contact.js
import express from 'express';
import Contact from '../models/Contact.js';

const router = express.Router();

// ── POST /api/contact ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    res.status(201).json({
      success: true,
      message: "Message received. We'll be in touch within 24-48 hours.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/contact ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;