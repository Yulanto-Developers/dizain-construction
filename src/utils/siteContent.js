/**
 * siteContent.js
 * ─────────────────────────────────────────────
 * Content service for Dizain Constructions CMS.
 * Works immediately with localStorage.
 * Auto-upgrades to Firebase when firebase.js is configured.
 */

import { DEFAULT_CONTENT } from './defaults.js'
import { db, isFirebaseConfigured } from '../firebase.js'

// Firestore helpers (lazy import to avoid errors when not configured)
async function getFirestoreDoc(section) {
  if (!isFirebaseConfigured || !db) return null
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(db, 'siteContent', section))
    return snap.exists() ? snap.data() : null
  } catch {
    return null
  }
}

async function setFirestoreDoc(section, data) {
  if (!isFirebaseConfigured || !db) return
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'siteContent', section), data)
  } catch (e) {
    console.error('Firebase save failed:', e)
  }
}

// ── Public API ──────────────────────────────────────────

/**
 * Load a content section.
 * Priority: Firebase → localStorage → defaults
 */
export async function loadSection(section) {
  // 1. Try Firebase (cloud, most up-to-date)
  const cloud = await getFirestoreDoc(section)
  if (cloud) {
    localStorage.setItem(`cms_${section}`, JSON.stringify(cloud))
    return cloud
  }
  // 2. Fall back to localStorage
  const local = localStorage.getItem(`cms_${section}`)
  if (local) return JSON.parse(local)
  // 3. Fall back to defaults
  return DEFAULT_CONTENT[section] ?? null
}

/**
 * Save a content section to localStorage + Firebase.
 */
export async function saveSection(section, data) {
  localStorage.setItem(`cms_${section}`, JSON.stringify(data))
  await setFirestoreDoc(section, data)
}

/**
 * Load ALL sections at once (for public page).
 */
export async function loadAllContent() {
  const sections = Object.keys(DEFAULT_CONTENT)
  const entries = await Promise.all(
    sections.map(async (key) => [key, await loadSection(key)])
  )
  return Object.fromEntries(entries)
}

/**
 * Upload an image as base64 to localStorage.
 * Returns a data URL immediately.
 * When Firebase Storage is configured, use uploadImageToStorage instead.
 */
export function imageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Upload image to Firebase Storage (when configured).
 * Returns a downloadable URL.
 */
export async function uploadImageToStorage(file, path) {
  if (!isFirebaseConfigured) {
    return imageToDataUrl(file)
  }
  try {
    const { storage } = await import('../firebase.js')
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
    const storageRef = ref(storage, path)
    const snap = await uploadBytes(storageRef, file)
    return await getDownloadURL(snap.ref)
  } catch {
    return imageToDataUrl(file)
  }
}
