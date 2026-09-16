/**
 * Instructor & Operator Portal View
 * Enables educators to monitor UDL health metrics, trigger server-only AI variant jobs,
 * and review/approve drafts before they are served to students.
 */

import { fetchInstructorTelemetry, triggerAiDraftJob, approveDraftBlock } from '../api/client.js';

export function renderInstructorView(telemetryData = {}) {
  const cohort = telemetryData.cohort_summary || {
    active_students: 1,
    avg_retrieval_accuracy: 0.8,
    avg_hint_rate: 0.25,
    udl_format_tray_utilization_rate: 0.72
  };
  const config = telemetryData.system_config || {};
  const auditLogs = telemetryData.server_ai_audit_logs || [];

  return `
    <div class="view-container">
      <div style="margin-bottom:1.5rem;">
        <span class="block-badge" style="background:rgba(245, 158, 11, 0.2); color:#fde68a; margin-bottom:0.4rem; display:inline-block;">
          Instructor & Operator Portal
        </span>
        <h2 style="font-family:var(--font-display); font-size:1.6rem; color:#f8fafc; margin-bottom:0.35rem;">
          Learning Analytics & Content Variant Review
        </h2>
        <p style="font-size:0.9rem; color:var(--text-muted);">
          Monitor cohort Universal Design for Learning (UDL) health and supervise server-only content variant drafting.
        </p>
      </div>

      <!-- Cohort Telemetry Dashboard -->
      <div class="card" style="margin-bottom:1.5rem;">
        <h3 style="font-family:var(--font-display); font-size:1.15rem; color:#f8fafc; margin-bottom:1rem;">
          📊 Cohort UDL & Learning Telemetry
        </h3>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem;">
          <div style="background:var(--card-subtle-bg); padding:0.85rem; border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim);">Avg Retrieval Accuracy</div>
            <div style="font-size:1.4rem; font-weight:700; color:#38bdf8;">
              ${Math.round(cohort.avg_retrieval_accuracy * 100)}%
            </div>
            <div style="font-size:0.75rem; color:#a5b4fc; margin-top:0.2rem;">Empirical mastery indicator</div>
          </div>

          <div style="background:var(--card-subtle-bg); padding:0.85rem; border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim);">Avg Hint Usage</div>
            <div style="font-size:1.4rem; font-weight:700; color:#cbd5e1;">
              ${cohort.avg_hint_rate} <span style="font-size:0.8rem; font-weight:normal;">/ question</span>
            </div>
            <div style="font-size:0.75rem; color:#cbd5e1; margin-top:0.2rem;">Scaffold requirement level</div>
          </div>

          <div style="background:var(--card-subtle-bg); padding:0.85rem; border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim);">UDL Tray Utilization</div>
            <div style="font-size:1.4rem; font-weight:700; color:#34d399;">
              ${Math.round(cohort.udl_format_tray_utilization_rate * 100)}%
            </div>
            <div style="font-size:0.75rem; color:#a7f3d0; margin-top:0.2rem;">Students opening alternate formats</div>
          </div>
        </div>
      </div>

      <!-- Server-Only AI Adapter Supervision Panel -->
      <div class="card" style="margin-bottom:1.5rem; border-left:4px solid var(--accent-amber);">
        <h3 style="font-family:var(--font-display); font-size:1.15rem; color:#f8fafc; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
          <span>🤖</span> Server-Side AI Variant Generation (Supervised)
        </h3>

        <p style="font-size:0.875rem; color:#cbd5e1; line-height:1.5; margin-bottom:1rem;">
          AI generation runs strictly on the server behind human review. Student clients never interact with artificial intelligence models directly and hold zero keys.
        </p>

        <div style="display:flex; flex-wrap:wrap; gap:0.75rem; align-items:center; margin-bottom:1.25rem;">
          <select id="draft-job-type" class="card" style="padding:0.55rem; color:#f8fafc; background:var(--card-subtle-bg); margin:0;">
            <option value="plain_summary">Plain Language Summary Variant</option>
            <option value="worked_example">Scaffolded Worked Example Variant</option>
            <option value="retrieval_items">Retrieval Questions Variant</option>
          </select>

          <button id="trigger-job-btn" class="btn btn-primary btn-sm">
            Generate Draft Variant
          </button>
        </div>

        <div id="job-result-container" style="display:none; background:var(--card-subtle-bg); padding:1rem; border-radius:8px; margin-top:1rem; border:1px solid rgba(255,255,255,0.08);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong style="color:#fde68a; font-size:0.9rem;">Proposed Draft Variant (Status: Draft)</strong>
            <span id="job-status-badge" class="block-badge" style="background:rgba(245,158,11,0.2); color:#fde68a;">Draft</span>
          </div>
          <div id="job-preview-content" style="font-size:0.875rem; color:#cbd5e1; margin-bottom:1rem;"></div>
          <button id="approve-draft-btn" class="btn btn-primary btn-sm">
            ✓ Approve Variant into Curriculum Bank
          </button>
        </div>
      </div>

      <!-- Server Audit Log (Zero PII) -->
      <div class="card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08);">
        <h4 style="font-family:var(--font-display); font-size:1rem; color:#cbd5e1; margin-bottom:0.5rem;">
          Server Audit Trail (De-Identified Records Only)
        </h4>
        <p style="font-size:0.8rem; color:var(--text-dim); margin-bottom:0.75rem;">
          Confirms that all AI interactions contain zero student identifiers (no names, emails, or student IDs).
        </p>
        <div id="audit-logs-list" style="font-family:monospace; font-size:0.75rem; color:#94a3b8; max-height:160px; overflow-y:auto; background:rgba(0,0,0,0.3); padding:0.75rem; border-radius:6px;">
          ${auditLogs.length > 0 ? auditLogs.map(l => `
            <div>[${l.created_at}] Job: ${l.job_type} | Status: ${l.status} | Flags: ${l.policy_flags.join(', ')}</div>
          `).join('') : '<div>No AI generation jobs recorded yet this session.</div>'}
        </div>
      </div>
    </div>
  `;
}

