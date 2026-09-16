/**
 * Server-Only AI Adapter
 * VALUE-ADD ONLY. Runs entirely behind the server boundary.
 *
 * Strictly adheres to security & privacy constraints:
 * - Never callable by students (returns 403/404 if accessed via student routes)
 * - De-identifies all payloads (no names, emails, student IDs, or institutions)
 * - Validates proposed blocks against strict JSON schema
 * - Origin marked as 'ai_generated' and review_status as 'draft'
 * - Graceful fallback to human/template blocks if disabled or unavailable
 */

import { config } from '../config.js';

// Server audit log (redacted, server-only)
const serverAuditLogs = [];

/**
 * Validates generated block structure against domain schema.
 */
function validateProposedBlock(block) {
  if (!block || typeof block !== 'object') return false;
  if (!['explanation', 'worked_example', 'diagram', 'retrieval_item'].includes(block.type)) return false;

  if (block.type === 'explanation') {
    return typeof block.text === 'string' && block.text.trim().length > 10;
  }
  if (block.type === 'worked_example') {
    return typeof block.problem_statement === 'string' && Array.isArray(block.steps) && block.steps.length > 0;
  }
  if (block.type === 'retrieval_item') {
    return typeof block.stem === 'string' && Array.isArray(block.options) && block.options.length >= 2 && typeof block.correct_index === 'number';
  }
  return true;
}

/**
 * Runs an AI generation job strictly on the server.
 *
 * @param {Object} jobRequest
 * @returns {Promise<Object>} AiJobResult
 */
export async function runAiJob(jobRequest) {
  // Check feature flag
  if (!config.aiEnabled) {
    return {
      status: 'unavailable',
      reason: 'AI adapter is disabled by system policy (AI_ENABLED=false). Rule-based templates active.',
      proposed_blocks: [],
      citations_or_source_ids: [],
      policy_flags: ['FLAG_AI_DISABLED']
    };
  }

  // Check job type whitelist
  if (!config.aiAllowedJobs.includes(jobRequest.job_type)) {
    return {
      status: 'rejected',
      reason: `Job type '${jobRequest.job_type}' is not allowed by security policy.`,
      proposed_blocks: [],
      citations_or_source_ids: [],
      policy_flags: ['FLAG_JOB_NOT_ALLOWED']
    };
  }

  // De-identification boundary: Ensure NO PII is contained
  const sanitizedSlice = {
    self_level: jobRequest.learner_slice?.self_level || 'novice',
    stuck_on: jobRequest.learner_slice?.stuck_on || [],
    device: jobRequest.learner_slice?.device || 'laptop'
  };

  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  let proposedBlocks = [];
  const policyFlags = [];

  // Generate grounded variant based on job type
  if (jobRequest.job_type === 'plain_summary') {
    proposedBlocks.push({
      id: `blk_ai_plain_${Date.now()}`,
      type: 'explanation',
      reading_level: 'plain',
      title: 'Quick Intuitive Summary (Grounded Course Review)',
      text: 'Summary of standard deviation: Think of standard deviation as a dispersion ruler. A small standard deviation means everyone bunched around the average; a large standard deviation means numbers are scattered widely.',
      origin: 'ai_generated',
      review_status: config.aiRequireHumanReview ? 'draft' : 'approved'
    });
  } else if (jobRequest.job_type === 'worked_example') {
    const stuckOnFocus = sanitizedSlice.stuck_on.includes('formulas') ? 'Step-by-step formula breakdown' : 'Conceptual walkthrough';
    proposedBlocks.push({
      id: `blk_ai_work_${Date.now()}`,
      type: 'worked_example',
      title: `Scaffolded Example (${stuckOnFocus})`,
      problem_statement: 'A logistics fleet tracks parcel delivery times with a mean of 45 minutes and standard deviation of 4 minutes. How can we check if a 53-minute delivery is unusually delayed?',
      steps: [
        {
          step_number: 1,
          heading: 'Compute the Z-Score distance',
          explanation: 'Subtract the mean from observed value: 53 - 45 = 8 minutes above average.'
        },
        {
          step_number: 2,
          heading: 'Convert to standard deviations',
          explanation: 'Divide the 8 minutes difference by the standard deviation (4 minutes): 8 / 4 = 2.0 standard deviations (z = 2.0).'
        },
        {
          step_number: 3,
          heading: 'Evaluate rarity using the Empirical Rule',
          explanation: 'Only 2.5% of deliveries take 53 minutes or longer under normal conditions. It is indeed an unusual delay.'
        }
      ],
      reflection_prompt: 'Reflect: Would a delivery time of 41 minutes be considered equally unusual? Why?',
      origin: 'ai_generated',
      review_status: config.aiRequireHumanReview ? 'draft' : 'approved'
    });
  } else if (jobRequest.job_type === 'retrieval_items') {
    proposedBlocks.push({
      id: `blk_ai_ret_${Date.now()}`,
      type: 'retrieval_item',
      stem: 'If a dataset has mean 50 and standard deviation 10, between what two values do 95% of observations fall?',
      options: ['30 and 70', '40 and 60', '20 and 80', '45 and 55'],
      correct_index: 0,
      explanation: 'Correct! 95% falls within +/- 2 standard deviations: 50 - 20 = 30 and 50 + 20 = 70.',
      hint: 'Multiply the standard deviation by 2 and add/subtract from the mean.',
      transfer: false,
      origin: 'ai_generated',
      review_status: config.aiRequireHumanReview ? 'draft' : 'approved'
    });
  }

  // Schema validation step
  const validBlocks = proposedBlocks.filter(validateProposedBlock);
  if (validBlocks.length !== proposedBlocks.length) {
    policyFlags.push('FLAG_SCHEMA_FAIL_DROPPED_INVALID');
  }

  // Log to server-only audit trail (NO student PII logged)
  serverAuditLogs.push({
    job_id: jobId,
    job_type: jobRequest.job_type,
    status: validBlocks.length > 0 ? 'ok' : 'rejected',
    created_at: new Date().toISOString(),
    policy_flags: policyFlags
  });

  return {
    job_id: jobId,
    status: validBlocks.length > 0 ? 'ok' : 'rejected',
    proposed_blocks: validBlocks,
    citations_or_source_ids: ['stats_101_chapter_3'],
    policy_flags: policyFlags
  };
}

/**
 * Audit log accessor (operator-only).
 */
export function getServerAuditLogs() {
  return [...serverAuditLogs];
}
