/**
 * Profile Service
 * Manages LearnerConditionsProfile and EvidenceOverlay blending.
 */

// In-memory store with defaults for demo/framework
const profiles = new Map();
const evidenceOverlays = new Map();

export const defaultProfile = {
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
  engagement_start_order: ['worked_example', 'video', 'diagram', 'reading', 'practice_with_hints']
};

export function getProfile(userId = 'student_current') {
  if (!profiles.has(userId)) {
    profiles.set(userId, JSON.parse(JSON.stringify(defaultProfile)));
  }
  return profiles.get(userId);
}

export function updateProfile(userId = 'student_current', updates = {}, source = 'student_edit') {
  const current = getProfile(userId);
  const updated = {
    ...current,
    ...updates,
    access: { ...current.access, ...(updates.access || {}) },
    context: { ...current.context, ...(updates.context || {}) },
    knowledge: { ...current.knowledge, ...(updates.knowledge || {}) },
    strategies: { ...current.strategies, ...(updates.strategies || {}) },
    engagement_start_order: updates.engagement_start_order || current.engagement_start_order,
    updated_at: new Date().toISOString(),
    source
  };
  profiles.set(userId, updated);
  return updated;
}

export function getEvidenceOverlay(userId = 'student_current', topicId = 'normal_distribution') {
  const key = `${userId}_${topicId}`;
  if (!evidenceOverlays.has(key)) {
    evidenceOverlays.set(key, {
      topic_id: topicId,
      retrieval_accuracy_recent: 0.5,
      hint_rate: 0.0,
      total_retrievals: 0,
      correct_retrievals: 0,
      total_hints: 0,
      avg_session_seconds: 420,
      preferred_block_that_precedes_correct: 'worked_example',
      mastery_estimate: 0.35,
      last_computed_at: new Date().toISOString()
    });
  }
  return evidenceOverlays.get(key);
}

export function updateEvidenceOverlay(userId = 'student_current', topicId = 'normal_distribution', newEvidence = {}) {
  const key = `${userId}_${topicId}`;
  const current = getEvidenceOverlay(userId, topicId);
  const updated = {
    ...current,
    ...newEvidence,
    last_computed_at: new Date().toISOString()
  };
  evidenceOverlays.set(key, updated);
  return updated;
}

/**
 * Merges profile, student edits, and evidence overlay.
 * Evidence wins on mastery and what to show next.
 */
export function getLiveProfile(userId = 'student_current', topicId = 'normal_distribution') {
  const profile = getProfile(userId);
  const evidence = getEvidenceOverlay(userId, topicId);

  return {
    ...profile,
    evidence_overlay: evidence,
    merged_at: new Date().toISOString()
  };
}
