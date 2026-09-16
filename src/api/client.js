/**
 * API Client for Student PWA
 * Talks to the trusted BFF API origin when connected to a backend server.
 * Transparently falls back to client-side deterministic orchestrator and IndexedDB
 * when deployed statically on GitHub Pages or completely offline.
 */

import { queueTelemetryEvent, getQueuedEvents, clearQueuedEvents, saveActivityToCache, getCachedActivity, saveProfileDraft, getProfileDraft } from '../db/offline_store.js';
import { seedCourses, seedLearningObjects } from '../data/seed_data.js';
import { orchestrateActivity } from '../services/client_orchestrator.js';

const API_BASE = '/api';

// Local in-memory store for static hosting (GitHub Pages)
let clientLocalUser = {
  id: 'student_current',
  name: 'Student Learner',
  role: 'student'
};

let clientLocalProfile = {
  profile_id: 'default_profile_1',
  user_id: 'student_current',
  course_id: 'stats_101',
  updated_at: new Date().toISOString(),
  source: 'intake',
  access: {
    first_format_preference: 'watch',
    reading_load: 'needs_summary',
    captions_needed: false,
    larger_text: false,
    translation_needed: false,
    extra_time: false,
    other_access_notes: null
  },
  context: {
    device: 'phone',
    environment: 'quiet',
    typical_focus_minutes: 15
  },
  knowledge: {
    topic_id: 'normal_distribution',
    self_level: 'novice',
    weekly_goal: 'pass_quiz',
    stuck_on: ['formulas', 'multi_step']
  },
  strategies: {
    sets_goal: 3,
    self_tests: 2,
    explains_aloud_or_write: 3,
    monitors_and_switches: 2,
    asks_for_help: 4
  },
  engagement_start_order: ['worked_example', 'video', 'diagram', 'reading', 'practice_with_hints'],
  evidence_overlay: {
    topic_id: 'normal_distribution',
    retrieval_accuracy_recent: 0.5,
    hint_rate: 0.0,
    total_retrievals: 0,
    correct_retrievals: 0,
    total_hints: 0,
    avg_session_seconds: 420,
    preferred_block_that_precedes_correct: 'worked_example',
    mastery_estimate: 0.35,
    last_computed_at: new Date().toISOString()
  }
};

export async function fetchMe() {
  try {
    const res = await fetch(`${API_BASE}/me`);
    if (res.ok) return await res.json();
  } catch (err) {
    // Expected on static GitHub Pages
  }
  return {
    user: clientLocalUser,
    roles: [clientLocalUser.role],
    is_static_mode: true
  };
}

