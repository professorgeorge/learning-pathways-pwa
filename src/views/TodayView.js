/**
 * Today View
 * Shows the student's personalized pathway queue based on active conditions and evidence.
 */

export function renderTodayView(profile = {}, activity = {}) {
  const access = profile.access || {};
  const knowledge = profile.knowledge || {};
  const context = profile.context || {};
  const evidence = profile.evidence_overlay || {};

  const appliedPolicies = activity.meta?.applied_policies || [];
  const policyDescriptions = {
    'lead_worked_example_gate_transfer': 'Novice Scaffolding: Lead with worked example before testing; transfer challenge gated.',
    'plain_language_explanation': 'Reading Load Adaptation: Plain-language summary prioritized with audio TTS available.',
    'increase_difficulty_challenge': 'Evidence Uplift: Strong recent accuracy (80%+) unlocked challenge level.',
    'phone_micro_chunking': 'Context Adaptation: Short focus window formatted for mobile device.',
    'hint_rate_insert_worked_example': 'Performance Overlay: Worked example reinforced before retrieval.'
  };

  return `
    <div class="view-container">
      <div style="margin-bottom:1.5rem;">
        <span class="block-badge" style="background:rgba(16, 185, 129, 0.15); color:#34d399; margin-bottom:0.5rem; display:inline-block;">
          Personalized Pathway
        </span>
        <h2 style="font-family:var(--font-display); font-size:1.6rem; color:#f8fafc; margin-bottom:0.25rem;">
          Today's Learning Queue
        </h2>
        <p style="font-size:0.9rem; color:var(--text-muted);">
          Your daily pathway adapts to your learner conditions profile and real-time performance.
        </p>
      </div>

      <!-- Live Conditions & Evidence Telemetry Card -->
      <div class="card" style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(17, 24, 39, 0.8) 100%); border:1px solid rgba(99, 102, 241, 0.3); margin-bottom:1.5rem;">
        <h3 style="font-family:var(--font-display); font-size:1.05rem; color:#f8fafc; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
          <span>⚡</span> Active Learner Conditions & Evidence Overlay
        </h3>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem; margin-bottom:1rem;">
          <div style="background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Knowledge Level</div>
            <div style="font-weight:600; color:#cbd5e1; text-transform:capitalize;">${knowledge.self_level || 'Novice'}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Reading Load</div>
            <div style="font-weight:600; color:#cbd5e1;">${access.reading_load === 'easy' ? 'Standard Academic' : 'Plain Summary'}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Device & Focus</div>
            <div style="font-weight:600; color:#cbd5e1; text-transform:capitalize;">${context.device || 'Phone'} (${context.typical_focus_minutes || 20}m)</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Recent Accuracy</div>
            <div style="font-weight:600; color:#38bdf8;">${Math.round((evidence.retrieval_accuracy_recent || 0) * 100)}%</div>
          </div>
        </div>

        ${appliedPolicies.length > 0 ? `
          <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:0.75rem;">
            <div style="font-size:0.8rem; font-weight:600; color:#a5b4fc; margin-bottom:0.4rem;">
              Adaptations applied for this session:
            </div>
            <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.35rem;">
              ${appliedPolicies.map(p => `
                <li style="font-size:0.825rem; color:#cbd5e1; display:flex; align-items:center; gap:0.4rem;">
                  <span style="color:var(--accent-emerald);">✓</span>
                  <span>${policyDescriptions[p] || p}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>

      <!-- Recommended Next Activity Card -->
      <div class="card" style="border-left:4px solid var(--accent-cyan);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <div>
            <span class="block-badge" style="margin-bottom:0.4rem; display:inline-block;">Current Focus Topic</span>
            <h3 style="font-family:var(--font-display); font-size:1.25rem; color:#ffffff;">
              Standard Deviation & The Normal Distribution
            </h3>
          </div>
          <span class="block-badge" style="background:rgba(6, 182, 212, 0.2); color:#22d3ee; text-transform:capitalize;">
            ${activity.difficulty || 'Intermediate'}
          </span>
        </div>

        <p style="font-size:0.9rem; color:#cbd5e1; line-height:1.5; margin-bottom:1.25rem;">
          ${activity.learning_objective || 'Calculate and interpret z-scores and the Empirical Rule to evaluate spread.'}
        </p>

        <div style="background:rgba(255,255,255,0.03); padding:0.85rem; border-radius:8px; margin-bottom:1.25rem; font-size:0.85rem; color:#94a3b8;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
            <span>Estimated time: 15 minutes</span>
            <span>Includes: Concept + Visual Diagram + Retrieval Practice + Transfer Challenge</span>
          </div>
          <div style="color:#a5b4fc;">
            💡 All alternate representations remain available in the UDL Format Tray.
          </div>
        </div>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <a href="#/activity/obj_normal_dist_core" class="btn btn-primary" style="flex:1;">
            Launch Adaptive Activity →
          </a>
          <a href="#/practice" class="btn btn-secondary">
            Quick Retrieval Practice
          </a>
        </div>
      </div>
    </div>
  `;
}
