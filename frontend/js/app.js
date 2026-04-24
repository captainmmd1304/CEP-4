// ===== HACKTEAM SPA ROUTER & UTILITIES =====

const APP_ROUTES = new Set([
    'home',
    'login',
    'onboarding',
    'discover',
    'hackathons',
    'hackathon',
    'teams',
    'profile',
    'messages',
    'showcase',
]);

let authFailureNotified = false;
let appNotifications = [];
let pollInterval = null;

const AUTH_STORAGE_KEYS = {
    token: 'code_sathi_token',
    userId: 'code_sathi_userId',
    userName: 'code_sathi_userName',
};

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function safeExternalUrl(rawUrl) {
    const value = String(rawUrl ?? '').trim();
    if (!value) return '';

    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
        const parsed = new URL(normalized);
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
    } catch {
        return '';
    }
}

function getAuthToken() {
    return localStorage.getItem(AUTH_STORAGE_KEYS.token) || '';
}

function getCurrentUserId() {
    return Number(localStorage.getItem(AUTH_STORAGE_KEYS.userId)) || null;
}

function getAuthUserName() {
    return localStorage.getItem(AUTH_STORAGE_KEYS.userName) || '';
}

function isAuthenticated() {
    return Boolean(getAuthToken() && getCurrentUserId());
}

function clearAuthSession() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.token);
    localStorage.removeItem(AUTH_STORAGE_KEYS.userId);
    localStorage.removeItem(AUTH_STORAGE_KEYS.userName);
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    appNotifications = [];
}

function setAuthUserInfo(user) {
    if (!user || !user.id) return;

    localStorage.setItem(AUTH_STORAGE_KEYS.userId, String(user.id));
    if (user.name) {
        localStorage.setItem(AUTH_STORAGE_KEYS.userName, String(user.name));
    }
}

function handleAuthFailure(message = 'Your session expired. Please log in again.') {
    if (!isAuthenticated()) return;

    clearAuthSession();
    renderAuthNav();

    if (!authFailureNotified) {
        authFailureNotified = true;
        showToast(message, 'info');
        setTimeout(() => {
            authFailureNotified = false;
        }, 2500);
    }

    const route = getRoute();
    if (route.page !== 'login' && route.page !== 'onboarding') {
        navigateTo('login');
    }
}

function logout() {
    clearAuthSession();
    renderAuthNav();
    showToast('Logged out successfully.', 'success');
    navigateTo('home');
}

async function validateStoredSession() {
    if (!isAuthenticated()) return;

    try {
        const data = await apiRequest('/api/auth/me', {
            auth: true,
            retries: 0,
            timeoutMs: 6000,
        });

        if (data?.user) {
            setAuthUserInfo(data.user);
        }
        
        fetchNotifications();
        if (!pollInterval) {
            pollInterval = setInterval(fetchNotifications, 15000);
        }
    } catch (err) {
        if (err.status === 401 || err.status === 403) {
            handleAuthFailure();
        }
    }
}

async function fetchNotifications() {
    if (!isAuthenticated()) return;
    try {
        const data = await apiRequest('/api/notifications', { auth: true, retries: 0, timeoutMs: 5000 });
        appNotifications = Array.isArray(data.notifications) ? data.notifications : [];
        updateNotificationsUI();
    } catch (err) {}
}

function updateNotificationsUI() {
    const badge = document.getElementById('nav-notification-badge');
    if (badge) {
        const unreadCount = appNotifications.filter(n => n.unread).length;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        const isVisible = dropdown.style.display === 'flex';
        dropdown.outerHTML = renderNotificationsDropdown(isVisible);
    }
}

