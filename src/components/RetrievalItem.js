/**
 * Retrieval Item Component
 * Low-stakes retrieval practice with feedback and hint telemetry.
 */

export function renderRetrievalItem(block, index = 1) {
  const isGated = !!block.gated;
  const isTransfer = block.type === 'transfer_item' || block.transfer;

  if (isGated) {
    return `
      <div class="card block-container" id="${block.id}" data-block-type="${block.type}" style="opacity:0.75; border:1px dashed var(--accent-amber);">
        <div class="block-header">
          <h3 class="block-title">
            <span>🔒</span> ${isTransfer ? 'Transfer Challenge (Gated)' : `Question ${index}`}
          </h3>
          <span class="block-badge" style="background:rgba(245, 158, 11, 0.2); color:#fde68a;">Locked</span>
        </div>
        <p style="font-size:0.9rem; color:#cbd5e1; margin-top:0.5rem;">
          ${block.gated_reason || 'Complete the earlier retrieval questions to unlock this challenge.'}
        </p>
      </div>
    `;
  }

  const optionsHtml = (block.options || []).map((opt, i) => `
    <button class="quiz-option" data-option-index="${i}">
      ${opt}
    </button>
  `).join('');

  return `
    <div class="card block-container" id="${block.id}" data-block-type="${block.type}" data-correct-index="${block.correct_index}">
      <div class="block-header">
        <h3 class="block-title">
          <span>${isTransfer ? '🎯' : '❓'}</span> ${isTransfer ? 'Transfer Application' : `Check Understanding (${index})`}
        </h3>
        <span class="block-badge" style="background:${isTransfer ? 'rgba(244, 63, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)'}; color:${isTransfer ? '#f43f5e' : '#818cf8'};">
          ${isTransfer ? 'Transfer' : 'Retrieval'}
        </span>
      </div>

      ${block.scaffold_prompt ? `
        <div style="font-size:0.85rem; color:#a5b4fc; background:rgba(99, 102, 241, 0.1); padding:0.6rem 0.8rem; border-radius:6px; margin-bottom:0.75rem; border-left:3px solid #6366f1;">
          💡 <strong>Strategy tip:</strong> ${block.scaffold_prompt}
        </div>
      ` : ''}

      <p style="font-size:0.95rem; font-weight:500; color:#f8fafc; margin-bottom:1rem; line-height:1.5;">
        ${block.stem}
      </p>

      <div class="quiz-options">
        ${optionsHtml}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
        ${block.hint ? `
          <button class="btn btn-secondary btn-sm hint-toggle-btn" style="font-size:0.8rem;">
            💡 Need a hint?
          </button>
        ` : '<div></div>'}
        <span class="quiz-status" style="font-size:0.8rem; color:var(--text-dim);"></span>
      </div>

      ${block.hint ? `
        <div class="hint-box" style="display:none;">
          <strong>Hint:</strong> ${block.hint}
        </div>
      ` : ''}

      <div class="quiz-feedback" style="display:none;" data-raw-explanation="${encodeURIComponent(block.explanation || '')}"></div>
    </div>
  `;
}

export function setupRetrievalHandlers(container, onEvent) {
  container.querySelectorAll('.block-container[data-block-type="retrieval_item"], .block-container[data-block-type="transfer_item"]').forEach(card => {
    const blockId = card.id;
    const blockType = card.getAttribute('data-block-type');
    const correctIndex = parseInt(card.getAttribute('data-correct-index'), 10);
    const options = card.querySelectorAll('.quiz-option');
    const feedbackBox = card.querySelector('.quiz-feedback');
    const hintBtn = card.querySelector('.hint-toggle-btn');
    const hintBox = card.querySelector('.hint-box');

    let answered = false;

    // Hint toggle handler
    if (hintBtn && hintBox) {
      hintBtn.addEventListener('click', () => {
        const isHidden = hintBox.style.display === 'none';
        hintBox.style.display = isHidden ? 'block' : 'none';
        hintBtn.textContent = isHidden ? 'Hide hint' : '💡 Need a hint?';

        if (isHidden && onEvent) {
          onEvent({
            type: 'hint',
            block_id: blockId,
            block_type: blockType
          });
        }
      });
    }

    // Option select handler
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        const selectedIndex = parseInt(opt.getAttribute('data-option-index'), 10);
        const isCorrect = selectedIndex === correctIndex;

        options.forEach((btn, idx) => {
          btn.disabled = true;
          if (idx === correctIndex) {
            btn.classList.add('correct');
          } else if (idx === selectedIndex) {
            btn.classList.add('incorrect');
          }
        });

        if (feedbackBox) {
          const explanation = decodeURIComponent(feedbackBox.getAttribute('data-raw-explanation'));
          feedbackBox.style.display = 'block';
          feedbackBox.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
          feedbackBox.innerHTML = `
            <strong>${isCorrect ? '✓ Correct!' : '✗ Not quite.'}</strong> ${explanation}
          `;
        }

        if (onEvent) {
          onEvent({
            type: 'answer',
            block_id: blockId,
            block_type: blockType,
            selected_index: selectedIndex,
            is_correct: isCorrect
          });
        }
      });
    });
  });
}
