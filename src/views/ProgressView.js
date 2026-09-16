/**
 * Progress View: Mastery Dashboard
 * Shows objective-based learning progression without learning-style badges.
 */

export function renderProgressView(progressData = {}) {
  const topics = progressData.topics || [
    {
      topic_id: 'normal_distribution',
      title: 'Standard Deviation and the Normal Distribution',
      learning_objective: 'Calculate and interpret z-scores and the Empirical Rule to evaluate spread.',
      mastery_estimate: 0.65,
      retrieval_accuracy_recent: 0.8,
      total_retrievals: 6,
      hint_rate: 0.33,
      preferred_modality_observed: 'worked_example'
    },
    {
      topic_id: 'hypothesis_testing',
      title: 'Hypothesis Testing and P-Values',
      learning_objective: 'Formulate null and alternative hypotheses and interpret p-values.',
      mastery_estimate: 0.35,
      retrieval_accuracy_recent: 0.5,
      total_retrievals: 2,
      hint_rate: 0.5,
      preferred_modality_observed: 'diagram'
    },
    {
      topic_id: 'correlation_causation',
      title: 'Correlation, Causation, and Confounding',
      learning_objective: 'Distinguish between correlation and causation by identifying confounding variables.',
      mastery_estimate: 0.2,
      retrieval_accuracy_recent: 0.0,
      total_retrievals: 0,
      hint_rate: 0.0,
      preferred_modality_observed: 'reading'
    }
  ];

  const overallMastery = progressData.overall_mastery !== undefined 
    ? Math.round(progressData.overall_mastery * 100)
    : Math.round((topics.reduce((acc, t) => acc + (t.mastery_estimate || 0), 0) / topics.length) * 100);

  const topicCardsHtml = topics.map(t => {
    const pct = Math.round((t.mastery_estimate || 0) * 100);
    const accPct = Math.round((t.retrieval_accuracy_recent || 0) * 100);

    return `
      <div class="card" style="margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
          <h4 style="font-family:var(--font-display); font-size:1.15rem; color:#f8fafc;">${t.title}</h4>
          <span style="font-weight:700; color:${pct >= 70 ? '#34d399' : '#818cf8'}; font-size:1.1rem;">
            ${pct}%
          </span>
        </div>

        <p style="font-size:0.875rem; color:#cbd5e1; line-height:1.5; margin-bottom:0.75rem;">
          <strong>Target:</strong> ${t.learning_objective}
        </p>

        <div class="mastery-meter">
          <div class="mastery-fill" style="width:${pct}%;"></div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:0.6rem; margin-top:0.85rem; font-size:0.8rem; color:var(--text-muted);">
          <div style="background:rgba(255,255,255,0.03); padding:0.5rem; border-radius:6px;">
            <span>Retrieval Accuracy:</span> <strong style="color:#38bdf8;">${accPct}%</strong>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:0.5rem; border-radius:6px;">
            <span>Questions Attempted:</span> <strong style="color:#cbd5e1;">${t.total_retrievals || 0}</strong>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:0.5rem; border-radius:6px;">
            <span>Hint Usage Rate:</span> <strong style="color:#cbd5e1;">${t.hint_rate || 0} / item</strong>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:0.5rem; border-radius:6px;">
            <span>Empirical Preceding Modality:</span> <strong style="color:#a5b4fc; text-transform:capitalize;">${(t.preferred_modality_observed || 'worked_example').replace('_', ' ')}</strong>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="view-container">
      <div style="margin-bottom:1.5rem;">
        <span class="block-badge" style="background:rgba(16, 185, 129, 0.15); color:#34d399; margin-bottom:0.4rem; display:inline-block;">
          Objective Mastery
        </span>
        <h2 style="font-family:var(--font-display); font-size:1.6rem; color:#f8fafc; margin-bottom:0.35rem;">
          Learning Mastery Dashboard
        </h2>
        <p style="font-size:0.9rem; color:var(--text-muted);">
          Tracked strictly by learning objective performance and empirical retrieval accuracy.
        </p>
      </div>

      <!-- Overall Course Progress Card -->
      <div class="card" style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%); border:1px solid rgba(99, 102, 241, 0.35); padding:1.75rem; margin-bottom:1.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h3 style="font-family:var(--font-display); font-size:1.2rem; color:#ffffff;">
            Overall Course Mastery: Data Literacy 101
          </h3>
          <span style="font-size:1.5rem; font-weight:800; color:#38bdf8;">${overallMastery}%</span>
        </div>
        <div class="mastery-meter" style="height:14px;">
          <div class="mastery-fill" style="width:${overallMastery}%;"></div>
        </div>
        <p style="font-size:0.85rem; color:#cbd5e1; margin-top:0.75rem;">
          Your pathway dynamically advances as your empirical evidence overlay updates from quiz answers, hint usage, and transfer challenge completions.
        </p>
      </div>

      <!-- Pedagogy Assurance Banner -->
      <div class="card" style="background:rgba(6, 182, 212, 0.08); border:1px solid rgba(6, 182, 212, 0.25); padding:1rem; margin-bottom:1.5rem;">
        <div style="display:flex; align-items:flex-start; gap:0.75rem;">
          <span style="font-size:1.4rem;">🛡️</span>
          <div>
            <strong style="font-size:0.9rem; color:#67e8f9;">Scientifically Grounded Evaluation</strong>
            <p style="font-size:0.825rem; color:#cbd5e1; margin-top:0.25rem; line-height:1.5;">
              Educational research shows that labeling learners as visual, auditory, or kinesthetic harms learning outcomes. Instead, we adapt scaffolding, timing, and representation sequence based on your real performance and access needs.
            </p>
          </div>
        </div>
      </div>

      <!-- Topic Mastery Breakdown -->
      <h3 style="font-family:var(--font-display); font-size:1.2rem; color:#f8fafc; margin-bottom:1rem;">
        Individual Objectives
      </h3>
      <div>
        ${topicCardsHtml}
      </div>

      <div style="text-align:center; margin-top:1.5rem;">
        <a href="#/today" class="btn btn-primary">
          Continue Learning Pathway →
        </a>
      </div>
    </div>
  `;
}