export function setupInstructorViewHandlers(container) {
  const triggerBtn = container.querySelector('#trigger-job-btn');
  const jobSelect = container.querySelector('#draft-job-type');
  const resultBox = container.querySelector('#job-result-container');
  const previewContent = container.querySelector('#job-preview-content');
  const approveBtn = container.querySelector('#approve-draft-btn');

  let activeDraftBlock = null;

  if (triggerBtn) {
    triggerBtn.addEventListener('click', async () => {
      triggerBtn.disabled = true;
      triggerBtn.textContent = 'Generating Variant...';

      try {
        const jobType = jobSelect.value;
        const result = await triggerAiDraftJob(jobType, 'normal_distribution');

        if (result && result.proposed_blocks && result.proposed_blocks.length > 0) {
          activeDraftBlock = result.proposed_blocks[0];
          resultBox.style.display = 'block';

          let previewHtml = '';
          if (activeDraftBlock.type === 'explanation') {
            previewHtml = `<strong>${activeDraftBlock.title}</strong><p style="margin-top:0.3rem;">${activeDraftBlock.text}</p>`;
          } else if (activeDraftBlock.type === 'worked_example') {
            previewHtml = `<strong>${activeDraftBlock.title}</strong><p style="margin-top:0.3rem;">${activeDraftBlock.problem_statement}</p>`;
          } else if (activeDraftBlock.type === 'retrieval_item') {
            previewHtml = `<strong>${activeDraftBlock.stem}</strong><ul style="margin-top:0.3rem; padding-left:1.2rem;">${activeDraftBlock.options.map(o => `<li>${o}</li>`).join('')}</ul>`;
          }

          previewContent.innerHTML = previewHtml;
        } else {
          alert(`Generation status: ${result.status} (${result.reason || 'No blocks proposed'})`);
        }
      } catch (err) {
        alert('Job execution failed: ' + err.message);
      } finally {
        triggerBtn.disabled = false;
        triggerBtn.textContent = 'Generate Draft Variant';
      }
    });
  }

  if (approveBtn) {
    approveBtn.addEventListener('click', async () => {
      if (!activeDraftBlock) return;
      approveBtn.disabled = true;
      approveBtn.textContent = 'Approving...';

      await approveDraftBlock('obj_normal_dist_core', activeDraftBlock.id);
      approveBtn.textContent = '✓ Approved into Student Pool';
      approveBtn.classList.remove('btn-primary');
      approveBtn.classList.add('btn-secondary');
    });
  }
}
