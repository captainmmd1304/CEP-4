// ===== HACKTEAM SPA ROUTER & UTILITIES =====

// --- Avatar Renderer ---
function renderAvatar(user, sizeClass = '') {
    const color = AVATAR_COLORS[user.avatarColor || 0];
    return `<div class="avatar ${sizeClass}" style="background: ${color}">${user.initials}</div>`;
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
    return `<span class="tag ${getSkillColorClass(skill)}">${skill}</span>`;
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
          <h4>${user.name}</h4>
          <span class="text-sm text-muted">${user.role} · ${user.experience}</span>
        </div>
        ${user.openToTeam ? '<span class="badge-status badge-online">Open</span>' : ''}
      </div>
      <div class="person-card-skills">${renderSkillTags(user.skills)}</div>
      <div class="person-card-footer">
        <span class="text-xs text-muted">🕐 ${user.timezone}</span>
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();">Connect</button>
      </div>
    </div>`;
}

function renderPersonListItem(user) {
    return `
    <div class="person-list-item" onclick="navigateTo('profile/${user.id}')">
      ${renderAvatar(user)}
      <div style="min-width:140px">
        <h4 style="font-size:14px">${user.name}</h4>
        <span class="text-xs text-muted">${user.role}</span>
      </div>
      <div class="person-card-skills">${renderSkillTags(user.skills)}</div>
      <span class="text-xs text-muted" style="white-space:nowrap">🕐 ${user.timezone}</span>
      <span class="text-xs text-muted">${user.experience}</span>
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();">Connect</button>
    </div>`;
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
        const href = link.getAttribute('href').slice(1);
        link.classList.toggle('active', href === route.page || (href === 'home' && route.page === 'home'));
    });
}

function renderPage() {
    const route = getRoute();
    const app = document.getElementById('app');
    updateActiveNav();

    // Close mobile nav and notification dropdown
    document.querySelector('.nav-links')?.classList.remove('mobile-active');
    document.querySelector('.notifications-dropdown')?.classList.remove('active');

    // Scroll to top
    window.scrollTo(0, 0);

    switch (route.page) {
        case 'home':
            app.innerHTML = renderLanding();
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
            break;
        case 'teams':
            app.innerHTML = renderTeamBoard();
            initTeamBoard();
            break;
        case 'profile':
            app.innerHTML = renderProfile(route.param);
            break;
        case 'messages':
            app.innerHTML = renderMessages();
            initMessages();
            break;
        case 'showcase':
            app.innerHTML = renderShowcase();
            break;
        default:
            app.innerHTML = renderLanding();
    }
}

// --- Notification Dropdown ---
function toggleNotifications(e) {
    e.stopPropagation();
    const dropdown = document.querySelector('.notifications-dropdown');
    dropdown.classList.toggle('active');
}

function renderNotificationsDropdown() {
    return `
    <div class="notifications-dropdown" id="notificationsDropdown">
      <div style="padding: 16px 20px; border-bottom: 1px solid var(--surface-border); display:flex; align-items:center; justify-content:space-between;">
        <h4>Notifications</h4>
        <span class="text-xs text-muted">${NOTIFICATIONS.filter(n => n.unread).length} unread</span>
      </div>
      ${NOTIFICATIONS.map(n => `
        <div class="notification-item ${n.unread ? 'unread' : ''}">
          ${n.unread ? '' : ''}
          <span style="font-size:18px;flex-shrink:0">${getNotificationIcon(n.type)}</span>
          <div style="flex:1;min-width:0">
            <p style="font-size:13px;margin:0">${n.text}</p>
            <span class="text-xs text-muted">${n.time}</span>
          </div>
        </div>
      `).join('')}
    </div>`;
}

// --- Mobile hamburger ---
function toggleMobileNav() {
    document.querySelector('.nav-links').classList.toggle('mobile-active');
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    renderPage();

    // Close notifications when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.notifications-dropdown');
        if (dropdown && !e.target.closest('.nav-notifications')) {
            dropdown.classList.remove('active');
        }
    });
});

window.addEventListener('hashchange', renderPage);
