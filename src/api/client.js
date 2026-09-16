/**
 * API Client for Student PWA
 * Talks exclusively to the trusted BFF API origin.
 * Automatically buffers telemetry events to IndexedDB when offline.
 */

import { queueTelemetryEvent, getQueuedEvents, clearQueuedEvents, saveActivityToCache, getCachedActivity } from '../db/offline_store.js';

const API_BASE = '/api';

export async function fetchMe() {
  try {
    const res = await fetch(`${API_BASE}/me`);
    return await res.json();
  } catch (err) {
    return {
      user: { id: 'offline_student', name: 'Offline Student', role: 'student' },
      roles: ['student'],
      is_offline: true
    };
  }
}

export async function setRole(role) {
  const res = await fetch(`${API_BASE}/auth/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  return await res.json();
}

export async function fetchCourses() {
  try {
    const res = await fetch(`${API_BASE}/courses`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchCurrentProfile() {
  try {
    const res = await fetch(`${API_BASE}/profiles/current`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function updateCurrentProfile(profileUpdates) {
  try {
    const res = await fetch(`${API_BASE}/profiles/current`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileUpdates)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchNextActivity(topicId) {
  try {
    const url = topicId ? `${API_BASE}/activities/next?topicId=${encodeURIComponent(topicId)}` : `${API_BASE}/activities/next`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.object_id) {
      await saveActivityToCache(data);
    }
    return data;
  } catch (err) {
    // Offline fallback to IndexedDB cache
    const cached = await getCachedActivity('obj_normal_dist_core');
    if (cached) {
      cached.is_from_offline_cache = true;
      return cached;
    }
    throw err;
  }
}

export async function fetchProgress(courseId = 'stats_101') {
  try {
    const res = await fetch(`${API_BASE}/progress?courseId=${encodeURIComponent(courseId)}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function postTelemetryEvent(objectId, topicId, event) {
  const eventPayload = {
    ...event,
    session_id: event.session_id || 'session_current',
    timestamp: Date.now()
  };

  if (!navigator.onLine) {
    await queueTelemetryEvent(eventPayload);
    return { queued_offline: true };
  }

  try {
    const res = await fetch(`${API_BASE}/activities/${objectId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic_id: topicId,
        events: [eventPayload]
      })
    });
    return await res.json();
  } catch (err) {
    await queueTelemetryEvent(eventPayload);
    return { queued_offline: true };
  }
}

export async function syncQueuedTelemetry(objectId = 'obj_normal_dist_core', topicId = 'normal_distribution') {
  if (!navigator.onLine) return { synced: 0 };
  const queued = await getQueuedEvents();
  if (queued.length === 0) return { synced: 0 };

  try {
    const res = await fetch(`${API_BASE}/activities/${objectId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic_id: topicId,
        events: queued
      })
    });
    if (res.ok) {
      const ids = queued.map(e => e.client_event_id);
      await clearQueuedEvents(ids);
      return { synced: queued.length };
    }
  } catch (err) {
    console.warn('Sync failed, will retry later:', err);
  }
  return { synced: 0 };
}

// Auto sync when connection is restored
window.addEventListener('online', () => {
  syncQueuedTelemetry();
});

// Instructor API functions
export async function fetchInstructorTelemetry() {
  const res = await fetch(`${API_BASE}/instructor/telemetry`);
  return await res.json();
}

export async function triggerAiDraftJob(jobType, topicId) {
  const res = await fetch(`${API_BASE}/instructor/generate-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_type: jobType, topic_id: topicId })
  });
  return await res.json();
}

export async function approveDraftBlock(objectId, blockId) {
  const res = await fetch(`${API_BASE}/instructor/approve-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ object_id: objectId, block_id: blockId })
  });
  return await res.json();
}