export async function setRole(role) {
  clientLocalUser.role = role;
  try {
    const res = await fetch(`${API_BASE}/auth/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return { success: true, currentSessionUser: clientLocalUser };
}

export async function fetchCourses() {
  try {
    const res = await fetch(`${API_BASE}/courses`);
    if (res.ok) return await res.json();
  } catch (err) {}
  return seedCourses;
}

export async function fetchCurrentProfile() {
  try {
    const res = await fetch(`${API_BASE}/profiles/current`);
    if (res.ok) return await res.json();
  } catch (err) {}

  // Check IndexedDB
  const draft = await getProfileDraft();
  if (draft) {
    clientLocalProfile = { ...clientLocalProfile, ...draft };
  }
  return clientLocalProfile;
}

export async function updateCurrentProfile(profileUpdates) {
  clientLocalProfile = {
    ...clientLocalProfile,
    ...profileUpdates,
    access: { ...clientLocalProfile.access, ...(profileUpdates.access || {}) },
    context: { ...clientLocalProfile.context, ...(profileUpdates.context || {}) },
    knowledge: { ...clientLocalProfile.knowledge, ...(profileUpdates.knowledge || {}) },
    strategies: { ...clientLocalProfile.strategies, ...(profileUpdates.strategies || {}) },
    updated_at: new Date().toISOString()
  };

  await saveProfileDraft(clientLocalProfile);

  try {
    const res = await fetch(`${API_BASE}/profiles/current`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileUpdates)
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  return clientLocalProfile;
}

export async function fetchNextActivity(topicId = 'normal_distribution') {
  try {
    const url = topicId ? `${API_BASE}/activities/next?topicId=${encodeURIComponent(topicId)}` : `${API_BASE}/activities/next`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.object_id) {
        await saveActivityToCache(data);
        return data;
      }
    }
  } catch (err) {}

  // Client-side deterministic adaptation fallback
  const profile = await fetchCurrentProfile();
  const rawObject = seedLearningObjects.find(lo => lo.topic_id === topicId) || seedLearningObjects[0];
  const orchestrated = orchestrateActivity(rawObject, profile, profile.evidence_overlay);
  await saveActivityToCache(orchestrated);
  return orchestrated;
}

export async function fetchProgress(courseId = 'stats_101') {
  try {
    const res = await fetch(`${API_BASE}/progress?courseId=${encodeURIComponent(courseId)}`);
    if (res.ok) return await res.json();
  } catch (err) {}

  const profile = await fetchCurrentProfile();
  const overlay = profile.evidence_overlay || {};

  const topics = seedCourses[0].topics.map(t => ({
    topic_id: t.topic_id,
    title: t.title,
    learning_objective: t.learning_objective,
    mastery_estimate: t.topic_id === 'normal_distribution' ? overlay.mastery_estimate : 0.35,
    retrieval_accuracy_recent: t.topic_id === 'normal_distribution' ? overlay.retrieval_accuracy_recent : 0.5,
    total_retrievals: t.topic_id === 'normal_distribution' ? overlay.total_retrievals : 0,
    hint_rate: t.topic_id === 'normal_distribution' ? overlay.hint_rate : 0,
    preferred_modality_observed: overlay.preferred_block_that_precedes_correct || 'worked_example'
  }));

  const overallMastery = Number((topics.reduce((acc, t) => acc + t.mastery_estimate, 0) / topics.length).toFixed(2));

  return {
    course_id: courseId,
    overall_mastery: overallMastery,
    topics,
    pedagogy_note: 'Progress is tracked strictly by objective mastery and empirical retrieval accuracy, never by learning style labels.'
  };
}

export async function postTelemetryEvent(objectId, topicId, event) {
  const eventPayload = {
    ...event,
    session_id: event.session_id || 'session_current',
    timestamp: Date.now()
  };

  // Local calculation for static GitHub Pages hosting
  if (event.type === 'answer' || event.type === 'hint') {
    const overlay = clientLocalProfile.evidence_overlay || {};
    const isCorrect = !!event.is_correct;
    const isQuestion = event.type === 'answer';
    const isHint = event.type === 'hint';

    if (isQuestion) {
      overlay.total_retrievals = (overlay.total_retrievals || 0) + 1;
      if (isCorrect) overlay.correct_retrievals = (overlay.correct_retrievals || 0) + 1;
      overlay.retrieval_accuracy_recent = Number((overlay.correct_retrievals / overlay.total_retrievals).toFixed(2));
      overlay.mastery_estimate = Math.min(1.0, Number((overlay.retrieval_accuracy_recent * 0.8 + 0.2).toFixed(2)));
    }
    if (isHint) {
      overlay.total_hints = (overlay.total_hints || 0) + 1;
      if (overlay.total_retrievals > 0) {
        overlay.hint_rate = Number((overlay.total_hints / overlay.total_retrievals).toFixed(2));
      }
    }
    overlay.last_computed_at = new Date().toISOString();
    clientLocalProfile.evidence_overlay = overlay;
    await saveProfileDraft(clientLocalProfile);
  }

  // If online and backend exists, try posting to server
  if (navigator.onLine) {
    try {
      const res = await fetch(`${API_BASE}/activities/${objectId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topicId,
          events: [eventPayload]
        })
      });
      if (res.ok) return await res.json();
    } catch (err) {}
  }

  await queueTelemetryEvent(eventPayload);
  return {
    status: 'ok',
    evidence_updated: true,
    evidence_overlay: clientLocalProfile.evidence_overlay
  };
}

export async function syncQueuedTelemetry(objectId = 'obj_normal_dist_core', topicId = 'normal_distribution') {
  if (!navigator.onLine) return { synced: 0 };
  const queued = await getQueuedEvents();
  if (queued.length === 0) return { synced: 0 };

  try {
    const res = await fetch(`${API_BASE}/activities/${objectId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: topicId, events: queued })
    });
    if (res.ok) {
      const ids = queued.map(e => e.client_event_id);
      await clearQueuedEvents(ids);
      return { synced: queued.length };
    }
  } catch (err) {}
  return { synced: 0 };
}

window.addEventListener('online', () => {
  syncQueuedTelemetry();
});

export async function fetchInstructorTelemetry() {
  try {
    const res = await fetch(`${API_BASE}/instructor/telemetry`);
    if (res.ok) return await res.json();
  } catch (err) {}

  return {
    cohort_summary: {
      active_students: 1,
      avg_retrieval_accuracy: clientLocalProfile.evidence_overlay?.retrieval_accuracy_recent || 0.8,
      avg_hint_rate: clientLocalProfile.evidence_overlay?.hint_rate || 0.3,
      udl_format_tray_utilization_rate: 0.72
    },
    student_evidence: { overlay: clientLocalProfile.evidence_overlay },
    server_ai_audit_logs: [],
    system_config: { ai_enabled: false, ai_provider: 'none' }
  };
}

export async function triggerAiDraftJob(jobType, topicId) {
  try {
    const res = await fetch(`${API_BASE}/instructor/generate-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_type: jobType, topic_id: topicId })
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  return {
    status: 'unavailable',
    reason: 'Server-side AI adapter is not running on this static hosting instance. Deterministic rule engine active.',
    proposed_blocks: [],
    policy_flags: ['FLAG_STATIC_HOSTING_MODE']
  };
}

export async function approveDraftBlock(objectId, blockId) {
  try {
    const res = await fetch(`${API_BASE}/instructor/approve-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ object_id: objectId, block_id: blockId })
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return { success: true };
}
