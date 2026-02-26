import express from 'express';
import Order from '../models/Order.js';
import webpush from 'web-push';
import { subscriptions } from '../subscribe.js';
import admin from '../firebase.js';
import FcmToken from '../models/FcmToken.js';

const router = express.Router();

// ── POST /api/orders ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      name, email, phone,
      deliveryAddress, city, street,
      paymentMethod, message, items, total,
    } = req.body;

    if (!name || !email || !deliveryAddress || !city || !street || !items?.length) {
      return res.status(400).json({ error: 'Missing required fields or items' });
    }

    const order = new Order({
      orderId: 'ORD-' + Date.now(),
      name, email, phone,
      deliveryAddress, city, street,
      paymentMethod, message, total, items,
    });

    await order.save();

    const payload = JSON.stringify({
      title: '🛍 New Order Received!',
      body: `Order ${order.orderId} has been placed.`,
    });

    // ── Web-Push ──────────────────────────────────────────────────────────────
    console.log('Web-push subscriptions count:', subscriptions.length);
    subscriptions.forEach((sub) => {
      webpush.sendNotification(sub, payload)
        .catch((err) => console.error('Web-push error:', err));
    });

    // ── FCM — only send to YOUR device (isAdmin: true) ────────────────────────
    const tokenDocs = await FcmToken.find({ isAdmin: true }); // ✅ only your phone
    const tokens = tokenDocs.map((t) => t.token);

    if (tokens.length > 0) {
      const fcmMessage = {
        notification: {
          title: '🛍 New Order Received!',
          body: `Order ${order.orderId} has been placed.`,
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192x192.png',
            click_action: process.env.ADMIN_URL || 'http://localhost:5174',
          },
        },
        android: { priority: 'high' },
        apns: { payload: { aps: { contentAvailable: true } } },
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(fcmMessage);
      console.log(`✅ FCM: ${response.successCount} sent, ${response.failureCount} failed`);

      // Auto-cleanup stale tokens
      if (response.failureCount > 0) {
        const badTokens = [];
        response.responses.forEach((r, i) => {
          if (!r.success) {
            console.error('FCM token error:', tokens[i], r.error?.code);
            if (
              r.error?.code === 'messaging/registration-token-not-registered' ||
              r.error?.code === 'messaging/invalid-registration-token'
            ) {
              badTokens.push(tokens[i]);
            }
          }
        });
        if (badTokens.length) {
          await FcmToken.deleteMany({ token: { $in: badTokens } });
          console.log(`🗑 Removed ${badTokens.length} stale FCM token(s)`);
        }
      }
    } else {
      console.warn('⚠ No admin FCM tokens — open ?admin=deadstock2024 on your phone first');
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/orders/subscribe ────────────────────────────────────────────────
router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscriptions.find((s) => s.endpoint === subscription.endpoint)) {
    subscriptions.push(subscription);
  }
  res.status(201).json({ success: true });
});

export default router;