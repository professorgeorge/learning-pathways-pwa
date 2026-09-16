/**
 * Navigation Bar Component
 * Displays logo, active route tabs, offline indicator, and student/instructor switch.
 */

export function renderNavbar(currentPath, user, isOffline = false) {
  const isInstructor = user?.role === 'instructor';

  return `
    <header class="app-header">
      <a href="#/" class="logo-area" aria-label="Pathways Home">
        <svg class="logo-icon" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="80" fill="url(#bg)" opacity="0.3"/>
          <path d="M 46,136 C 60,70 120,60 146,100" fill="none" stroke="#818cf8" stroke-width="12" stroke-linecap="round"/>
          <path d="M 52,70 C 86,120 130,126 144,60" fill="none" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"/>
        </svg>
        <span class="logo-text">Pathways</span>
      </a>

      <nav aria-label="Main Navigation">
        <ul class="nav-links">
          <li><a href="#/" class="nav-link ${currentPath === '/' ? 'active' : ''}">Overview</a></li>
          <li><a href="#/intake" class="nav-link ${currentPath === '/intake' ? 'active' : ''}">Intake</a></li>
          <li><a href="#/today" class="nav-link ${currentPath === '/today' ? 'active' : ''}">Today</a></li>
          <li><a href="#/practice" class="nav-link ${currentPath === '/practice' ? 'active' : ''}">Practice</a></li>
          <li><a href="#/progress" class="nav-link ${currentPath === '/progress' ? 'active' : ''}">Mastery</a></li>
          <li><a href="#/settings" class="nav-link ${currentPath === '/settings' ? 'active' : ''}">Settings</a></li>
          ${isInstructor ? `<li><a href="#/instructor" class="nav-link ${currentPath === '/instructor' ? 'active' : ''}" style="color:#f59e0b;">Instructor</a></li>` : ''}
        </ul>
      </nav>

      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <span id="offline-pill" class="offline-pill ${isOffline ? 'visible' : ''}">Offline Mode</span>
        <button id="role-toggle-btn" class="role-badge" title="Click to toggle between Student and Instructor modes">
          ${isInstructor ? 'Role: Instructor' : 'Role: Student'}
        </button>
      </div>
    </header>

    <!-- Mobile Bottom Navigation -->
    <nav class="bottom-nav" aria-label="Mobile Navigation">
      <a href="#/today" class="bottom-nav-item ${currentPath === '/today' ? 'active' : ''}">
        <span style="font-size:1.2rem;">📚</span>
        <span>Today</span>
      </a>
      <a href="#/practice" class="bottom-nav-item ${currentPath === '/practice' ? 'active' : ''}">
        <span style="font-size:1.2rem;">⚡</span>
        <span>Practice</span>
      </a>
      <a href="#/progress" class="bottom-nav-item ${currentPath === '/progress' ? 'active' : ''}">
        <span style="font-size:1.2rem;">🎯</span>
        <span>Mastery</span>
      </a>
      <a href="#/settings" class="bottom-nav-item ${currentPath === '/settings' ? 'active' : ''}">
        <span style="font-size:1.2rem;">⚙️</span>
        <span>Settings</span>
      </a>
    </nav>
  `;
}
