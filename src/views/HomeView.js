/**
 * Home View
 * Course landing, learning objectives overview, and pathways entry point.
 */

import { renderInstallBanner, setupInstallBannerHandlers } from '../components/PwaInstallBanner.js';

export function renderHomeView(courses = [], profile = {}) {
  const currentCourse = courses[0] || {
    title: 'Data Literacy and Statistical Reasoning',
    topics: []
  };

  const topicsHtml = (currentCourse.topics || []).map(topic => `
    <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; margin-bottom:1rem; border-left:4px solid var(--accent-primary);">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
          <h4 style="font-family:var(--font-display); font-size:1.1rem; color:#f8fafc;">${topic.title}</h4>
          <span class="block-badge" style="text-transform:capitalize;">${topic.difficulty}</span>
        </div>
        <p style="font-size:0.875rem; color:#cbd5e1; line-height:1.5; margin-bottom:0.75rem;">
          <strong>Objective:</strong> ${topic.learning_objective}
        </p>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
        <span style="font-size:0.8rem; color:var(--text-dim);">Est. ${topic.estimated_minutes} min</span>
        <a href="#/activity/obj_normal_dist_core" class="btn btn-primary btn-sm">
          Start Activity →
        </a>
      </div>
    </div>
  `).join('');

  return `
    <div class="view-container">
      ${renderInstallBanner()}

      <div class="card" style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%); border:1px solid rgba(99, 102, 241, 0.3); padding:2rem; margin-bottom:1.75rem;">
        <div style="max-width:650px;">
          <span class="block-badge" style="background:rgba(6, 182, 212, 0.15); color:#22d3ee; margin-bottom:0.75rem; display:inline-block;">
            Universal Design for Learning (UDL)
          </span>
          <h2 style="font-family:var(--font-display); font-size:1.8rem; font-weight:800; color:#ffffff; line-height:1.25; margin-bottom:0.75rem;">
            Individually Customized Learning Pathways
          </h2>
          <p style="font-size:0.95rem; color:#cbd5e1; line-height:1.6; margin-bottom:1.25rem;">
            Instruction personalized from your real learner conditions (access needs, prior knowledge, study strategies, device constraints, and performance). Multiple ways to access and understand content are always available.
          </p>
          <div style="display:flex; flex-wrap:wrap; gap:0.75rem;">
            <a href="#/today" class="btn btn-primary">
              Continue Today's Pathway
            </a>
            <a href="#/intake" class="btn btn-secondary">
              ${profile?.updated_at ? 'Update Conditions Profile' : 'Start Intake Profile'}
            </a>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h3 style="font-family:var(--font-display); font-size:1.3rem; color:#f8fafc;">
          Course Modules: ${currentCourse.title}
        </h3>
        <span style="font-size:0.85rem; color:var(--text-muted);">${(currentCourse.topics || []).length} Objectives</span>
      </div>

      <div class="topics-grid">
        ${topicsHtml}
      </div>

      <div class="card" style="margin-top:2rem; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08);">
        <h4 style="font-family:var(--font-display); font-size:1rem; color:#e2e8f0; margin-bottom:0.5rem;">
          Our Educational Guarantees
        </h4>
        <ul style="font-size:0.85rem; color:#94a3b8; line-height:1.7; padding-left:1.25rem;">
          <li><strong>No pigeonholing:</strong> We never classify you into fixed learning styles. All modalities remain fully open.</li>
          <li><strong>Rules first:</strong> Deterministic pedagogy rules ensure complete coverage of core explanations, worked examples, and retrieval.</li>
          <li><strong>Safe student surface:</strong> Zero artificial intelligence keys, prompts, or model vendor APIs ever ship to your device.</li>
        </ul>
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.06); font-size:0.85rem; color:#a5b4fc;">
          Concept prototype conceived and developed by <a href="https://www.linkedin.com/in/beingbabu/" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; text-decoration:underline; font-weight:600;">Professor Babu George</a>.
        </div>
      </div>
    </div>
  `;
}

export function setupHomeViewHandlers(container) {
  setupInstallBannerHandlers(container);
}
