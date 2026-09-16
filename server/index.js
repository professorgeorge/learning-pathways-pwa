/**
 * Backend-for-Frontend (BFF) Server
 * Serves the PWA frontend and the Student-Facing Public API.
 * Keeps all AI and operator secrets strictly isolated on the server.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { config } from './config.js';
import { getProfile, updateProfile, getLiveProfile, getEvidenceOverlay } from './services/profile.js';
import { orchestrateActivity } from './services/orchestrator.js';
import { recordEvents, getTelemetrySummary } from './services/telemetry.js';
import { runAiJob, getServerAuditLogs } from './services/ai_adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const app = express();

app.use(cors());
app.use(express.json());

// Load static seed curriculum
const coursesPath = path.join(__dirname, 'data', 'courses.json');
const learningObjectsPath = path.join(__dirname, 'data', 'learning_objects.json');

let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));
let learningObjects = JSON.parse(fs.readFileSync(learningObjectsPath, 'utf-8'));

// Simulated session store
let currentSessionUser = {
  id: 'student_current',
  name: 'Alex Rivera',
  role: 'student'
};

// -------------------------------------------------------------
// Hard Boundary Enforcement: Block direct AI calls from students
// -------------------------------------------------------------
app.all(['/ai', '/ai/*', '/api/ai', '/api/ai/*', '/llm', '/llm/*', '/generate', '/generate/*'], (req, res) => {
  return res.status(404).json({
    error: 'Endpoint not found or forbidden.',
    code: 'ROUTE_FORBIDDEN_OR_NOT_FOUND'
  });
});

// -------------------------------------------------------------
// Student-Facing Public API (§9)
// -------------------------------------------------------------

// Authentication & Identity
app.get('/api/me', (req, res) => {
  res.json({
    user: currentSessionUser,
    roles: [currentSessionUser.role],
    ferpa_notice: 'Educational records and telemetry are retained in compliance with institution privacy policies. AI adapter runs server-only with de-identified data.'
  });
});

app.post('/api/auth/role', (req, res) => {
  const { role } = req.body;
  if (role === 'instructor' || role === 'student') {
    currentSessionUser.role = role;
    return res.json({ success: true, currentSessionUser });
  }
  res.status(400).json({ error: 'Invalid role' });
});

// Courses and Modules
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

app.get('/api/courses/:courseId', (req, res) => {
  const course = courses.find(c => c.course_id === req.params.courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

// Learner Conditions Profile
app.get('/api/profiles/current', (req, res) => {
  const liveProfile = getLiveProfile(currentSessionUser.id);
  res.json(liveProfile);
});

app.put('/api/profiles/current', (req, res) => {
  // Student can update access, context, strategies, and start order
  const updates = req.body;
  const updated = updateProfile(currentSessionUser.id, updates, 'student_edit');
  res.json(updated);
});

// Adaptive Activity Orchestration
app.get('/api/activities/next', (req, res) => {
  const topicId = req.query.topicId || 'normal_distribution';
  const object = learningObjects.find(lo => lo.topic_id === topicId && lo.review_status === 'approved') || learningObjects[0];

  const profile = getLiveProfile(currentSessionUser.id, topicId);
  const orchestrated = orchestrateActivity(object, profile, profile.evidence_overlay);

  res.json(orchestrated);
});

app.get('/api/activities/:id', (req, res) => {
  const object = learningObjects.find(lo => lo.object_id === req.params.id);
  if (!object) return res.status(404).json({ error: 'Learning object not found' });

  const profile = getLiveProfile(currentSessionUser.id, object.topic_id);
  const orchestrated = orchestrateActivity(object, profile, profile.evidence_overlay);

  res.json(orchestrated);
});

// Telemetry & Event Ingestion (idempotent, batchable)
app.post('/api/activities/:id/events', (req, res) => {
  const { events, topic_id } = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Payload must contain an array of events.' });
  }

  const result = recordEvents(currentSessionUser.id, topic_id || 'normal_distribution', events);
  res.json({
    status: 'ok',
    processed_count: result.processed_count,
    evidence_updated: result.evidence_updated,
    evidence_overlay: result.overlay
  });
});

// Progress and Objective-Based Mastery
app.get('/api/progress', (req, res) => {
  const courseId = req.query.courseId || 'stats_101';
  const course = courses.find(c => c.course_id === courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const topicMastery = course.topics.map(t => {
    const overlay = getEvidenceOverlay(currentSessionUser.id, t.topic_id);
    return {
      topic_id: t.topic_id,
      title: t.title,
      learning_objective: t.learning_objective,
      mastery_estimate: overlay.mastery_estimate,
      retrieval_accuracy_recent: overlay.retrieval_accuracy_recent,
      total_retrievals: overlay.total_retrievals,
      hint_rate: overlay.hint_rate,
      preferred_modality_observed: overlay.preferred_block_that_precedes_correct
    };
  });

  const overallMastery = topicMastery.length > 0 
    ? Number((topicMastery.reduce((acc, curr) => acc + curr.mastery_estimate, 0) / topicMastery.length).toFixed(2))
    : 0;

  res.json({
    course_id: courseId,
    overall_mastery: overallMastery,
    topics: topicMastery,
    pedagogy_note: 'Progress is tracked strictly by objective mastery and empirical retrieval accuracy, never by learning style labels.'
  });
});

// -------------------------------------------------------------
// Instructor / Operator Portal API (Strictly Role-Checked)
// -------------------------------------------------------------
app.use('/api/instructor', (req, res, next) => {
  // Check instructor role
  if (currentSessionUser.role !== 'instructor') {
    return res.status(403).json({
      error: 'Access denied: Instructor or operator credentials required.',
      code: 'INSTRUCTOR_ROLE_REQUIRED'
    });
  }
  next();
});

app.get('/api/instructor/telemetry', (req, res) => {
  const summary = getTelemetrySummary(currentSessionUser.id, 'normal_distribution');
  const auditLogs = getServerAuditLogs();
  res.json({
    cohort_summary: {
      active_students: 1,
      avg_retrieval_accuracy: summary.overlay.retrieval_accuracy_recent,
      avg_hint_rate: summary.overlay.hint_rate,
      udl_format_tray_utilization_rate: 0.72
    },
    student_evidence: summary,
    server_ai_audit_logs: auditLogs,
    system_config: {
      ai_enabled: config.aiEnabled,
      ai_provider: config.aiProvider,
      allowed_jobs: config.aiAllowedJobs,
      require_human_review: config.aiRequireHumanReview
    }
  });
});

// Instructor trigger for server-side AI generation job
app.post('/api/instructor/generate-draft', async (req, res) => {
  const { job_type, topic_id } = req.body;
  const targetObject = learningObjects.find(lo => lo.topic_id === (topic_id || 'normal_distribution'));
  if (!targetObject) return res.status(404).json({ error: 'Target learning object not found' });

  const jobResult = await runAiJob({
    job_type: job_type || 'plain_summary',
    learning_object_id: targetObject.object_id,
    constraints: {
      reading_level: 'plain',
      max_words: 150,
      must_include_objective: true,
      no_new_facts: true
    },
    learner_slice: {
      self_level: 'novice',
      stuck_on: ['formulas'],
      device: 'phone'
    }
  });

  if (jobResult.status === 'ok' && jobResult.proposed_blocks.length > 0) {
    // Add to learning object in draft state
    jobResult.proposed_blocks.forEach(block => {
      targetObject.blocks.push(block);
    });
  }

  res.json(jobResult);
});

// Approve a draft block into the active UDL envelope
app.post('/api/instructor/approve-draft', (req, res) => {
  const { object_id, block_id } = req.body;
  const targetObject = learningObjects.find(lo => lo.object_id === object_id);
  if (!targetObject) return res.status(404).json({ error: 'Learning object not found' });

  const block = targetObject.blocks.find(b => b.id === block_id);
  if (!block) return res.status(404).json({ error: 'Block not found' });

  block.review_status = 'approved';
  res.json({ success: true, approved_block: block });
});

// -------------------------------------------------------------
// Serve Static Frontend Assets & PWA Shell
// -------------------------------------------------------------
app.use(express.static(path.join(projectRoot, 'public')));
app.use('/src', express.static(path.join(projectRoot, 'src')));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(projectRoot, 'index.html'));
});

// Start listening if not imported by test runner
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
    console.log(`PWA URL: http://localhost:${config.port}`);
    console.log(`AI Adapter status: ${config.aiEnabled ? 'ENABLED (Server-only)' : 'DISABLED (Deterministic rule engine)'}`);
  });
}

export default app;
