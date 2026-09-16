/**
 * BlockSwitch Component
 * Dynamically renders content blocks according to orchestrator order.
 */

import { renderWorkedExample } from './WorkedExample.js';
import { renderRetrievalItem } from './RetrievalItem.js';
import { renderTTSButton } from './AudioTTSReader.js';

export function renderBlock(block, index = 1) {
  if (!block) return '';

  switch (block.type) {
    case 'explanation':
      return `
        <div class="card block-container" id="${block.id}" data-block-type="explanation">
          <div class="block-header">
            <h3 class="block-title">
              <span>📖</span> ${block.title || 'Concept Explanation'}
            </h3>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="block-badge">
                ${block.reading_level === 'plain' ? 'Plain Language' : 'Standard Text'}
              </span>
              ${renderTTSButton(block.id, block.text)}
            </div>
          </div>
          <div style="font-size:0.95rem; color:#cbd5e1; white-space:pre-line; line-height:1.7;">
            ${block.text}
          </div>
        </div>
      `;

    case 'diagram':
      return `
        <div class="card block-container" id="${block.id}" data-block-type="diagram">
          <div class="block-header">
            <h3 class="block-title">
              <span>📊</span> ${block.title || 'Visual Model'}
            </h3>
            <span class="block-badge" style="background:rgba(6, 182, 212, 0.15); color:#38bdf8;">Visual</span>
          </div>
          <div class="diagram-wrapper">
            ${block.svg_code || ''}
          </div>
          <p style="font-size:0.85rem; color:#94a3b8; margin-top:0.6rem; line-height:1.4;">
            <strong>Visual Description:</strong> ${block.alt}
          </p>
        </div>
      `;

    case 'worked_example':
      return renderWorkedExample(block);

    case 'audio':
      return `
        <div class="card block-container" id="${block.id}" data-block-type="audio">
          <div class="block-header">
            <h3 class="block-title">
              <span>🎧</span> ${block.title || 'Audio Explanation'}
            </h3>
            <div style="display:flex; gap:0.5rem;">
              <span class="block-badge" style="background:rgba(16, 185, 129, 0.15); color:#34d399;">Audio</span>
              ${renderTTSButton(block.id, block.transcript || '')}
            </div>
          </div>
          <div style="margin:1rem 0; padding:1rem; background:var(--card-subtle-bg); border-radius:var(--radius-sm);">
            <p style="font-size:0.875rem; color:#e2e8f0; margin-bottom:0.75rem;">
              <strong>Spoken Guide Transcript:</strong>
            </p>
            <p style="font-size:0.9rem; color:#94a3b8; line-height:1.6;">
              ${block.transcript}
            </p>
          </div>
        </div>
      `;

    case 'video':
      return `
        <div class="card block-container" id="${block.id}" data-block-type="video">
          <div class="block-header">
            <h3 class="block-title">
              <span>🎬</span> ${block.title || 'Video Demonstration'}
            </h3>
            <span class="block-badge" style="background:rgba(244, 63, 94, 0.15); color:#fb7185;">Video</span>
          </div>
          <div style="margin:1rem 0;">
            <video controls width="100%" style="border-radius:10px; max-height:280px; background:#000;" src="${block.url}">
              <track label="English" kind="subtitles" srclang="en" src="${block.captions_url}" default>
              Your browser does not support the video tag.
            </video>
            <p style="font-size:0.85rem; color:#cbd5e1; margin-top:0.75rem; line-height:1.4;">
              <strong>Captioned Transcript:</strong> ${block.transcript}
            </p>
          </div>
        </div>
      `;

    case 'retrieval_item':
      return renderRetrievalItem(block, index);

    case 'transfer_item':
      return renderRetrievalItem(block, index);

    default:
      return `<div class="card">Unknown block type: ${block.type}</div>`;
  }
}
