import { openDB } from 'idb'

const DB_NAME = 'theapka_offline_db'
const DB_VERSION = 1
const STORE_NAME = 'gifts_queue'

let dbPromise = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'client_uuid' })
        }
      },
    })
  }
  return dbPromise
}

/**
 * Generate a random UUID v4
 */
export function generateClientUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const listeners = new Set()

export function subscribePendingCount(cb) {
  listeners.add(cb)
  // Call once immediately with current count
  getPendingCount().then((count) => cb(count))
  return () => listeners.delete(cb)
}

async function notifyListeners() {
  const count = await getPendingCount()
  listeners.forEach((cb) => {
    try {
      cb(count)
    } catch (e) {
      console.error('Pending count listener error:', e)
    }
  })
}

/**
 * Add a gift entry to the offline IndexedDB queue
 * @param {Object} giftData
 * @returns {Promise<Object>} the stored gift with client_uuid
 */
export async function enqueueGift(giftData) {
  const db = await getDB()
  const client_uuid = giftData.client_uuid || generateClientUuid()
  const entry = {
    ...giftData,
    client_uuid,
    queued_at: new Date().toISOString(),
    status: 'pending_sync',
  }

  await db.put(STORE_NAME, entry)
  await notifyListeners()
  return entry
}

/**
 * Get all pending gifts in the queue
 * @returns {Promise<Array>}
 */
export async function getPendingGifts() {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

/**
 * Get count of pending gifts
 * @returns {Promise<number>}
 */
export async function getPendingCount() {
  try {
    const db = await getDB()
    return db.count(STORE_NAME)
  } catch {
    return 0
  }
}

/**
 * Remove a gift from the queue after successful sync
 * @param {string} client_uuid
 */
export async function removePendingGift(client_uuid) {
  const db = await getDB()
  await db.delete(STORE_NAME, client_uuid)
  await notifyListeners()
}

/**
 * Clear all items in queue (rarely used, for reset)
 */
export async function clearQueue() {
  const db = await getDB()
  await db.clear(STORE_NAME)
  await notifyListeners()
}

let isSyncing = false

/**
 * Process the queue and sync with backend
 * @param {Function} postGiftFn Function that calls API POST /api/user/gifts
 * @returns {Promise<{ synced: number, failed: number }>}
 */
export async function syncPendingGifts(postGiftFn) {
  if (isSyncing || !navigator.onLine) {
    return { synced: 0, failed: 0 }
  }

  isSyncing = true
  let synced = 0
  let failed = 0

  try {
    const pending = await getPendingGifts()
    for (const item of pending) {
      try {
        await postGiftFn(item)
        await removePendingGift(item.client_uuid)
        synced++
      } catch (err) {
        console.error('Failed to sync gift:', item.client_uuid, err)
        failed++
      }
    }
  } finally {
    isSyncing = false
    await notifyListeners()
  }

  return { synced, failed }
}

// Auto-trigger sync on reconnect if handler is registered
let globalSyncHandler = null
export function registerGlobalSyncHandler(handler) {
  globalSyncHandler = handler
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (globalSyncHandler) {
      globalSyncHandler()
    }
  })
}