function renderAuthNav() {
    const container = document.getElementById('nav-auth-container');
    if (!container) return;

    if (isAuthenticated()) {
        const userId = getCurrentUserId();
        container.innerHTML = `
          <div class="nav-notifications" style="position:relative; margin-right: 8px; display: flex; align-items: center;" onclick="toggleNotifications(event)">
            <button class="btn btn-ghost" style="padding: 8px; position: relative;" aria-label="Notifications">
              <span style="font-size: 18px;">🔔</span>
              <span id="nav-notification-badge" style="position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; background: var(--primary); border-radius: 50%; display: none;"></span>
            </button>
            ${renderNotificationsDropdown(false)}
          </div>
          <a href="#messages" class="btn btn-ghost" style="padding: 8px 14px; font-size: 14px;">Messages</a>
          <a href="#profile/${userId}" class="btn btn-secondary" style="padding: 8px 14px; font-size: 14px;">Profile</a>
          <button type="button" class="btn btn-ghost" style="padding: 8px 14px; font-size: 14px;" onclick="logout()">Logout</button>
          <button class="nav-hamburger" onclick="toggleMobileNav()">
            <span></span>
            <span></span>
            <span></span>
          </button>
        `;
        updateNotificationsUI();
        return;
    }

    container.innerHTML = `
      <a href="#login" class="btn btn-ghost" style="padding: 8px 16px; font-size: 14px;">Log In</a>
      <a href="#onboarding" class="btn btn-primary" style="padding: 8px 16px; font-size: 14px;">Sign Up</a>
      <button class="nav-hamburger" onclick="toggleMobileNav()">
        <span></span>
        <span></span>
        <span></span>
      </button>
    `;
}

async function apiRequest(path, options = {}) {
    const {
        method = 'GET',
        body,
        auth = false,
        retries = 0,
        timeoutMs = 10000,
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const headers = {};
            if (body !== undefined) headers['Content-Type'] = 'application/json';
            if (auth) {
                const token = getAuthToken();
                if (!token) throw new Error('Please log in to continue.');
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(path, {
                method,
                headers,
                body: body !== undefined ? JSON.stringify(body) : undefined,
                signal: controller.signal,
            });

            clearTimeout(timeout);
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const error = new Error(data.error || data.message || 'Request failed');
                error.status = res.status;

                if ((res.status === 401 || res.status === 403) && auth) {
                    handleAuthFailure();
                }
                throw error;
            }

            return data;
        } catch (err) {
            clearTimeout(timeout);
            lastError = err;

            if (err.name === 'AbortError') {
                lastError = new Error('Request timed out. Please try again.');
            }

            const isRetryable = err.status >= 500 || err.name === 'AbortError' || !err.status;
            if (!isRetryable || attempt === retries) {
                throw lastError;
            }
        }
    }

    throw lastError || new Error('Unexpected request error');
}

function showToast(message, variant = 'info') {
    const root = document.getElementById('toastRoot') || (() => {
        const el = document.createElement('div');
        el.id = 'toastRoot';
        el.className = 'toast-root';
        document.body.appendChild(el);
        return el;
    })();

    const toast = document.createElement('div');
    toast.className = `toast toast-${variant}`;
    toast.textContent = message;
    root.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 250);
    }, 2600);
}

// --- Avatar Renderer ---
function renderAvatar(user, sizeClass = '') {
    const color = AVATAR_COLORS[user?.avatarColor || 0] || AVATAR_COLORS[0];
    const initials = user?.initials || String(user?.name || '?').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
    return `<div class="avatar ${sizeClass}" style="background: ${escapeHtml(color)}">${escapeHtml(initials)}</div>`;
}

function renderAvatarStack(userIds, max = 4) {
    const users = userIds.map(id => USERS.find(u => u.id === id)).filter(Boolean);
    const shown = users.slice(0, max);
    const extra = users.length - max;

    let html = '<div class="avatar-stack">';
    shown.forEach(u => {
        html += renderAvatar(u, 'avatar-sm');
    });
    if (extra > 0) {
        html += `<div class="avatar avatar-sm avatar-more">+${extra}</div>`;
    }
    html += '</div>';
    return html;
}

// --- Tag Renderer ---
function renderSkillTag(skill) {
    return `<span class="tag ${getSkillColorClass(skill)}">${escapeHtml(skill)}</span>`;
}

function renderSkillTags(skills) {
    return skills.map(renderSkillTag).join('');
}

