// ============================================================
// JayWills Media Dashboard — Frontend App
// Talks to the Express backend at /api/*
// ============================================================

const API = '/api';
let currentUser = null;
let authToken = null;

// ── Auth helpers ──────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (res.status === 401) { logout(); return null; }
  return res;
}

async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  authToken = data.token;
  currentUser = data.user;
  return data;
}

function logout() {
  authToken = null;
  currentUser = null;
  renderLogin();
}

// ── Router ────────────────────────────────────────────────────
const routes = {
  dashboard: renderDashboard,
  sonarr: renderSonarr,
  radarr: renderRadarr,
  plex: renderPlex,
  sabnzbd: renderSABnzbd,
  overseerr: renderOverseerr,
  settings: renderSettings,
  users: renderUsers
};

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  const main = document.getElementById('main-content');
  main.innerHTML = `<div class="page-loading"><div class="spinner"></div><span>Loading…</span></div>`;
  if (routes[page]) routes[page]();
}

// ── App Shell ─────────────────────────────────────────────────
function renderShell() {
  document.getElementById('app').innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <svg aria-label="JayWills Media" viewBox="0 0 32 32" width="28" height="28" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="6" fill="#e8630a"/>
          <polygon points="12,9 24,16 12,23" fill="#fff"/>
        </svg>
        <span class="logo-text">JayWills</span>
      </div>
      <nav class="sidebar-nav" aria-label="Main navigation">
        <button class="nav-item active" data-page="dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Dashboard
        </button>
        <button class="nav-item" data-page="sonarr">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
          Sonarr
        </button>
        <button class="nav-item" data-page="radarr">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>
          Radarr
        </button>
        <button class="nav-item" data-page="plex">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          Plex
        </button>
        <button class="nav-item" data-page="sabnzbd">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>
          SABnzbd
        </button>
        <button class="nav-item" data-page="overseerr">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Overseerr
        </button>
        <div class="nav-divider"></div>
        <button class="nav-item" data-page="settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </button>
        ${currentUser?.role === 'admin' ? `
        <button class="nav-item" data-page="users">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Users
        </button>` : ''}
      </nav>
      <div class="sidebar-footer">
        <div class="user-badge">
          <div class="user-avatar">${currentUser?.username?.[0]?.toUpperCase() || 'U'}</div>
          <div class="user-info">
            <span class="user-name">${currentUser?.username || 'User'}</span>
            <span class="user-role">${currentUser?.role || 'viewer'}</span>
          </div>
        </div>
        <button class="btn-icon" id="logout-btn" aria-label="Log out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <div class="sidebar-overlay" id="sidebar-overlay"></div>

    <div class="main-wrapper">
      <header class="topbar">
        <button class="btn-icon sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="topbar-title" id="page-title">Dashboard</div>
        <div class="topbar-actions">
          <button class="btn-icon" id="refresh-btn" aria-label="Refresh page">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
        </div>
      </header>
      <main id="main-content" class="main-content"></main>
    </div>

    <nav class="mobile-nav" aria-label="Mobile navigation">
      <button class="mobile-nav-item active" data-page="dashboard">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        <span>Home</span>
      </button>
      <button class="mobile-nav-item" data-page="sonarr">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
        <span>TV</span>
      </button>
      <button class="mobile-nav-item" data-page="radarr">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>
        <span>Movies</span>
      </button>
      <button class="mobile-nav-item" data-page="plex">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Plex</span>
      </button>
      <button class="mobile-nav-item" data-page="settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span>Settings</span>
      </button>
    </nav>
  `;

  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('page-title').textContent = btn.dataset.page.charAt(0).toUpperCase() + btn.dataset.page.slice(1);
      document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`[data-page="${btn.dataset.page}"]`).forEach(b => b.classList.add('active'));
      navigate(btn.dataset.page);
      closeSidebar();
    });
  });

  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('refresh-btn').addEventListener('click', () => {
    const active = document.querySelector('.nav-item.active');
    if (active) navigate(active.dataset.page);
  });

  const toggle = document.getElementById('sidebar-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  const sidebar = document.getElementById('sidebar');
  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  overlay.addEventListener('click', closeSidebar);
  function closeSidebar() { sidebar.classList.remove('open'); }
}

// ── Login Page ────────────────────────────────────────────────
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo">
          <svg aria-label="JayWills Media" viewBox="0 0 48 48" width="48" height="48" fill="none">
            <rect x="2" y="2" width="44" height="44" rx="10" fill="#e8630a"/>
            <polygon points="18,13 36,24 18,35" fill="#fff"/>
          </svg>
          <h1>JayWills<br><span>Media Dashboard</span></h1>
        </div>
        <form id="login-form" class="login-form">
          <div class="field">
            <label for="username">Username</label>
            <input id="username" type="text" placeholder="Enter username" autocomplete="username" required />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" placeholder="Enter password" autocomplete="current-password" required />
          </div>
          <div id="login-error" class="form-error" hidden></div>
          <button type="submit" class="btn-primary btn-full" id="login-btn">Sign in</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const errEl = document.getElementById('login-error');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    errEl.hidden = true;
    try {
      await login(document.getElementById('username').value, document.getElementById('password').value);
      renderShell();
      navigate('dashboard');
    } catch (err) {
      errEl.textContent = err.message || 'Login failed';
      errEl.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  });
}

// ── Dashboard ─────────────────────────────────────────────────
async function renderDashboard() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-header"><h2>Overview</h2></div>
    <div class="kpi-grid" id="kpi-grid">
      ${['Plex','Sonarr','Radarr','SABnzbd','Overseerr'].map(s => `
        <div class="kpi-card" id="kpi-${s.toLowerCase()}">
          <div class="kpi-label">${s}</div>
          <div class="kpi-status skeleton" style="height:1.5rem;width:80%;margin-top:0.5rem;border-radius:4px;"></div>
        </div>
      `).join('')}
    </div>
    <div class="section-grid">
      <section class="card" id="recent-activity">
        <h3 class="card-title">Recent Plex Activity</h3>
        <div class="skeleton-list">${skeletonRows(4)}</div>
      </section>
      <section class="card" id="upcoming-section">
        <h3 class="card-title">Upcoming Episodes</h3>
        <div class="skeleton-list">${skeletonRows(4)}</div>
      </section>
    </div>
    <div class="card" id="queue-section">
      <h3 class="card-title">Download Queue</h3>
      <div class="skeleton-list">${skeletonRows(3)}</div>
    </div>
  `;

  const [plexRes, sonarrRes, radarrRes, sabRes, overseerrRes, calendarRes, queueRes] = await Promise.allSettled([
    apiFetch('/plex/status'),
    apiFetch('/sonarr/status'),
    apiFetch('/radarr/status'),
    apiFetch('/sabnzbd/status'),
    apiFetch('/overseerr/status'),
    apiFetch('/sonarr/calendar'),
    apiFetch('/sabnzbd/queue')
  ]);

  async function kpiUpdate(id, res, label) {
    const card = document.getElementById(`kpi-${id}`);
    if (!card) return;
    if (res.status === 'fulfilled' && res.value?.ok) {
      const data = await res.value.json();
      card.querySelector('.kpi-status').outerHTML = `<div class="kpi-value status-ok">Online</div><div class="kpi-sub">${data.version || ''}</div>`;
    } else {
      card.querySelector('.kpi-status').outerHTML = `<div class="kpi-value status-err">Offline</div>`;
    }
  }

  await kpiUpdate('plex', plexRes, 'Plex');
  await kpiUpdate('sonarr', sonarrRes, 'Sonarr');
  await kpiUpdate('radarr', radarrRes, 'Radarr');
  await kpiUpdate('sabnzbd', sabRes, 'SABnzbd');
  await kpiUpdate('overseerr', overseerrRes, 'Overseerr');

  // Recent activity
  const actEl = document.querySelector('#recent-activity .skeleton-list');
  if (plexRes.status === 'fulfilled' && plexRes.value?.ok) {
    try {
      const actRes = await apiFetch('/tautulli/recent');
      if (actRes?.ok) {
        const { data } = await actRes.json();
        const items = data?.recently_added?.slice(0,5) || [];
        actEl.innerHTML = items.length ? items.map(i => `
          <div class="list-row">
            <div class="list-thumb" style="background:#333">${i.media_type === 'episode' ? '📺' : '🎬'}</div>
            <div class="list-info">
              <div class="list-title">${i.title || i.grandparent_title || 'Unknown'}</div>
              <div class="list-sub">${i.media_type} · ${i.year || ''}</div>
            </div>
          </div>`).join('') : emptyState('No recent activity');
      } else actEl.innerHTML = emptyState('Configure Tautulli in Settings');
    } catch { actEl.innerHTML = emptyState('Could not load activity'); }
  } else actEl.innerHTML = emptyState('Plex offline or not configured');

  // Calendar
  const calEl = document.querySelector('#upcoming-section .skeleton-list');
  if (calendarRes.status === 'fulfilled' && calendarRes.value?.ok) {
    try {
      const cal = await calendarRes.value.json();
      const items = Array.isArray(cal) ? cal.slice(0,5) : [];
      calEl.innerHTML = items.length ? items.map(i => `
        <div class="list-row">
          <div class="list-info">
            <div class="list-title">${i.series?.title || 'Unknown Show'}</div>
            <div class="list-sub">S${String(i.seasonNumber).padStart(2,'0')}E${String(i.episodeNumber).padStart(2,'0')} · ${i.airDateUtc ? new Date(i.airDateUtc).toLocaleDateString() : 'TBA'}</div>
          </div>
          <div class="badge ${i.hasFile ? 'badge-ok' : 'badge-pending'}">${i.hasFile ? 'Downloaded' : 'Upcoming'}</div>
        </div>`).join('') : emptyState('No upcoming episodes');
    } catch { calEl.innerHTML = emptyState('Could not load calendar'); }
  } else calEl.innerHTML = emptyState('Sonarr offline or not configured');

  // Queue
  const queueEl = document.querySelector('#queue-section .skeleton-list');
  if (queueRes.status === 'fulfilled' && queueRes.value?.ok) {
    try {
      const q = await queueRes.value.json();
      const slots = q.slots || [];
      queueEl.innerHTML = slots.length ? `
        <div class="queue-header">
          <span>Speed: ${q.speed || '0 KB/s'}</span>
          <span>Size left: ${q.sizeleft || '0 MB'}</span>
          <span>Status: ${q.status || 'Idle'}</span>
        </div>
        ${slots.slice(0,8).map(s => `
          <div class="list-row">
            <div class="list-info">
              <div class="list-title">${s.filename || s.name || 'Unknown'}</div>
              <div class="list-sub">${s.size || ''} · ${s.status || ''}</div>
            </div>
            <div class="progress-wrap"><div class="progress-bar" style="width:${s.percentage || 0}%"></div></div>
          </div>`).join('')}
      ` : emptyState('Queue is empty');
    } catch { queueEl.innerHTML = emptyState('Could not load queue'); }
  } else queueEl.innerHTML = emptyState('SABnzbd offline or not configured');
}

