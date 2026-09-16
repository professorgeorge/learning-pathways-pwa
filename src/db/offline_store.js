/**
 * IndexedDB Offline Storage & Telemetry Sync Manager
 * Keeps student activity safe on flaky Wi-Fi and offline situations.
 */

const DB_NAME = 'PathwaysOfflineDB';
const DB_VERSION = 1;

let dbPromise = null;

export function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('cached_activities')) {
        db.createObjectStore('cached_activities', { keyPath: 'object_id' });
      }
      if (!db.objectStoreNames.contains('event_queue')) {
        db.createObjectStore('event_queue', { keyPath: 'client_event_id' });
      }
      if (!db.objectStoreNames.contains('profile_draft')) {
        db.createObjectStore('profile_draft', { keyPath: 'id' });
      }
    };

    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });

  return dbPromise;
}

export async function saveActivityToCache(activity) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cached_activities', 'readwrite');
      tx.objectStore('cached_activities').put(activity);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to cache activity in IndexedDB:', err);
  }
}

export async function getCachedActivity(objectId) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cached_activities', 'readonly');
      const req = tx.objectStore('cached_activities').get(objectId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(tx.error);
    });
  } catch (err) {
    return null;
  }
}

export async function queueTelemetryEvent(event) {
  try {
    const db = await openDb();
    const eventWithId = {
      ...event,
      client_event_id: event.client_event_id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      queued_at: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('event_queue', 'readwrite');
      tx.objectStore('event_queue').put(eventWithId);
      tx.oncomplete = () => resolve(eventWithId);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to queue event in IndexedDB:', err);
  }
}

export async function getQueuedEvents() {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('event_queue', 'readonly');
      const req = tx.objectStore('event_queue').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(tx.error);
    });
  } catch (err) {
    return [];
  }
}

export async function clearQueuedEvents(eventIds = []) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('event_queue', 'readwrite');
      const store = tx.objectStore('event_queue');
      eventIds.forEach(id => store.delete(id));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to clear queued events:', err);
  }
}

export async function saveProfileDraft(profile) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profile_draft', 'readwrite');
      tx.objectStore('profile_draft').put({ id: 'current', ...profile });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save profile draft:', err);
  }
}

export async function getProfileDraft() {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profile_draft', 'readonly');
      const req = tx.objectStore('profile_draft').get('current');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(tx.error);
    });
  } catch (err) {
    return null;
  }
}
