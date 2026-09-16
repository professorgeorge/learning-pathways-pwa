/**
 * Pathways PWA: Main Application Entry & Client Router
 */

import { fetchMe, setRole, fetchCourses, fetchCurrentProfile, fetchNextActivity, fetchProgress, fetchInstructorTelemetry } from './api/client.js';
import { renderNavbar } from './components/Navbar.js';
import { renderHomeView, setupHomeViewHandlers } from './views/HomeView.js';
import { renderIntakeView, setupIntakeViewHandlers } from './views/IntakeView.js';
import { renderTodayView } from './views/TodayView.js';
import { renderActivityView, setupActivityViewHandlers } from './views/ActivityView.js';
import { renderPracticeView, setupPracticeViewHandlers } from './views/PracticeView.js';
import { renderProgressView } from './views/ProgressView.js';
import { renderSettingsView, setupSettingsViewHandlers } from './views/SettingsView.js';
import { renderInstructorView, setupInstructorViewHandlers } from './views/InstructorView.js';
import { renderFooter } from './components/Footer.js';

let currentUser = null;
let currentProfile = null;
let currentCourses = [];
let isOffline = !navigator.onLine;

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.warn('Service Worker registration failed:', err));
  });
}

// Global connectivity tracking
window.addEventListener('online', () => {
  isOffline = false;
  updateConnectivityStatus();
});
window.addEventListener('offline', () => {
  isOffline = true;
  updateConnectivityStatus();
});

function updateConnectivityStatus() {
  const pill = document.getElementById('offline-pill');
  if (pill) {
    if (isOffline) pill.classList.add('visible');
    else pill.classList.remove('visible');
  }
}

// Global Router
async function route() {
  const hash = window.location.hash || '#/';
  const path = hash.replace(/^#/, '');

  const appEl = document.getElementById('app');
  if (!appEl) return;

  // Render App Frame
  appEl.innerHTML = `
    ${renderNavbar(path, currentUser, isOffline)}
    <main class="main-content" id="view-mount"></main>
    ${renderFooter()}
  `;

  // Attach navbar role toggle handler
  const roleToggleBtn = document.getElementById('role-toggle-btn');
  if (roleToggleBtn) {
    roleToggleBtn.addEventListener('click', async () => {
      const nextRole = currentUser?.role === 'instructor' ? 'student' : 'instructor';
      await setRole(nextRole);
      currentUser.role = nextRole;
      if (nextRole === 'instructor') {
        window.location.hash = '#/instructor';
      } else {
        window.location.hash = '#/';
      }
      route();
    });
  }

  const mount = document.getElementById('view-mount');

  // Route Dispatch
  if (path === '/' || path === '') {
    mount.innerHTML = renderHomeView(currentCourses, currentProfile);
    setupHomeViewHandlers(mount);
  } else if (path === '/intake') {
    mount.innerHTML = renderIntakeView(currentProfile);
    setupIntakeViewHandlers(mount, async () => {
      currentProfile = await fetchCurrentProfile();
      window.location.hash = '#/today';
    });
  } else if (path === '/today') {
    const activity = await fetchNextActivity('normal_distribution');
    mount.innerHTML = renderTodayView(currentProfile, activity);
  } else if (path.startsWith('/activity')) {
    const activity = await fetchNextActivity('normal_distribution');
    mount.innerHTML = renderActivityView(activity, currentProfile);
    setupActivityViewHandlers(mount, activity, updatedOverlay => {
      if (currentProfile) currentProfile.evidence_overlay = updatedOverlay;
    });
  } else if (path === '/practice') {
    mount.innerHTML = renderPracticeView();
    setupPracticeViewHandlers(mount);
  } else if (path === '/progress') {
    const progressData = await fetchProgress('stats_101');
    mount.innerHTML = renderProgressView(progressData);
  } else if (path === '/settings') {
    mount.innerHTML = renderSettingsView(currentProfile);
    setupSettingsViewHandlers(mount);
  } else if (path === '/instructor') {
    if (currentUser?.role !== 'instructor') {
      currentUser.role = 'instructor';
      await setRole('instructor');
    }
    const telemetry = await fetchInstructorTelemetry();
    mount.innerHTML = renderInstructorView(telemetry);
    setupInstructorViewHandlers(mount);
  } else {
    mount.innerHTML = `<div class="card">Page not found: ${path}</div>`;
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Initial Bootstrapping
async function init() {
  const meData = await fetchMe();
  currentUser = meData.user || { id: 'student_current', role: 'student' };
  currentProfile = await fetchCurrentProfile();
  currentCourses = await fetchCourses();

  // Apply saved accessibility preferences
  if (currentProfile?.access?.larger_text) {
    document.body.classList.add('larger-text');
  }

  window.addEventListener('hashchange', route);
  route();
}

init();