// ── Sonarr ────────────────────────────────────────────────────
async function renderSonarr() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-header">
      <h2>Sonarr — TV Shows</h2>
      <div class="page-actions">
        <input type="search" id="sonarr-search" placeholder="Filter series…" class="search-input" />
      </div>
    </div>
    <div class="tabs">
      <button class="tab active" data-tab="series">Series</button>
      <button class="tab" data-tab="calendar">Calendar</button>
      <button class="tab" data-tab="queue">Queue</button>
      <button class="tab" data-tab="wanted">Wanted</button>
    </div>
    <div id="sonarr-content"><div class="page-loading"><div class="spinner"></div></div></div>
  `;

  let allSeries = [];

  async function loadTab(tab) {
    const el = document.getElementById('sonarr-content');
    el.innerHTML = `<div class="page-loading"><div class="spinner"></div></div>`;
    try {
      if (tab === 'series') {
        if (!allSeries.length) {
          const res = await apiFetch('/sonarr/series');
          allSeries = res?.ok ? await res.json() : [];
        }
        renderSeriesList(allSeries, el);
        document.getElementById('sonarr-search').oninput = e => renderSeriesList(
          allSeries.filter(s => s.title.toLowerCase().includes(e.target.value.toLowerCase())), el);
      } else if (tab === 'calendar') {
        const res = await apiFetch('/sonarr/calendar');
        const items = res?.ok ? await res.json() : [];
        el.innerHTML = items.length ? `<div class="episode-list">${items.map(episodeRow).join('')}</div>` : emptyState('No upcoming episodes');
      } else if (tab === 'queue') {
        const res = await apiFetch('/sonarr/queue');
        const data = res?.ok ? await res.json() : { records: [] };
        const records = data.records || [];
        el.innerHTML = records.length ? `<div class="episode-list">${records.map(r => `
          <div class="list-row">
            <div class="list-info">
              <div class="list-title">${r.title || 'Unknown'}</div>
              <div class="list-sub">${r.protocol || ''} · ${r.status || ''}</div>
            </div>
            <div class="progress-wrap"><div class="progress-bar" style="width:${r.sizeleft && r.size ? Math.round((1 - r.sizeleft / r.size) * 100) : 0}%"></div></div>
          </div>`).join('')}</div>` : emptyState('Queue is empty');
      } else if (tab === 'wanted') {
        const res = await apiFetch('/sonarr/wanted');
        const data = res?.ok ? await res.json() : { records: [] };
        const records = data.records || [];
        el.innerHTML = records.length ? `<div class="episode-list">${records.map(episodeRow).join('')}</div>` : emptyState('No missing episodes');
      }
    } catch { el.innerHTML = errorState('Could not connect to Sonarr'); }
  }

  function renderSeriesList(series, el) {
    el.innerHTML = series.length ? `
      <div class="series-grid">${series.map(s => `
        <div class="series-card">
          <div class="series-thumb" style="background:#1a1a1a">${s.statistics?.percentOfEpisodes === 100 ? '✓' : ''}</div>
          <div class="series-info">
            <div class="series-title">${s.title}</div>
            <div class="series-meta">${s.year} · ${s.network || 'Unknown'}</div>
            <div class="series-stats">
              <span class="badge ${s.monitored ? 'badge-ok' : 'badge-muted'}">${s.monitored ? 'Monitored' : 'Unmonitored'}</span>
              <span class="badge badge-muted">${s.statistics?.episodeFileCount || 0}/${s.statistics?.episodeCount || 0} eps</span>
            </div>
          </div>
        </div>`).join('')}
      </div>` : emptyState('No series found');
  }

  function episodeRow(i) {
    return `<div class="list-row">
      <div class="list-info">
        <div class="list-title">${i.series?.title || i.title || 'Unknown'}</div>
        <div class="list-sub">S${String(i.seasonNumber || 0).padStart(2,'0')}E${String(i.episodeNumber || 0).padStart(2,'0')} · ${i.airDateUtc ? new Date(i.airDateUtc).toLocaleDateString() : 'TBA'}</div>
      </div>
      <div class="badge ${i.hasFile ? 'badge-ok' : 'badge-warn'}">${i.hasFile ? 'Have it' : 'Missing'}</div>
    </div>`;
  }

  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      loadTab(t.dataset.tab);
    });
  });

  loadTab('series');
}

// ── Radarr ────────────────────────────────────────────────────
async function renderRadarr() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-header">
      <h2>Radarr — Movies</h2>
      <input type="search" id="radarr-search" placeholder="Filter movies…" class="search-input" />
    </div>
    <div class="tabs">
      <button class="tab active" data-tab="movies">Movies</button>
      <button class="tab" data-tab="queue">Queue</button>
      <button class="tab" data-tab="wanted">Wanted</button>
    </div>
    <div id="radarr-content"><div class="page-loading"><div class="spinner"></div></div></div>
  `;

  let allMovies = [];

  async function loadTab(tab) {
    const el = document.getElementById('radarr-content');
    el.innerHTML = `<div class="page-loading"><div class="spinner"></div></div>`;
    try {
      if (tab === 'movies') {
        if (!allMovies.length) {
          const res = await apiFetch('/radarr/movies');
          allMovies = res?.ok ? await res.json() : [];
        }
        renderMovies(allMovies, el);
        document.getElementById('radarr-search').oninput = e => renderMovies(
          allMovies.filter(m => m.title.toLowerCase().includes(e.target.value.toLowerCase())), el);
      } else if (tab === 'queue') {
        const res = await apiFetch('/radarr/queue');
        const data = res?.ok ? await res.json() : { records: [] };
        const records = data.records || [];
        el.innerHTML = records.length ? `<div class="episode-list">${records.map(r => `
          <div class="list-row">
            <div class="list-info">
              <div class="list-title">${r.title || 'Unknown'}</div>
              <div class="list-sub">${r.quality?.quality?.name || ''} · ${r.status || ''}</div>
            </div>
          </div>`).join('')}</div>` : emptyState('Queue is empty');
      } else if (tab === 'wanted') {
        const res = await apiFetch('/radarr/wanted');
        const data = res?.ok ? await res.json() : { records: [] };
        const records = data.records || [];
        el.innerHTML = records.length ? `<div class="series-grid">${records.map(m => `
          <div class="series-card">
            <div class="series-info">
              <div class="series-title">${m.title}</div>
              <div class="series-meta">${m.year}</div>
              <span class="badge badge-warn">Missing</span>
            </div>
          </div>`).join('')}</div>` : emptyState('No missing movies');
      }
    } catch { el.innerHTML = errorState('Could not connect to Radarr'); }
  }

  function renderMovies(movies, el) {
    el.innerHTML = movies.length ? `
      <div class="series-grid">${movies.map(m => `
        <div class="series-card">
          <div class="series-info">
            <div class="series-title">${m.title}</div>
            <div class="series-meta">${m.year} · ${m.studio || ''}</div>
            <div class="series-stats">
              <span class="badge ${m.hasFile ? 'badge-ok' : 'badge-muted'}">${m.hasFile ? 'Downloaded' : 'Missing'}</span>
              <span class="badge ${m.monitored ? 'badge-ok' : 'badge-muted'}">${m.monitored ? 'Monitored' : 'Unmonitored'}</span>
            </div>
          </div>
        </div>`).join('')}
      </div>` : emptyState('No movies found');
  }

  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      loadTab(t.dataset.tab);
    });
  });

  loadTab('movies');
}

