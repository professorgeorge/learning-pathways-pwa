/**
 * Settings View
 * Accessibility controls, offline queue inspection, and privacy/FERPA notice.
 */

import { getQueuedEvents, clearQueuedEvents } from '../db/offline_store.js';
import { syncQueuedTelemetry, updateCurrentProfile } from '../api/client.js';

export function renderSettingsView(profile = {}) {
  const access = profile.access || {};

  return `
    <div class="view-container">
      <div style="margin-bottom:1.5rem;">
        <span class="block-badge" style="background:rgba(99,102,241,0.2); color:#a5b4fc; margin-bottom:0.4rem; display:inline-block;">
          Preferences & Privacy
        </span>
        <h2 style="font-family:var(--font-display); font-size:1.6rem; color:#f8fafc; margin-bottom:0.35rem;">
          Accessibility & App Settings
        </h2>
        <p style="font-size:0.9rem; color:var(--text-muted);">
          Customize your display accessibility, inspect offline synchronization, and view privacy policies.
        </p>
      </div>

      <!-- Accessibility Settings Card -->
      <div class="card" style="margin-bottom:1.5rem;">
        <h3 style="font-family:var(--font-display); font-size:1.15rem; color:#f8fafc; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
          <span>♿</span> Universal Design Accessibility Controls
        </h3>

        <div style="display:flex; flex-direction:column; gap:1rem;">
          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:0.5rem 0; border-bottom:1px solid rgba(255,255,255,0.06);">
            <div>
              <strong style="font-size:0.95rem; color:#f8fafc; display:block;">Larger Text Display</strong>
              <span style="font-size:0.8rem; color:var(--text-dim);">Scales up base text size to 20px with increased line spacing</span>
            </div>
            <input type="checkbox" id="toggle-larger-text" ${document.body.classList.contains('larger-text') || access.larger_text ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--accent-primary);">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:0.5rem 0; border-bottom:1px solid rgba(255,255,255,0.06);">
            <div>
              <strong style="font-size:0.95rem; color:#f8fafc; display:block;">High Contrast Theme</strong>
              <span style="font-size:0.8rem; color:var(--text-dim);">Enforces maximum contrast borders and solid dark backgrounds</span>
            </div>
            <input type="checkbox" id="toggle-high-contrast" ${document.body.classList.contains('high-contrast') ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--accent-primary);">
          </label>

          <div style="padding:0.5rem 0;">
            <strong style="font-size:0.95rem; color:#f8fafc; display:block; margin-bottom:0.4rem;">Speech Synthesis Audio Test</strong>
            <span style="font-size:0.8rem; color:var(--text-dim); display:block; margin-bottom:0.75rem;">100% on-device text-to-speech reader for accessibility</span>
            <button id="test-tts-btn" class="btn btn-secondary btn-sm">
              🔊 Test Speech Reader
            </button>
          </div>
        </div>
      </div>

      <!-- Offline Synchronization Card -->
      <div class="card" style="margin-bottom:1.5rem;">
        <h3 style="font-family:var(--font-display); font-size:1.15rem; color:#f8fafc; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
          <span>📡</span> Offline Storage & Telemetry Sync
        </h3>

        <p style="font-size:0.875rem; color:#cbd5e1; line-height:1.5; margin-bottom:1rem;">
          The Pathways PWA stores your intake profile and buffers your learning events in local IndexedDB storage, ensuring seamless continuity on campus Wi-Fi.
        </p>

        <div style="background:var(--card-subtle-bg); padding:0.85rem 1rem; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <div>
            <div style="font-size:0.8rem; color:var(--text-dim);">Buffered Telemetry Events</div>
            <div id="queued-count-display" style="font-size:1.1rem; font-weight:700; color:#38bdf8;">Checking...</div>
          </div>
          <button id="sync-now-btn" class="btn btn-primary btn-sm">
            Sync With Server
          </button>
        </div>
        <div id="sync-status-msg" style="font-size:0.8rem; color:var(--accent-emerald); display:none;"></div>
      </div>

      <!-- FERPA & Privacy Notice Card -->
      <div class="card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08);">
        <h3 style="font-family:var(--font-display); font-size:1.05rem; color:#cbd5e1; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
          <span>🔒</span> FERPA Compliance and Privacy Protection
        </h3>
        <p style="font-size:0.825rem; color:#94a3b8; line-height:1.6; margin-bottom:0.75rem;">
          In accordance with higher education privacy standards, your learning conditions and telemetry are classified as educational records.
        </p>
        <ul style="font-size:0.825rem; color:#94a3b8; line-height:1.6; padding-left:1.25rem;">
          <li>Your student identity (name, email, student ID) is never transmitted to external artificial intelligence vendors.</li>
          <li>Optional server-side AI generation jobs use strictly de-identified curricular slices to draft variants.</li>
          <li>All generated materials require instructor approval before inclusion in the student course bank.</li>
        </ul>

        <div style="margin-top:1.25rem;">
          <a href="#/intake" class="btn btn-secondary btn-sm">
            Re-take Learner Conditions Intake
          </a>
        </div>
      </div>
    </div>
  `;
}

export function setupSettingsViewHandlers(container) {
  // Larger text toggle
  const largerTextToggle = container.querySelector('#toggle-larger-text');
  if (largerTextToggle) {
    largerTextToggle.addEventListener('change', async e => {
      if (e.target.checked) {
        document.body.classList.add('larger-text');
      } else {
        document.body.classList.remove('larger-text');
      }
      await updateCurrentProfile({ access: { larger_text: e.target.checked } });
    });
  }

  // High contrast toggle
  const highContrastToggle = container.querySelector('#toggle-high-contrast');
  if (highContrastToggle) {
    highContrastToggle.addEventListener('change', e => {
      if (e.target.checked) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    });
  }

  // Speech reader test
  const ttsBtn = container.querySelector('#test-tts-btn');
  if (ttsBtn) {
    ttsBtn.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Accessibility test: Device speech synthesis is functioning normally.');
        window.speechSynthesis.speak(utterance);
      } else {
        alert('Device speech synthesis is not supported on this browser.');
      }
    });
  }

  // Offline queue inspector
  const countDisplay = container.querySelector('#queued-count-display');
  const syncBtn = container.querySelector('#sync-now-btn');
  const statusMsg = container.querySelector('#sync-status-msg');

  async function updateQueueDisplay() {
    const queued = await getQueuedEvents();
    if (countDisplay) {
      countDisplay.textContent = `${queued.length} events pending`;
    }
  }
  updateQueueDisplay();

  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.textContent = 'Syncing...';
      const result = await syncQueuedTelemetry();
      await updateQueueDisplay();
      syncBtn.disabled = false;
      syncBtn.textContent = 'Sync With Server';
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.textContent = `✓ Successfully synchronized ${result.synced} telemetry events.`;
        setTimeout(() => { statusMsg.style.display = 'none'; }, 4000);
      }
    });
  }
}
