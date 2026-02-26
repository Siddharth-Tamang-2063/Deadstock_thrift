// routes/database.js
// Single-product lookup route with ObjectId validation.
// NOTE: This route is already covered by routes/products.js GET /:id
// You can either mount this separately or remove it in favour of products.js.
// If you keep it, make sure NOT to mount both for the same path in server.js.
import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const router = express.Router();

// ── GET /api/products/:id (with strict ObjectId validation) ───────────────────
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;