// ── Plex ──────────────────────────────────────────────────────
async function renderPlex() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-header"><h2>Plex — Now Playing</h2></div>
    <div id="plex-sessions" class="card"><h3 class="card-title">Active Sessions</h3><div class="skeleton-list">${skeletonRows(3)}</div></div>
    <div id="plex-recent" class="card" style="margin-top:1.5rem"><h3 class="card-title">Recently Added</h3><div class="skeleton-list">${skeletonRows(4)}</div></div>
    <div id="plex-stats" class="card" style="margin-top:1.5rem"><h3 class="card-title">Play Stats (Last 30 Days)</h3><div class="skeleton-list">${skeletonRows(2)}</div></div>
  `;

  try {
    const [sessRes, recentRes, statsRes] = await Promise.allSettled([
      apiFetch('/tautulli/sessions'),
      apiFetch('/tautulli/recent'),
      apiFetch('/tautulli/stats')
    ]);

    const sessEl = document.querySelector('#plex-sessions .skeleton-list');
    if (sessRes.status === 'fulfilled' && sessRes.value?.ok) {
      const { data } = await sessRes.value.json();
      const sessions = data?.sessions || [];
      sessEl.innerHTML = sessions.length ? sessions.map(s => `
        <div class="list-row session-row">
          <div class="list-thumb">${s.media_type === 'episode' ? '📺' : '🎬'}</div>
          <div class="list-info">
            <div class="list-title">${s.full_title || s.title}</div>
            <div class="list-sub">${s.user} · ${s.player} · ${s.state}</div>
          </div>
          <div class="progress-wrap"><div class="progress-bar" style="width:${s.progress_percent || 0}%"></div></div>
        </div>`).join('') : emptyState('No active sessions');
    } else sessEl.innerHTML = emptyState('Tautulli not configured');

    const recentEl = document.querySelector('#plex-recent .skeleton-list');
    if (recentRes.status === 'fulfilled' && recentRes.value?.ok) {
      const { data } = await recentRes.value.json();
      const items = data?.recently_added?.slice(0,6) || [];
      recentEl.innerHTML = items.length ? items.map(i => `
        <div class="list-row">
          <div class="list-info">
            <div class="list-title">${i.title}</div>
            <div class="list-sub">${i.media_type} · ${i.year || ''}</div>
          </div>
        </div>`).join('') : emptyState('No recent items');
    } else recentEl.innerHTML = emptyState('Tautulli not configured');

    const statsEl = document.querySelector('#plex-stats .skeleton-list');
    if (statsRes.status === 'fulfilled' && statsRes.value?.ok) {
      const { data } = await statsRes.value.json();
      statsEl.innerHTML = `
        <div class="stats-row">
          <div class="stat-box"><div class="stat-value">${data?.total_plays || 0}</div><div class="stat-label">Total Plays</div></div>
          <div class="stat-box"><div class="stat-value">${data?.total_duration ? Math.round(data.total_duration / 3600) + 'h' : '0h'}</div><div class="stat-label">Watch Time</div></div>
          <div class="stat-box"><div class="stat-value">${data?.users_watched || 0}</div><div class="stat-label">Users</div></div>
        </div>`;
    } else statsEl.innerHTML = emptyState('Tautulli not configured');
  } catch { document.getElementById('plex-sessions').innerHTML = errorState('Could not connect to Tautulli'); }
}

// ── SABnzbd ───────────────────────────────────────────────────
async function renderSABnzbd() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-header"><h2>SABnzbd — Downloads</h2></div>
    <div class="kpi-grid kpi-grid-3" id="sab-kpis">
      <div class="kpi-card"><div class="kpi-label">Speed</div><div class="kpi-value skeleton" style="height:2rem;width:100px;"></div></div>
      <div class="kpi-card"><div class="kpi-label">Queue Size</div><div class="kpi-value skeleton" style="height:2rem;width:100px;"></div></div>
      <div class="kpi-card"><div class="kpi-label">Status</div><div class="kpi-value skeleton" style="height:2rem;width:100px;"></div></div>
    </div>
    <div class="card" id="sab-queue" style="margin-top:1.5rem"><h3 class="card-title">Queue</h3><div class="skeleton-list">${skeletonRows(4)}</div></div>
    <div class="card" id="sab-history" style="margin-top:1.5rem"><h3 class="card-title">History</h3><div class="skeleton-list">${skeletonRows(4)}</div></div>
  `;

  try {
    const [qRes, hRes] = await Promise.allSettled([apiFetch('/sabnzbd/queue'), apiFetch('/sabnzbd/history')]);

    if (qRes.status === 'fulfilled' && qRes.value?.ok) {
      const q = await qRes.value.json();
      document.querySelector('#sab-kpis .kpi-card:nth-child(1) .kpi-value').outerHTML = `<div class="kpi-value">${q.speed || '0 KB/s'}</div>`;
      document.querySelector('#sab-kpis .kpi-card:nth-child(2) .kpi-value').outerHTML = `<div class="kpi-value">${q.sizeleft || '0 MB'}</div>`;
      document.querySelector('#sab-kpis .kpi-card:nth-child(3) .kpi-value').outerHTML = `<div class="kpi-value status-ok">${q.status || 'Idle'}</div>`;
      const qEl = document.querySelector('#sab-queue .skeleton-list');
      const slots = q.slots || [];
      qEl.innerHTML = slots.length ? slots.map(s => `
        <div class="list-row">
          <div class="list-info">
            <div class="list-title">${s.filename || s.name || 'Unknown'}</div>
            <div class="list-sub">${s.size || ''} · ${s.timeleft || ''} left · ${s.status || ''}</div>
          </div>
          <div class="progress-wrap"><div class="progress-bar" style="width:${s.percentage || 0}%"></div></div>
        </div>`).join('') : emptyState('Queue is empty');
    } else document.querySelector('#sab-queue .skeleton-list').innerHTML = emptyState('SABnzbd not configured');

    if (hRes.status === 'fulfilled' && hRes.value?.ok) {
      const h = await hRes.value.json();
      const slots = h.slots?.slice(0, 10) || [];
      const hEl = document.querySelector('#sab-history .skeleton-list');
      hEl.innerHTML = slots.length ? slots.map(s => `
        <div class="list-row">
          <div class="list-info">
            <div class="list-title">${s.name || 'Unknown'}</div>
            <div class="list-sub">${s.size || ''} · ${s.status || ''} · ${s.download_time ? new Date(s.download_time * 1000).toLocaleDateString() : ''}</div>
          </div>
          <span class="badge ${s.status === 'Completed' ? 'badge-ok' : 'badge-warn'}">${s.status || 'Unknown'}</span>
        </div>`).join('') : emptyState('No history');
    } else document.querySelector('#sab-history .skeleton-list').innerHTML = emptyState('SABnzbd not configured');
  } catch { document.getElementById('sab-queue').innerHTML = errorState('Could not connect to SABnzbd'); }
}

