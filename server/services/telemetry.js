/**
 * Telemetry and Evidence Computing Engine
 * Ingests granular activity events and updates the student's EvidenceOverlay.
 */

import { getEvidenceOverlay, updateEvidenceOverlay } from './profile.js';

// Idempotent event deduplication store
const processedEventIds = new Set();
const rawEventsStore = [];

/**
 * Processes a batch of telemetry events from the PWA client.
 * Supports idempotent retries with client_event_id.
 */
export function recordEvents(userId = 'student_current', topicId = 'normal_distribution', events = []) {
  const newlyProcessed = [];
  const overlay = getEvidenceOverlay(userId, topicId);

  let recentAnswers = [];
  let hintsUsedInSession = 0;
  let questionsAnswered = 0;
  let lastBlockViewed = null;
  const precedingBlocksForCorrect = [];

  for (const event of events) {
    const eventId = event.client_event_id || `${event.session_id}_${event.timestamp}_${Math.random()}`;
    if (processedEventIds.has(eventId)) {
      continue; // Skip duplicate event
    }
    processedEventIds.add(eventId);
    rawEventsStore.push({ ...event, user_id: userId, topic_id: topicId, recorded_at: new Date().toISOString() });
    newlyProcessed.push(event);

    if (event.type === 'view' || event.type === 'play') {
      lastBlockViewed = event.block_type || event.block_id;
    }

    if (event.type === 'hint') {
      hintsUsedInSession++;
    }

    if (event.type === 'answer') {
      questionsAnswered++;
      const isCorrect = !!event.is_correct;
      recentAnswers.push(isCorrect ? 1 : 0);

      if (isCorrect && lastBlockViewed) {
        precedingBlocksForCorrect.push(lastBlockViewed);
      }
    }
  }

  // Update empirical evidence if questions were answered or hints requested
  if (questionsAnswered > 0 || hintsUsedInSession > 0) {
    const totalRetrievals = (overlay.total_retrievals || 0) + questionsAnswered;
    const correctRetrievals = (overlay.correct_retrievals || 0) + recentAnswers.filter(a => a === 1).length;
    const totalHints = (overlay.total_hints || 0) + hintsUsedInSession;

    // Rolling accuracy estimation
    const retrievalAccuracyRecent = totalRetrievals > 0 ? Number((correctRetrievals / totalRetrievals).toFixed(2)) : overlay.retrieval_accuracy_recent;
    const hintRate = totalRetrievals > 0 ? Number((totalHints / totalRetrievals).toFixed(2)) : 0.0;

    // Simple mastery model: weighted combination of accuracy and hint economy
    const accuracyWeight = 0.75;
    const hintPenalty = Math.min(hintRate * 0.15, 0.3);
    const masteryEstimate = Math.max(0.05, Math.min(1.0, Number((retrievalAccuracyRecent * accuracyWeight + (1 - hintPenalty) * 0.25).toFixed(2))));

    const mostCommonPrecedingBlock = precedingBlocksForCorrect.length > 0 ? precedingBlocksForCorrect[0] : overlay.preferred_block_that_precedes_correct;

    updateEvidenceOverlay(userId, topicId, {
      total_retrievals: totalRetrievals,
      correct_retrievals: correctRetrievals,
      total_hints: totalHints,
      retrieval_accuracy_recent: retrievalAccuracyRecent,
      hint_rate: hintRate,
      mastery_estimate: masteryEstimate,
      preferred_block_that_precedes_correct: mostCommonPrecedingBlock
    });
  }

  return {
    processed_count: newlyProcessed.length,
    evidence_updated: questionsAnswered > 0 || hintsUsedInSession > 0,
    overlay: getEvidenceOverlay(userId, topicId)
  };
}

export function getTelemetrySummary(userId = 'student_current', topicId = 'normal_distribution') {
  const overlay = getEvidenceOverlay(userId, topicId);
  const userEvents = rawEventsStore.filter(e => e.user_id === userId);
  return {
    overlay,
    total_events_logged: userEvents.length,
    recent_events: userEvents.slice(-10)
  };
}
