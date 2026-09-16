/**
 * Worked Example Component
 * Cognitive scaffolding with sequential step reveals and reflection prompts.
 */

export function renderWorkedExample(block) {
  const stepsHtml = (block.steps || []).map(step => `
    <div class="step-card">
      <div class="step-card-title">Step ${step.step_number}: ${step.heading}</div>
      <div class="step-card-text">${step.explanation}</div>
    </div>
  `).join('');

  return `
    <div class="card block-container" id="${block.id}" data-block-type="worked_example">
      <div class="block-header">
        <h3 class="block-title">
          <span>💡</span> ${block.title || 'Worked Example'}
        </h3>
        <span class="block-badge" style="background:rgba(6, 182, 212, 0.15); color:#38bdf8;">Scaffolded Steps</span>
      </div>

      <div style="font-size:0.95rem; font-weight:600; margin-bottom:1rem; color:#e2e8f0; line-height:1.5;">
        ${block.problem_statement}
      </div>

      <div class="worked-steps">
        ${stepsHtml}
      </div>

      ${block.reflection_prompt ? `
        <div class="reflection-box">
          <strong>Self-Reflection:</strong> ${block.reflection_prompt}
        </div>
      ` : ''}
    </div>
  `;
}
