// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    category:      { type: String, required: true },
    year:          String,
    condition:     String,
    tag:           String,
    price:         { type: Number, required: true },
    originalPrice: Number,
    img:           String,
    img2:          String,
    stock:         { type: Number, default: 0 },
    sizes:         [String],
    description:   String,
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);