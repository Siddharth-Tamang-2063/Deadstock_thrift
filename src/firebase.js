// src/firebase.js
import { createRequire } from 'module';
import admin from 'firebase-admin';

// Using createRequire avoids the `assert { type: "json" }` syntax which
// requires --experimental-json-modules in some Node versions.
const require = createRequire(import.meta.url);
const serviceAccount = require('./firebase-backendkey.json');

// Guard against calling initializeApp() more than once (e.g. during hot reload)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK initialised');
}

export default admin;