// --- Person Card ---
function renderPersonCard(user, staggerIdx = 0) {
    return `
    <div class="person-card animate-fade-in stagger-${staggerIdx % 8 + 1}" onclick="navigateTo('profile/${user.id}')">
      <div class="person-card-header">
        ${renderAvatar(user)}
        <div class="person-card-info">
          <h4>${escapeHtml(user.name)}</h4>
          <span class="text-sm text-muted">${escapeHtml(user.role)} · ${escapeHtml(user.experience)}</span>
        </div>
        ${user.openToTeam ? '<span class="badge-status badge-online">Open</span>' : ''}
      </div>
      <div class="person-card-skills">${renderSkillTags(user.skills)}</div>
      <div class="person-card-footer">
        <span class="text-xs text-muted">🕐 ${escapeHtml(user.timezone)}</span>
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); sendConnectRequest(${user.id}, this)">Connect</button>
      </div>
    </div>`;
}

function renderPersonListItem(user) {
    return `
    <div class="person-list-item" onclick="navigateTo('profile/${user.id}')">
      ${renderAvatar(user)}
      <div style="min-width:140px">
        <h4 style="font-size:14px">${escapeHtml(user.name)}</h4>
        <span class="text-xs text-muted">${escapeHtml(user.role)}</span>
      </div>
      <div class="person-card-skills">${renderSkillTags(user.skills)}</div>
      <span class="text-xs text-muted" style="white-space:nowrap">🕐 ${escapeHtml(user.timezone)}</span>
      <span class="text-xs text-muted">${escapeHtml(user.experience)}</span>
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); sendConnectRequest(${user.id}, this)">Connect</button>
    </div>`;
}

async function sendConnectRequest(userId, btnElement) {
    if (!isAuthenticated()) {
        showToast('Please log in to connect.', 'error');
        navigateTo('login');
        return;
    }
    
    if (getCurrentUserId() === userId) {
        showToast("You can't connect with yourself.", 'error');
        return;
    }

    try {
        btnElement.disabled = true;
        btnElement.textContent = 'Sending...';

        await apiRequest(`/api/users/${userId}/connect`, {
            method: 'POST',
            auth: true,
            timeoutMs: 10000,
        });

        showToast('Connection request sent!', 'success');
        btnElement.textContent = 'Pending';
        btnElement.classList.remove('btn-outline');
        btnElement.classList.add('btn-secondary');
    } catch (err) {
        showToast(err.message || 'Could not send request.', 'error');
        btnElement.disabled = false;
        btnElement.textContent = 'Connect';
    }
}

// --- Notification Icon ---
function getNotificationIcon(type) {
    const icons = {
        connection: '👋',
        message: '💬',
        team: '👥',
        hackathon: '🚀',
        endorsement: '⭐',
    };
    return icons[type] || '🔔';
}

// --- Router ---
function navigateTo(hash) {
    window.location.hash = hash;
}

function getRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const parts = hash.split('/');
    return { page: parts[0], param: parts[1] || null };
}

function updateActiveNav() {
    const route = getRoute();
    document.querySelectorAll('.nav-links a').forEach(link => {
        const hrefAttr = link.getAttribute('href') || '';
        const href = hrefAttr.startsWith('#') ? hrefAttr.slice(1) : hrefAttr;
        link.classList.toggle('active', href === route.page || (href === 'home' && route.page === 'home'));
    });
}

