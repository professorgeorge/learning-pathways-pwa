/**
 * Activity View: Lesson Player
 * Implements the full UDL envelope, interactive retrieval, and live telemetry updates.
 */

import { renderBlock } from '../components/BlockSwitch.js';
import { renderFormatTray, setupFormatTrayHandlers } from '../components/FormatTray.js';
import { setupRetrievalHandlers } from '../components/RetrievalItem.js';
import { setupTTSHandlers } from '../components/AudioTTSReader.js';
import { postTelemetryEvent } from '../api/client.js';

let currentChunkIndex = 0;

export function renderActivityView(activity = {}, profile = {}) {
  const isChunked = !!activity.meta?.chunking?.is_chunked;
  const blocks = activity.blocks || [];
  const chunkSize = activity.meta?.chunking?.max_blocks_per_step || 2;
  const totalChunks = isChunked ? Math.ceil(blocks.length / chunkSize) : 1;

  // Sliced blocks for chunked phone mode or all blocks
  const visibleBlocks = isChunked 
    ? blocks.slice(currentChunkIndex * chunkSize, (currentChunkIndex + 1) * chunkSize)
    : blocks;

  const blocksHtml = visibleBlocks.map((b, idx) => renderBlock(b, idx + 1)).join('');

  return `
    <div class="view-container" id="activity-root" data-object-id="${activity.object_id}" data-topic-id="${activity.topic_id}">
      <!-- Activity Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
        <div>
          <a href="#/today" style="font-size:0.85rem; color:var(--accent-primary); text-decoration:none; display:flex; align-items:center; gap:0.3rem; margin-bottom:0.4rem;">
            ← Back to Today's Pathway
          </a>
          <h2 style="font-family:var(--font-display); font-size:1.5rem; color:#f8fafc;">
            ${activity.topic_id === 'normal_distribution' ? 'Standard Deviation & The Normal Distribution' : 'Activity Lesson'}
          </h2>
          <p style="font-size:0.875rem; color:var(--text-muted); margin-top:0.2rem;">
            ${activity.learning_objective}
          </p>
        </div>
        <div style="text-align:right;">
          <span class="block-badge" style="background:rgba(99,102,241,0.2); color:#a5b4fc; text-transform:capitalize;">
            ${activity.difficulty}
          </span>
          ${activity.is_from_offline_cache ? `
            <div style="font-size:0.75rem; color:#fda4af; margin-top:0.3rem;">Loaded from offline cache</div>
          ` : ''}
        </div>
      </div>

      ${isChunked ? `
        <!-- Phone Micro-Chunking Header -->
        <div class="card" style="padding:0.75rem 1rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; background:rgba(6, 182, 212, 0.1); border:1px solid rgba(6, 182, 212, 0.3);">
          <span style="font-size:0.85rem; color:#67e8f9; font-weight:600;">
            📱 Mobile Chunk ${currentChunkIndex + 1} of ${totalChunks}
          </span>
          <span style="font-size:0.8rem; color:#cbd5e1;">
            Focus target: ${activity.meta?.chunking?.recommended_focus_minutes}m
          </span>
        </div>
      ` : ''}

      <!-- Main Served Blocks -->
      <div id="rendered-blocks-area">
        ${blocksHtml}
      </div>

      ${isChunked ? `
        <div style="display:flex; justify-content:space-between; margin:1.5rem 0;">
          <button id="prev-chunk-btn" class="btn btn-secondary" ${currentChunkIndex === 0 ? 'disabled' : ''}>
            ← Previous Step
          </button>
          ${currentChunkIndex < totalChunks - 1 ? `
            <button id="next-chunk-btn" class="btn btn-primary">
              Next Step →
            </button>
          ` : `
            <a href="#/progress" class="btn btn-primary">
              Finish Activity & View Mastery →
            </a>
          `}
        </div>
      ` : ''}

      <!-- UDL Format Tray for Alternate Representations -->
      ${renderFormatTray(activity.alternate_blocks, activity.meta?.needs_audio_notice)}

      <div style="margin-top:2.5rem; text-align:center; border-top:1px solid rgba(255,255,255,0.08); padding-top:1.5rem;">
        <a href="#/today" class="btn btn-secondary btn-sm">
          Complete and Return to Pathway
        </a>
      </div>
    </div>
  `;
}

export function setupActivityViewHandlers(container, activity, onProgressUpdate) {
  const root = container.querySelector('#activity-root');
  const objectId = root?.getAttribute('data-object-id') || activity.object_id;
  const topicId = root?.getAttribute('data-topic-id') || activity.topic_id;

  // Track telemetry event
  async function handleTelemetry(event) {
    const res = await postTelemetryEvent(objectId, topicId, event);
    if (res && res.evidence_updated && res.evidence_overlay && onProgressUpdate) {
      onProgressUpdate(res.evidence_overlay);
    }
  }

  // Setup handlers for interactive components
  setupTTSHandlers(container);
  setupFormatTrayHandlers(container, handleTelemetry);

  // Setup retrieval handlers with gating logic
  let answeredQuestions = 0;
  setupRetrievalHandlers(container, event => {
    handleTelemetry(event);

    if (event.type === 'answer') {
      answeredQuestions++;
      // If 2 questions answered, unlock any gated transfer items
      if (answeredQuestions >= 2) {
        const gatedCard = container.querySelector('.block-container[data-block-type="transfer_item"]');
        if (gatedCard && gatedCard.textContent.includes('Locked')) {
          // Re-render transfer block as unlocked
          const transferBlock = (activity.blocks || []).find(b => b.type === 'transfer_item');
          if (transferBlock) {
            transferBlock.gated = false;
            // Trigger quick re-render or notification
            const unlockNotice = document.createElement('div');
            unlockNotice.className = 'quiz-feedback correct';
            unlockNotice.style.margin = '1rem 0';
            unlockNotice.innerHTML = '🎉 <strong>Transfer Challenge Unlocked!</strong> You have demonstrated core retrieval mastery.';
            gatedCard.replaceWith(unlockNotice);
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          }
        }
      }
    }
  });

  // Chunking navigation
  const nextChunkBtn = container.querySelector('#next-chunk-btn');
  const prevChunkBtn = container.querySelector('#prev-chunk-btn');
  if (nextChunkBtn) {
    nextChunkBtn.addEventListener('click', () => {
      currentChunkIndex++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Re-render
      container.innerHTML = renderActivityView(activity);
      setupActivityViewHandlers(container, activity, onProgressUpdate);
    });
  }
  if (prevChunkBtn) {
    prevChunkBtn.addEventListener('click', () => {
      if (currentChunkIndex > 0) currentChunkIndex--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      container.innerHTML = renderActivityView(activity);
      setupActivityViewHandlers(container, activity, onProgressUpdate);
    });
  }
}
