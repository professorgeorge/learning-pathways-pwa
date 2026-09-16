/**
 * UDL Format Tray Component
 * Ensures complementary representations remain easily accessible.
 * Adaptation sorts and highlights; it never locks out other modalities.
 */

import { renderTTSButton } from './AudioTTSReader.js';

export function renderFormatTray(alternateBlocks = [], needsAudioNotice = false) {
  if (!alternateBlocks || alternateBlocks.length === 0) {
    return '';
  }

  const itemsHtml = alternateBlocks.map(block => {
    let contentSnippet = '';
    let badgeText = block.type;

    if (block.type === 'explanation') {
      badgeText = block.reading_level === 'standard' ? 'Standard Academic Reading' : 'Plain Language Reading';
      contentSnippet = `
        <div style="font-size:0.9rem; color:#cbd5e1; white-space:pre-line; margin-top:0.5rem;">
          ${block.text}
        </div>
        <div style="margin-top:0.75rem;">
          ${renderTTSButton(block.id, block.text)}
        </div>
      `;
    } else if (block.type === 'audio') {
      badgeText = 'Audio Walkthrough';
      contentSnippet = `
        <div style="font-size:0.875rem; color:#cbd5e1; margin-top:0.5rem; background:rgba(0,0,0,0.2); padding:0.75rem; border-radius:6px;">
          <strong>Transcript:</strong> ${block.transcript || 'Audio transcript available.'}
        </div>
        <div style="margin-top:0.75rem;">
          ${renderTTSButton(block.id, block.transcript || '')}
        </div>
      `;
    } else if (block.type === 'diagram') {
      badgeText = 'Visual Diagram';
      contentSnippet = `
        <div class="diagram-wrapper" style="margin-top:0.75rem;">
          ${block.svg_code || ''}
        </div>
        <p style="font-size:0.8rem; color:#94a3b8; margin-top:0.4rem;">
          <strong>Alt Description:</strong> ${block.alt}
        </p>
      `;
    } else if (block.type === 'video') {
      badgeText = 'Video Walkthrough';
      contentSnippet = `
        <div style="margin-top:0.75rem;">
          <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:0.5rem;">Captioned video preview:</p>
          <video controls width="100%" style="border-radius:8px; max-height:240px; background:#000;" src="${block.url}">
            <track label="English" kind="subtitles" srclang="en" src="${block.captions_url}" default>
            Your browser does not support HTML5 video.
          </video>
          <p style="font-size:0.8rem; color:#cbd5e1; margin-top:0.5rem;"><strong>Transcript:</strong> ${block.transcript}</p>
        </div>
      `;
    }

    return `
      <div class="card" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:0.95rem; color:#f8fafc;">${block.title || 'Alternative Format'}</strong>
          <span class="block-badge" style="background:rgba(99,102,241,0.2); color:#a5b4fc;">${badgeText}</span>
        </div>
        ${contentSnippet}
      </div>
    `;
  }).join('');

  return `
    <section class="format-tray" aria-label="Universal Design for Learning Alternative Formats">
      ${needsAudioNotice ? `
        <div style="background:rgba(6, 182, 212, 0.15); border:1px solid rgba(6, 182, 212, 0.3); border-radius:8px; padding:0.75rem 1rem; margin-bottom:1rem; font-size:0.875rem; color:#67e8f9;">
          🎧 <strong>Accessibility match:</strong> Additional audio and simplified versions are highlighted below according to your access preferences.
        </div>
      ` : ''}

      <button id="tray-toggle-btn" class="tray-toggle" aria-expanded="false">
        <span style="display:flex; align-items:center; gap:0.5rem;">
          <span>✨</span>
          <span>Explore Alternative Formats (${alternateBlocks.length} representations available)</span>
        </span>
        <span id="tray-toggle-icon">▼</span>
      </button>

      <div id="tray-content" class="tray-content">
        <p style="font-size:0.825rem; color:var(--text-dim); margin-bottom:0.5rem;">
          Universal Design for Learning (UDL) principle: You can access and compare any format at any time.
        </p>
        ${itemsHtml}
      </div>
    </section>
  `;
}

export function setupFormatTrayHandlers(container, onEvent) {
  const toggleBtn = container.querySelector('#tray-toggle-btn');
  const trayContent = container.querySelector('#tray-content');
  const toggleIcon = container.querySelector('#tray-toggle-icon');

  if (toggleBtn && trayContent) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = trayContent.classList.contains('open');
      if (isOpen) {
        trayContent.classList.remove('open');
        toggleIcon.textContent = '▼';
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        trayContent.classList.add('open');
        toggleIcon.textContent = '▲';
        toggleBtn.setAttribute('aria-expanded', 'true');
        if (onEvent) {
          onEvent({
            type: 'view',
            block_id: 'udl_format_tray',
            block_type: 'format_tray'
          });
        }
      }
    });
  }
}