function renderPage() {
    const route = getRoute();
    const app = document.getElementById('app');
    renderAuthNav();

    if (isAuthenticated() && (route.page === 'login' || route.page === 'onboarding')) {
        navigateTo('home');
        return;
    }

    if (!APP_ROUTES.has(route.page)) {
        navigateTo('home');
        return;
    }
    updateActiveNav();

    // Close mobile nav and notification dropdown
    document.querySelector('.nav-links')?.classList.remove('mobile-active');
    const notifDropdown = document.getElementById('notificationsDropdown');
    if (notifDropdown) notifDropdown.style.display = 'none';

    // Scroll to top
    window.scrollTo(0, 0);

    try {
        switch (route.page) {
            case 'home':
                app.innerHTML = renderLanding();
                if (typeof initLanding === 'function') initLanding();
                break;
            case 'login':
                app.innerHTML = renderLogin();
                if (typeof initLogin === 'function') initLogin();
                break;
            case 'onboarding':
                app.innerHTML = renderOnboarding();
                initOnboarding();
                break;
            case 'discover':
                app.innerHTML = renderDiscover();
                initDiscover();
                break;
            case 'hackathons':
                app.innerHTML = renderHackathons();
                initHackathons();
                break;
            case 'hackathon':
                app.innerHTML = renderHackathonDetail(route.param);
                if (typeof initHackathonDetail === 'function') initHackathonDetail(route.param);
                break;
            case 'teams':
                app.innerHTML = renderTeamBoard();
                initTeamBoard();
                break;
            case 'profile':
                app.innerHTML = renderProfile(route.param);
                if (typeof initProfile === 'function') initProfile(route.param);
                break;
            case 'messages':
                app.innerHTML = renderMessages();
                initMessages();
                break;
            case 'showcase':
                app.innerHTML = renderShowcase();
                if (typeof initShowcase === 'function') initShowcase();
                break;
            default:
                app.innerHTML = renderLanding();
        }
    } catch {
        app.innerHTML = `
        <div class="page">
          <div class="container" style="padding-top:40px">
            <div class="card" style="text-align:center;padding:40px">
              <h3 style="margin-bottom:8px">Something went wrong</h3>
              <p class="text-muted" style="margin-bottom:16px">Please refresh or try another page.</p>
              <button class="btn btn-primary" onclick="navigateTo('home')">Go home</button>
            </div>
          </div>
        </div>`;
    }
}

// --- Notification Dropdown ---
function toggleNotifications(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'flex' : 'none';
    }
}

function renderNotificationsDropdown(isVisible = false) {
    const unreadCount = appNotifications.filter(n => n.unread).length;
    return `
    <div class="notifications-dropdown" id="notificationsDropdown" style="position:absolute; top:100%; right:0; margin-top:8px; width:320px; background:var(--surface); border:1px solid var(--surface-border); border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.2); display:${isVisible ? 'flex' : 'none'}; flex-direction:column; z-index:100; overflow:hidden;">
      <div style="padding: 16px 20px; border-bottom: 1px solid var(--surface-border); display:flex; align-items:center; justify-content:space-between;">
        <h4>Notifications</h4>
        <span class="text-xs text-muted">${unreadCount} unread</span>
      </div>
      <div style="max-height: 400px; overflow-y: auto;">
      ${appNotifications.length === 0 ? '<div style="padding:20px; text-align:center;" class="text-muted">No notifications</div>' : ''}
      ${appNotifications.map(n => `
        <div class="notification-item ${n.unread ? 'unread' : ''}" style="padding:16px 20px; border-bottom:1px solid var(--surface-border); display:flex; gap:12px; cursor:pointer; background:${n.unread ? 'rgba(0,212,255,0.05)' : 'transparent'}; transition: background 0.2s;" onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='${n.unread ? 'rgba(0,212,255,0.05)' : 'transparent'}'" onclick="handleNotificationClick(${n.id}, event)">
          <span style="font-size:18px;flex-shrink:0">${getNotificationIcon(n.type)}</span>
          <div style="flex:1;min-width:0">
            <p style="font-size:13px;margin:0; ${n.unread ? 'font-weight:600;' : ''}">${escapeHtml(n.text)}</p>
            <span class="text-xs text-muted">${escapeHtml(n.time)}</span>
          </div>
        </div>
      `).join('')}
      </div>
    </div>`;
}

async function handleNotificationClick(id, event) {
    event.stopPropagation();
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) dropdown.style.display = 'none';
    
    try {
        await apiRequest(`/api/notifications/${id}/read`, { method: 'POST', auth: true, retries: 0 });
        fetchNotifications();
    } catch (e) {}
    
    navigateTo('messages');
}

// --- Mobile hamburger ---
function toggleMobileNav() {
    document.querySelector('.nav-links').classList.toggle('mobile-active');
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
    await validateStoredSession();
    renderAuthNav();
    renderPage();

    // Close notifications when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('notificationsDropdown');
        if (dropdown && !e.target.closest('.nav-notifications')) {
            dropdown.style.display = 'none';
        }
    });
});

window.addEventListener('hashchange', renderPage);
