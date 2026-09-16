/**
 * Intake View: Learner Conditions Profile
 * Captures access needs, prior knowledge, strategies, and start preferences.
 * Adheres strictly to Section 10 copy constraints (no learning-style pigeonholing).
 */

import { updateCurrentProfile } from '../api/client.js';
import { saveProfileDraft } from '../db/offline_store.js';

let currentStep = 1;

export function renderIntakeView(profile = {}) {
  const access = profile.access || {};
  const context = profile.context || {};
  const knowledge = profile.knowledge || {};
  const strategies = profile.strategies || {};
  const startOrder = profile.engagement_start_order || ['video', 'worked_example', 'diagram', 'reading', 'practice_with_hints'];

  const friendlyOrderLabels = {
    'video': 'Video Demonstration with captions',
    'worked_example': 'Step-by-Step Worked Example',
    'diagram': 'Visual Diagram or Concept Map',
    'reading': 'Concept Reading (Plain or Standard)',
    'practice_with_hints': 'Interactive Practice with Hints'
  };

  return `
    <div class="view-container">
      <div style="margin-bottom:1.5rem;">
        <h2 style="font-family:var(--font-display); font-size:1.6rem; color:#f8fafc; margin-bottom:0.35rem;">
          Learner Conditions Profile
        </h2>
        <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.5;">
          Tell us about your access needs, prior knowledge, and study habits. Your answers help us order and highlight options, while keeping all representations open.
        </p>
      </div>

      <!-- Stepper Header -->
      <div class="intake-stepper" role="tablist">
        <div class="step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}">
          <div class="step-bubble">1</div>
          <div class="step-label">Access & Needs</div>
        </div>
        <div class="step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}">
          <div class="step-bubble">2</div>
          <div class="step-label">Knowledge & Goal</div>
        </div>
        <div class="step-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}">
          <div class="step-bubble">3</div>
          <div class="step-label">Study Strategies</div>
        </div>
        <div class="step-item ${currentStep === 4 ? 'active' : ''}">
          <div class="step-bubble">4</div>
          <div class="step-label">Start Order</div>
        </div>
      </div>

      <form id="intake-form" class="card">
        <!-- Step 1: Access and Constraints -->
        <div class="step-section" id="step-1" style="display:${currentStep === 1 ? 'block' : 'none'};">
          <h3 style="font-family:var(--font-display); font-size:1.15rem; margin-bottom:1rem; color:#f8fafc;">
            Block A: Access and Constraints
          </h3>

          <div style="margin-bottom:1.25rem;">
            <label style="display:block; font-size:0.9rem; font-weight:600; margin-bottom:0.5rem;">
              Preferred starting format (for initial ordering only):
            </label>
            <select id="first_format_preference" class="card" style="width:100%; padding:0.6rem; color:#f8fafc; background:var(--card-subtle-bg);">
              <option value="watch" ${access.first_format_preference === 'watch' ? 'selected' : ''}>Watch a video demonstration</option>
              <option value="read" ${access.first_format_preference === 'read' ? 'selected' : ''}>Read an explanation</option>
              <option value="listen" ${access.first_format_preference === 'listen' ? 'selected' : ''}>Listen to an audio walkthrough</option>
              <option value="practice" ${access.first_format_preference === 'practice' ? 'selected' : ''}>Jump into a worked example</option>
            </select>
            <small style="font-size:0.75rem; color:var(--text-dim);">All formats remain fully available in your activity tray.</small>
          </div>

          <div style="margin-bottom:1.25rem;">
            <label style="display:block; font-size:0.9rem; font-weight:600; margin-bottom:0.5rem;">
              Reading load preference:
            </label>
            <select id="reading_load" class="card" style="width:100%; padding:0.6rem; color:#f8fafc; background:var(--card-subtle-bg);">
              <option value="easy" ${access.reading_load === 'easy' ? 'selected' : ''}>Standard text (full academic explanations)</option>
              <option value="needs_summary" ${access.reading_load === 'needs_summary' ? 'selected' : ''}>Plain language summary (bulleted and simplified)</option>
              <option value="needs_audio_or_simplified" ${access.reading_load === 'needs_audio_or_simplified' ? 'selected' : ''}>Simplified text with audio speech support</option>
            </select>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; margin-bottom:1.25rem;">
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.875rem; cursor:pointer;">
              <input type="checkbox" id="captions_needed" ${access.captions_needed ? 'checked' : ''}>
              Captions needed on media
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.875rem; cursor:pointer;">
              <input type="checkbox" id="larger_text" ${access.larger_text ? 'checked' : ''}>
              Larger text display
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.875rem; cursor:pointer;">
              <input type="checkbox" id="extra_time" ${access.extra_time ? 'checked' : ''}>
              Extra time on timed activities
            </label>
          </div>

          <div style="display:flex; justify-content:flex-end; margin-top:1.5rem;">
            <button type="button" class="btn btn-primary next-step-btn" data-next="2">Next: Knowledge & Goals →</button>
          </div>
        </div>

        <!-- Step 2: Knowledge and Goals -->
        <div class="step-section" id="step-2" style="display:${currentStep === 2 ? 'block' : 'none'};">
          <h3 style="font-family:var(--font-display); font-size:1.15rem; margin-bottom:1rem; color:#f8fafc;">
            Block B: Knowledge, Goals, and Device Context
          </h3>

          <div style="margin-bottom:1.25rem;">
            <label style="display:block; font-size:0.9rem; font-weight:600; margin-bottom:0.5rem;">
              Current familiarity with Normal Distribution:
            </label>
            <select id="self_level" class="card" style="width:100%; padding:0.6rem; color:#f8fafc; background:var(--card-subtle-bg);">
              <option value="novice" ${knowledge.self_level === 'novice' ? 'selected' : ''}>Novice: Brand new to standard deviations and z-scores</option>
              <option value="some_background" ${knowledge.self_level === 'some_background' ? 'selected' : ''}>Some background: Remember the bell curve, need a refresher</option>
              <option value="experienced" ${knowledge.self_level === 'experienced' ? 'selected' : ''}>Experienced: Comfortable with calculations, ready for challenge</option>
            </select>
          </div>

          <div style="margin-bottom:1.25rem;">
            <label style="display:block; font-size:0.9rem; font-weight:600; margin-bottom:0.5rem;">
              Primary device for this session:
            </label>
            <select id="device" class="card" style="width:100%; padding:0.6rem; color:#f8fafc; background:var(--card-subtle-bg);">
              <option value="phone" ${context.device === 'phone' ? 'selected' : ''}>Smartphone (Micro-chunked layout)</option>
              <option value="laptop" ${context.device === 'laptop' ? 'selected' : ''}>Laptop or Desktop</option>
              <option value="both" ${context.device === 'both' ? 'selected' : ''}>Both</option>
            </select>
          </div>

          <div style="margin-bottom:1.25rem;">
            <label style="display:block; font-size:0.9rem; font-weight:600; margin-bottom:0.5rem;">
              Typical continuous focus window (minutes):
            </label>
            <input type="number" id="typical_focus_minutes" value="${context.typical_focus_minutes || 20}" min="5" max="90" class="card" style="width:120px; padding:0.5rem; color:#f8fafc; background:var(--card-subtle-bg);">
            <small style="font-size:0.75rem; color:var(--text-dim); display:block; margin-top:0.3rem;">Used to split long lessons into comfortable checkpoints.</small>
          </div>

          <div style="display:flex; justify-content:space-between; margin-top:1.5rem;">
            <button type="button" class="btn btn-secondary prev-step-btn" data-prev="1">← Back</button>
            <button type="button" class="btn btn-primary next-step-btn" data-next="3">Next: Strategies →</button>
          </div>
        </div>

        <!-- Step 3: Metacognitive Strategies (Likert 1 to 5) -->
        <div class="step-section" id="step-3" style="display:${currentStep === 3 ? 'block' : 'none'};">
          <h3 style="font-family:var(--font-display); font-size:1.15rem; margin-bottom:0.5rem; color:#f8fafc;">
            Block C: Learning Strategies
          </h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
            Rate how frequently you use these learning strategies (1 = Rarely, 5 = Very Frequently).
          </p>

          <div class="likert-group">
            <div class="likert-title">1. I test myself without looking at notes while studying:</div>
            <div class="likert-options">
              ${[1, 2, 3, 4, 5].map(val => `
                <label class="likert-label">
                  <input type="radio" name="self_tests" value="${val}" ${(strategies.self_tests || 2) === val ? 'checked' : ''}>
                  <span>${val}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="likert-group">
            <div class="likert-title">2. I set a specific goal before starting each study block:</div>
            <div class="likert-options">
              ${[1, 2, 3, 4, 5].map(val => `
                <label class="likert-label">
                  <input type="radio" name="sets_goal" value="${val}" ${(strategies.sets_goal || 3) === val ? 'checked' : ''}>
                  <span>${val}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="likert-group">
            <div class="likert-title">3. I explain concepts aloud or write them in my own words:</div>
            <div class="likert-options">
              ${[1, 2, 3, 4, 5].map(val => `
                <label class="likert-label">
                  <input type="radio" name="explains_aloud_or_write" value="${val}" ${(strategies.explains_aloud_or_write || 3) === val ? 'checked' : ''}>
                  <span>${val}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; margin-top:1.5rem;">
            <button type="button" class="btn btn-secondary prev-step-btn" data-prev="2">← Back</button>
            <button type="button" class="btn btn-primary next-step-btn" data-next="4">Next: Start Order →</button>
          </div>
        </div>

        <!-- Step 4: Engagement Start Order -->
        <div class="step-section" id="step-4" style="display:${currentStep === 4 ? 'block' : 'none'};">
          <h3 style="font-family:var(--font-display); font-size:1.15rem; margin-bottom:0.5rem; color:#f8fafc;">
            Block D: Engagement Start Order
          </h3>
          <p style="font-size:0.875rem; color:#38bdf8; margin-bottom:1rem;">
            Which format helps you start engaging with a new topic? (Reorder to reflect what helps you begin. This does not label your learning style; other formats stay open.)
          </p>

          <div class="order-list" id="start-order-list">
            ${startOrder.map((key, idx) => `
              <div class="order-item" data-key="${key}">
                <span style="display:flex; align-items:center; gap:0.5rem;">
                  <strong style="color:var(--accent-cyan); font-size:0.85rem;">#${idx + 1}</strong>
                  <span style="font-size:0.9rem; color:#f8fafc;">${friendlyOrderLabels[key] || key}</span>
                </span>
                <div class="order-controls">
                  <button type="button" class="order-btn move-up" ${idx === 0 ? 'disabled' : ''}>▲</button>
                  <button type="button" class="order-btn move-down" ${idx === startOrder.length - 1 ? 'disabled' : ''}>▼</button>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex; justify-content:space-between; margin-top:1.5rem;">
            <button type="button" class="btn btn-secondary prev-step-btn" data-prev="3">← Back</button>
            <button type="submit" class="btn btn-primary" id="save-intake-btn">Save Profile & Begin →</button>
          </div>
        </div>
      </form>
    </div>
  `;
}

export function setupIntakeViewHandlers(container, onComplete) {
  // Step navigation buttons
  container.querySelectorAll('.next-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.getAttribute('data-next'), 10);
      setStep(next, container);
    });
  });

  container.querySelectorAll('.prev-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prev = parseInt(btn.getAttribute('data-prev'), 10);
      setStep(prev, container);
    });
  });

  // Reorder start order items
  const orderList = container.querySelector('#start-order-list');
  if (orderList) {
    orderList.addEventListener('click', e => {
      const btn = e.target.closest('.order-btn');
      if (!btn) return;
      const item = btn.closest('.order-item');
      if (btn.classList.contains('move-up') && item.previousElementSibling) {
        orderList.insertBefore(item, item.previousElementSibling);
        refreshOrderNumbers(orderList);
      } else if (btn.classList.contains('move-down') && item.nextElementSibling) {
        orderList.insertBefore(item.nextElementSibling, item);
        refreshOrderNumbers(orderList);
      }
    });
  }

  // Form submission
  const form = container.querySelector('#intake-form');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const saveBtn = container.querySelector('#save-intake-btn');
      if (saveBtn) saveBtn.textContent = 'Saving Profile...';

      const items = Array.from(orderList.querySelectorAll('.order-item')).map(el => el.getAttribute('data-key'));

      const profilePayload = {
        access: {
          first_format_preference: container.querySelector('#first_format_preference').value,
          reading_load: container.querySelector('#reading_load').value,
          captions_needed: container.querySelector('#captions_needed').checked,
          larger_text: container.querySelector('#larger_text').checked,
          extra_time: container.querySelector('#extra_time').checked
        },
        context: {
          device: container.querySelector('#device').value,
          typical_focus_minutes: parseInt(container.querySelector('#typical_focus_minutes').value, 10) || 20
        },
        knowledge: {
          topic_id: 'normal_distribution',
          self_level: container.querySelector('#self_level').value
        },
        strategies: {
          self_tests: parseInt(form.querySelector('input[name="self_tests"]:checked')?.value || '2', 10),
          sets_goal: parseInt(form.querySelector('input[name="sets_goal"]:checked')?.value || '3', 10),
          explains_aloud_or_write: parseInt(form.querySelector('input[name="explains_aloud_or_write"]:checked')?.value || '3', 10)
        },
        engagement_start_order: items
      };

      // Save locally to IndexedDB immediately
      await saveProfileDraft(profilePayload);

      // Push to BFF server
      await updateCurrentProfile(profilePayload);

      // Apply immediate a11y classes
      if (profilePayload.access.larger_text) {
        document.body.classList.add('larger-text');
      } else {
        document.body.classList.remove('larger-text');
      }

      currentStep = 1;
      if (onComplete) onComplete();
    });
  }
}

function setStep(stepNum, container) {
  currentStep = stepNum;
  container.querySelectorAll('.step-section').forEach(sec => sec.style.display = 'none');
  const target = container.querySelector(`#step-${stepNum}`);
  if (target) target.style.display = 'block';

  container.querySelectorAll('.step-item').forEach((item, idx) => {
    item.classList.remove('active', 'completed');
    if (idx + 1 === stepNum) item.classList.add('active');
    else if (idx + 1 < stepNum) item.classList.add('completed');
  });
}

function refreshOrderNumbers(orderList) {
  const items = orderList.querySelectorAll('.order-item');
  items.forEach((item, idx) => {
    const numEl = item.querySelector('strong');
    if (numEl) numEl.textContent = `#${idx + 1}`;
    const upBtn = item.querySelector('.move-up');
    const downBtn = item.querySelector('.move-down');
    if (upBtn) upBtn.disabled = idx === 0;
    if (downBtn) downBtn.disabled = idx === items.length - 1;
  });
}
