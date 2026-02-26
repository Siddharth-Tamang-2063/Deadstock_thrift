// models/FcmToken.js
import mongoose from 'mongoose';

const FcmTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    // Set isAdmin: true when registering the owner/admin device.
    // In orders.js you can filter: FcmToken.find({ isAdmin: true })
    // if you ever want to restrict notifications to only the admin device.
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('FcmToken', FcmTokenSchema);