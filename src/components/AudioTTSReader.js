/**
 * Accessible Audio Speech Synthesis Reader
 * 100% on-device client API. Zero cloud calls. Zero model tokens.
 */

let activeUtterance = null;

export function renderTTSButton(blockId, textToRead) {
  return `
    <button class="btn btn-secondary btn-sm tts-btn" data-block-id="${blockId}" data-text="${encodeURIComponent(textToRead)}" title="Read text aloud using device speech synthesis">
      <span class="tts-icon">🔊</span>
      <span class="tts-label">Listen</span>
    </button>
  `;
}

export function setupTTSHandlers(container) {
  container.querySelectorAll('.tts-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = decodeURIComponent(btn.getAttribute('data-text'));
      const label = btn.querySelector('.tts-label');
      const icon = btn.querySelector('.tts-icon');

      if (!('speechSynthesis' in window)) {
        alert('Speech synthesis is not supported on this browser.');
        return;
      }

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        label.textContent = 'Listen';
        icon.textContent = '🔊';
        return;
      }

      activeUtterance = new SpeechSynthesisUtterance(text);
      activeUtterance.rate = 1.0;
      activeUtterance.pitch = 1.0;

      activeUtterance.onstart = () => {
        label.textContent = 'Stop';
        icon.textContent = '⏹️';
      };

      activeUtterance.onend = () => {
        label.textContent = 'Listen';
        icon.textContent = '🔊';
      };

      activeUtterance.onerror = () => {
        label.textContent = 'Listen';
        icon.textContent = '🔊';
      };

      window.speechSynthesis.speak(activeUtterance);
    });
  });
}
