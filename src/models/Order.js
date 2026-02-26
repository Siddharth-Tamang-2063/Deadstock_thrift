// models/Order.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:      String,
  category:  String,
  condition: String,
  img:       String,
  price:     Number,
  size:      String,
  qty:       { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    orderId:         { type: String, required: true, unique: true },
    name:            { type: String, required: true },
    email:           { type: String, required: true },
    phone:           String,
    deliveryAddress: String,
    city:            String,
    street:          String,
    paymentMethod:   { type: String, default: 'cod' },
    message:         String,
    total:           Number,
    status:          { type: String, default: 'pending' },
    items:           [orderItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);