// ── Overseerr ─────────────────────────────────────────────────
async function renderOverseerr() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-header"><h2>Overseerr — Requests</h2></div>
    <div class="tabs">
      <button class="tab active" data-tab="pending">Pending</button>
      <button class="tab" data-tab="approved">Approved</button>
      <button class="tab" data-tab="all">All</button>
    </div>
    <div id="overseerr-content"><div class="page-loading"><div class="spinner"></div></div></div>
  `;

  async function loadTab(filter) {
    const el = document.getElementById('overseerr-content');
    el.innerHTML = `<div class="page-loading"><div class="spinner"></div></div>`;
    try {
      const res = await apiFetch(`/overseerr/requests?filter=${filter}`);
      const data = res?.ok ? await res.json() : { results: [] };
      const items = data.results || [];
      el.innerHTML = items.length ? `<div class="episode-list">${items.map(r => `
        <div class="list-row">
          <div class="list-info">
            <div class="list-title">${r.media?.title || r.media?.name || 'Unknown'} (${r.media?.releaseDate?.slice(0,4) || r.media?.firstAirDate?.slice(0,4) || ''})</div>
            <div class="list-sub">Requested by ${r.requestedBy?.displayName || r.requestedBy?.username || 'Unknown'} · ${new Date(r.createdAt).toLocaleDateString()}</div>
          </div>
          <span class="badge ${r.status === 1 ? 'badge-warn' : r.status === 2 ? 'badge-ok' : 'badge-muted'}">${r.status === 1 ? 'Pending' : r.status === 2 ? 'Approved' : r.status === 3 ? 'Declined' : 'Available'}</span>
        </div>`).join('')}</div>` : emptyState('No requests found');
    } catch { el.innerHTML = errorState('Could not connect to Overseerr'); }
  }

  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      loadTab(t.dataset.tab);
    });
  });

  loadTab('pending');
}

// ── Settings ──────────────────────────────────────────────────
async function renderSettings() {
  const main = document.getElementById('main-content');
  const res = await apiFetch('/settings');
  const settings = res?.ok ? await res.json() : {};

  const services = [
    { key: 'sonarr', label: 'Sonarr', fields: ['url', 'apiKey'] },
    { key: 'radarr', label: 'Radarr', fields: ['url', 'apiKey'] },
    { key: 'plex', label: 'Plex', fields: ['url', 'token'] },
    { key: 'tautulli', label: 'Tautulli', fields: ['url', 'apiKey'] },
    { key: 'sabnzbd', label: 'SABnzbd', fields: ['url', 'apiKey'] },
    { key: 'overseerr', label: 'Overseerr', fields: ['url', 'apiKey'] },
  ];

  main.innerHTML = `
    <div class="page-header"><h2>Settings</h2></div>
    <div class="settings-grid">
      ${services.map(svc => `
        <div class="card settings-card">
          <h3 class="card-title">${svc.label}</h3>
          <form class="settings-form" data-service="${svc.key}">
            ${svc.fields.map(f => `
              <div class="field">
                <label for="${svc.key}-${f}">${f === 'apiKey' ? 'API Key' : f === 'token' ? 'Token' : 'URL'}</label>
                <input id="${svc.key}-${f}" type="${f.toLowerCase().includes('key') || f === 'token' ? 'password' : 'text'}"
                  name="${f}" placeholder="${f === 'url' ? 'http://192.168.1.x:PORT' : 'Paste key here'}"
                  value="${settings[svc.key]?.[f] || ''}" autocomplete="off" />
              </div>`).join('')}
            <div class="settings-actions">
              <button type="submit" class="btn-primary btn-sm">Save</button>
              <button type="button" class="btn-ghost btn-sm test-btn" data-service="${svc.key}">Test Connection</button>
              <span class="test-result" id="test-${svc.key}"></span>
            </div>
          </form>
        </div>`).join('')}
    </div>
  `;

  document.querySelectorAll('.settings-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const svc = form.dataset.service;
      const payload = {};
      new FormData(form).forEach((v, k) => payload[k] = v);
      const r = await apiFetch(`/settings/${svc}`, { method: 'PUT', body: JSON.stringify(payload) });
      const btn = form.querySelector('button[type=submit]');
      btn.textContent = r?.ok ? '✓ Saved' : '✗ Error';
      setTimeout(() => btn.textContent = 'Save', 2000);
    });
  });

  document.querySelectorAll('.test-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const svc = btn.dataset.service;
      const resultEl = document.getElementById(`test-${svc}`);
      btn.disabled = true;
      btn.textContent = 'Testing…';
      resultEl.textContent = '';
      const r = await apiFetch(`/${svc}/status`);
      resultEl.textContent = r?.ok ? '✓ Connected' : '✗ Failed';
      resultEl.className = `test-result ${r?.ok ? 'ok' : 'err'}`;
      btn.disabled = false;
      btn.textContent = 'Test Connection';
    });
  });
}

// ── Users (Admin only) ────────────────────────────────────────
async function renderUsers() {
  if (currentUser?.role !== 'admin') {
    document.getElementById('main-content').innerHTML = errorState('Admin access required');
    return;
  }
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-header">
      <h2>Users</h2>
      <button class="btn-primary btn-sm" id="add-user-btn">+ Add User</button>
    </div>
    <div class="card" id="users-table"><div class="skeleton-list">${skeletonRows(3)}</div></div>
  `;

  async function loadUsers() {
    const res = await apiFetch('/users');
    const users = res?.ok ? await res.json() : [];
    document.getElementById('users-table').innerHTML = users.length ? `
      <table class="data-table">
        <thead><tr><th>Username</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>${users.map(u => `
          <tr>
            <td>${u.username}</td>
            <td><span class="badge ${u.role === 'admin' ? 'badge-accent' : 'badge-muted'}">${u.role}</span></td>
            <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
            <td>${u.id !== currentUser.id ? `<button class="btn-ghost btn-sm delete-user" data-id="${u.id}">Delete</button>` : '<span class="text-muted">You</span>'}</td>
          </tr>`).join('')}
        </tbody>
      </table>` : emptyState('No users found');

    document.querySelectorAll('.delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this user?')) return;
        const r = await apiFetch(`/users/${btn.dataset.id}`, { method: 'DELETE' });
        if (r?.ok) loadUsers();
      });
    });
  }

  document.getElementById('add-user-btn').addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <h3>Add User</h3>
        <form id="add-user-form" class="settings-form">
          <div class="field"><label>Username</label><input name="username" required /></div>
          <div class="field"><label>Password</label><input type="password" name="password" required /></div>
          <div class="field">
            <label>Role</label>
            <select name="role"><option value="viewer">Viewer</option><option value="admin">Admin</option></select>
          </div>
          <div class="settings-actions">
            <button type="submit" class="btn-primary btn-sm">Create</button>
            <button type="button" class="btn-ghost btn-sm" id="close-modal">Cancel</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.getElementById('add-user-form').addEventListener('submit', async e => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(e.target));
      const r = await apiFetch('/users', { method: 'POST', body: JSON.stringify(payload) });
      if (r?.ok) { modal.remove(); loadUsers(); }
    });
  });

  loadUsers();
}

// ── Helpers ───────────────────────────────────────────────────
function skeletonRows(n) {
  return Array.from({length: n}, () => `
    <div class="list-row skeleton-row">
      <div class="skeleton skeleton-text" style="width:60%"></div>
      <div class="skeleton skeleton-text" style="width:30%"></div>
    </div>`).join('');
}

function emptyState(msg) {
  return `<div class="empty-state"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><p>${msg}</p></div>`;
}

function errorState(msg) {
  return `<div class="empty-state error-state"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><p>${msg}</p></div>`;
}

// ── Boot ──────────────────────────────────────────────────────
async function boot() {
  const token = null; // no localStorage — check server
  // Try to restore session from an existing cookie / server ping
  try {
    const meRes = await fetch(`${API}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (meRes.ok) {
      const data = await meRes.json();
      currentUser = data.user;
      authToken = token;
      renderShell();
      navigate('dashboard');
      return;
    }
  } catch {}
  renderLogin();
}

document.addEventListener('DOMContentLoaded', boot);
