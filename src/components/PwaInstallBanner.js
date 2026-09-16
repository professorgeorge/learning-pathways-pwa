/**
 * PWA Install Banner Component
 * Intercepts beforeinstallprompt to offer home-screen installation.
 */

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.display = 'flex';
  }
});

export function renderInstallBanner() {
  return `
    <div id="pwa-install-banner" class="card" style="display:none; align-items:center; justify-content:space-between; background:linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%); border:1px solid rgba(99, 102, 241, 0.4); margin-bottom:1.5rem; padding:1rem 1.25rem;">
      <div style="display:flex; align-items:center; gap:0.85rem;">
        <span style="font-size:1.8rem;">📲</span>
        <div>
          <strong style="font-size:0.95rem; color:#ffffff;">Install Pathways App</strong>
          <p style="font-size:0.8rem; color:#cbd5e1; margin-top:0.2rem;">
            Install to your device for offline study on campus Wi-Fi.
          </p>
        </div>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button id="pwa-install-btn" class="btn btn-primary btn-sm">Install</button>
        <button id="pwa-dismiss-btn" class="btn btn-secondary btn-sm">Dismiss</button>
      </div>
    </div>
  `;
}

export function setupInstallBannerHandlers(container) {
  const installBtn = container.querySelector('#pwa-install-btn');
  const dismissBtn = container.querySelector('#pwa-dismiss-btn');
  const banner = container.querySelector('#pwa-install-banner');

  if (installBtn && banner) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          banner.style.display = 'none';
        }
        deferredPrompt = null;
      } else {
        alert('To install on iOS, tap the Share icon and select "Add to Home Screen".');
      }
    });
  }

  if (dismissBtn && banner) {
    dismissBtn.addEventListener('click', () => {
      banner.style.display = 'none';
    });
  }
}
