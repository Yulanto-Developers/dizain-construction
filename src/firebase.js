/**
 * firebase.js — Dizain Constructions
 * ─────────────────────────────────────────────────────────
 * HOW TO SET UP FIREBASE (free, takes ~10 minutes):
 *
 * 1. Go to https://console.firebase.google.com
 * 2. Click "Add project" → name it "dizain-constructions" → Continue
 * 3. Click the "</>" (Web) icon → name it "dizain-web" → Register app
 * 4. Copy the firebaseConfig object shown and paste it below
 * 5. In the Firebase console:
 *    - Go to "Firestore Database" → Create database → Start in test mode
 *    - Go to "Storage" → Get started → Start in test mode
 * 6. Save this file — your admin changes now sync to the cloud!
 * ─────────────────────────────────────────────────────────
 */

// ↓ Replace this entire object with your real Firebase config
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

// ── Init (only when config is filled in) ─────────────────
let app = null
let db = null
let storage = null

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId)

if (isFirebaseConfigured) {
  try {
    const { initializeApp } = await import('firebase/app')
    const { getFirestore } = await import('firebase/firestore')
    const { getStorage } = await import('firebase/storage')
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    storage = getStorage(app)
    // Firebase connected (log removed for production)
  } catch (e) {
    console.warn('Firebase init failed:', e.message)
  }
}

export { app, db, storage, isFirebaseConfigured }
