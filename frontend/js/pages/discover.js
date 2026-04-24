// ===== DISCOVER PAGE =====
function renderDiscover() {
    return `
    <div class="page">
      <div class="container">
        <div style="margin-bottom:32px">
          <h2>Discover Hackers</h2>
          <p class="text-muted" style="margin-top:4px">Find the perfect teammates for your next hackathon</p>
          <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <button class="btn btn-secondary" type="button" onclick="loadMlRecommendations()">Get AI Matches</button>
            <span class="text-xs text-muted">Personalized teammate suggestions based on skills, roles, and collaboration patterns.</span>
          </div>
          <div id="mlRecommendPanel" style="margin-top:16px"></div>
        </div>

        <!-- Search bar + controls -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap">
          <div class="search-bar" style="flex:1;min-width:280px">
            <svg width="18" height="18" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="discoverSearch" placeholder="Search by name, skill, or role..." oninput="filterDiscover()">
          </div>
          <div class="view-toggle" id="viewToggle">
            <button class="active" onclick="setView('grid')">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Grid
            </button>
            <button onclick="setView('list')">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>
              List
            </button>
          </div>
        </div>

        <div class="discover-layout">
          <!-- Filters -->
          <div class="filter-sidebar" id="filterSidebar">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
              <h4>Filters</h4>
              <button class="btn btn-ghost btn-sm" onclick="clearFilters()">Clear all</button>
            </div>
            
            <div class="filter-group">
              <div class="filter-group-title">Role</div>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${ROLES.map(r => `
                  <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;color:var(--text-secondary)">
                    <input type="checkbox" value="${r}" class="filter-role" onchange="filterDiscover()" style="width:auto;padding:0"> ${r}
                  </label>
                `).join('')}
              </div>
            </div>

            <div class="filter-group">
              <div class="filter-group-title">Experience</div>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${EXPERIENCE_LEVELS.map(l => `
                  <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;color:var(--text-secondary)">
                    <input type="checkbox" value="${l}" class="filter-exp" onchange="filterDiscover()" style="width:auto;padding:0"> ${l}
                  </label>
                `).join('')}
              </div>
            </div>

            <div class="filter-group">
              <div class="filter-group-title">Skills</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px">
                ${SKILL_TAGS.slice(0, 15).map(s => `
                  <button class="tag tag-outline tag-selectable filter-skill" data-skill="${s.name}" onclick="toggleFilterSkill(this)">${s.name}</button>
                `).join('')}
              </div>
            </div>

            <div class="filter-group">
              <div class="filter-group-title">Timezone</div>
              <select id="filterTimezone" onchange="filterDiscover()" style="font-size:13px">
                <option value="">All timezones</option>
                ${TIMEZONES.map(tz => `<option value="${tz}">${tz}</option>`).join('')}
              </select>
            </div>

            <div class="filter-group">
              <div class="filter-group-title">Availability</div>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;color:var(--text-secondary)">
                <input type="checkbox" id="filterOpen" onchange="filterDiscover()" style="width:auto;padding:0"> Open to team up only
              </label>
            </div>
          </div>

          <!-- Results -->
          <div>
            <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">
              <span class="text-sm text-muted" id="resultCount">${USERS.length} hackers found</span>
            </div>
            <div id="discoverResults" class="grid-3">
              ${USERS.map((u, i) => renderPersonCard(u, i)).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

let discoverViewMode = 'grid';
let filterSkills = [];
let mlRecommendations = [];
let mlRecommendationLoading = false;
let onlyMlMatches = false;

function initDiscover() {
    discoverViewMode = 'grid';
    filterSkills = [];
    mlRecommendations = [];
    mlRecommendationLoading = false;
    onlyMlMatches = false;
}

function renderMlRecommendations() {
    const panel = document.getElementById('mlRecommendPanel');
    if (!panel) return;

    if (mlRecommendationLoading) {
        panel.innerHTML = '<div class="card" style="padding:14px"><span class="text-sm text-muted">Fetching recommendations...</span></div>';
        return;
    }

    if (!Array.isArray(mlRecommendations) || mlRecommendations.length === 0) {
        panel.innerHTML = '';
        return;
    }

    panel.innerHTML = `
      <div class="card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;flex-wrap:wrap">
          <h4>AI Teammate Matches</h4>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" type="button" onclick="toggleMlOnlyFilter()">${onlyMlMatches ? 'Show All Results' : 'Show Only AI Matches'}</button>
            <span class="text-xs text-muted">Top ${mlRecommendations.length} ranked matches</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${mlRecommendations.map((match) => renderMlMatchCard(match)).join('')}
        </div>
      </div>`;
}

function toggleMlOnlyFilter() {
    if (!Array.isArray(mlRecommendations) || mlRecommendations.length === 0) {
        showToast('Fetch AI matches first to use this filter.', 'info');
        return;
    }

    onlyMlMatches = !onlyMlMatches;
    renderMlRecommendations();
    filterDiscover();
    showToast(onlyMlMatches ? 'Showing only AI-recommended users.' : 'Showing all users again.', 'info');
}

function renderMlMatchCard(match) {
    const fallbackInitials = String(match.name || '?').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
    const known = USERS.find((u) => u.id === match.userId) || null;
    const avatarHtml = known
        ? renderAvatar(known, 'avatar-sm')
        : `<div class="avatar avatar-sm" style="background:${AVATAR_COLORS[0]}">${escapeHtml(fallbackInitials)}</div>`;

    return `
      <div style="border:1px solid var(--surface-border);border-radius:10px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px;min-width:220px">
          ${avatarHtml}
          <div>
            <div style="font-weight:600">${escapeHtml(match.name || 'Unknown')}</div>
            <div class="text-xs text-muted">${escapeHtml(match.role || '')} · ${escapeHtml(match.experience || '')}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="tag tag-blue">Score ${Number(match.score || 0)}</span>
          <span class="tag tag-outline">${escapeHtml(match.roleFit || 'Contributor')}</span>
          <span class="text-xs text-muted">${escapeHtml((match.reason || []).join(', '))}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="btn btn-primary btn-sm" type="button" onclick="connectAndAcceptMl(${Number(match.userId)}, this)">Connect + Accept</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="sendConnectRequest(${Number(match.userId)}, this)">Connect</button>
          <button class="btn btn-ghost btn-sm" type="button" onclick="submitMlFeedback(${Number(match.userId)}, 'accept')">Accept</button>
          <button class="btn btn-ghost btn-sm" type="button" onclick="submitMlFeedback(${Number(match.userId)}, 'reject')">Reject</button>
        </div>
      </div>`;
}

async function loadMlRecommendations(options = {}) {
    const { silent = false } = options;
    const currentUserId = getCurrentUserId();
    if (!getAuthToken() || !currentUserId) {
        if (!silent) showToast('Please log in to get AI matches.', 'error');
        navigateTo('login');
        return;
    }

    mlRecommendationLoading = true;
    renderMlRecommendations();

    try {
        const data = await apiRequest(`/api/ml/recommend/${currentUserId}`, {
            method: 'POST',
            auth: true,
            timeoutMs: 12000,
        });

        mlRecommendations = Array.isArray(data.matches) ? data.matches : [];
        renderMlRecommendations();

        if (!silent && mlRecommendations.length === 0) {
            showToast('No recommendations available right now.', 'info');
        } else if (!silent) {
            showToast('AI matches ready.', 'success');
        }
    } catch (err) {
        mlRecommendations = [];
        renderMlRecommendations();
        if (!silent) showToast(err.message || 'Could not fetch recommendations.', 'error');
    } finally {
        mlRecommendationLoading = false;
        renderMlRecommendations();
    }
}

async function submitMlFeedback(recommendedId, action) {
    const currentUserId = getCurrentUserId();
    if (!getAuthToken() || !currentUserId) {
        showToast('Please log in to send feedback.', 'error');
        return;
    }

    try {
        await apiRequest('/api/ml/feedback', {
            method: 'POST',
            auth: true,
            body: {
                userId: currentUserId,
                recommendedId,
                action,
                context: 'recommend',
            },
            timeoutMs: 8000,
        });
        showToast(`Feedback saved: ${action}.`, 'success');
        await loadMlRecommendations({ silent: true });
    } catch (err) {
        showToast(err.message || 'Could not save feedback.', 'error');
    }
}

async function connectAndAcceptMl(recommendedId, btnElement) {
    const currentUserId = getCurrentUserId();
    if (!getAuthToken() || !currentUserId) {
        showToast('Please log in to continue.', 'error');
        navigateTo('login');
        return;
    }

    if (Number(currentUserId) === Number(recommendedId)) {
        showToast("You can't connect with yourself.", 'error');
        return;
    }

    if (btnElement) {
        btnElement.disabled = true;
        btnElement.textContent = 'Processing...';
    }

    try {
        await apiRequest(`/api/users/${recommendedId}/connect`, {
            method: 'POST',
            auth: true,
            timeoutMs: 10000,
        });

        await apiRequest('/api/ml/feedback', {
            method: 'POST',
            auth: true,
            body: {
                userId: currentUserId,
                recommendedId,
                action: 'accept',
                context: 'recommend',
            },
            timeoutMs: 8000,
        });

        showToast('Connection request sent and feedback saved.', 'success');
        await loadMlRecommendations({ silent: true });
    } catch (err) {
        showToast(err.message || 'Could not complete connect + accept.', 'error');
    } finally {
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.textContent = 'Connect + Accept';
        }
    }
}

function setView(mode) {
    discoverViewMode = mode;
    const btns = document.querySelectorAll('#viewToggle button');
    btns.forEach(b => b.classList.remove('active'));
    if (mode === 'grid') btns[0].classList.add('active');
    else btns[1].classList.add('active');
    filterDiscover();
}

function toggleFilterSkill(el) {
    el.classList.toggle('selected');
    const skill = el.dataset.skill;
    if (el.classList.contains('selected')) {
        filterSkills.push(skill);
    } else {
        filterSkills = filterSkills.filter(s => s !== skill);
    }
    filterDiscover();
}

function clearFilters() {
    document.querySelectorAll('.filter-role, .filter-exp').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-skill').forEach(b => b.classList.remove('selected'));
    document.getElementById('filterTimezone').value = '';
    document.getElementById('filterOpen').checked = false;
    document.getElementById('discoverSearch').value = '';
    filterSkills = [];
    onlyMlMatches = false;
    renderMlRecommendations();
    filterDiscover();
}

function filterDiscover() {
    const search = document.getElementById('discoverSearch')?.value.toLowerCase() || '';
    const roles = [...document.querySelectorAll('.filter-role:checked')].map(cb => cb.value);
    const exps = [...document.querySelectorAll('.filter-exp:checked')].map(cb => cb.value);
    const tz = document.getElementById('filterTimezone')?.value || '';
    const openOnly = document.getElementById('filterOpen')?.checked || false;

    const mlUserIds = new Set((mlRecommendations || []).map((m) => Number(m.userId)));

    let filtered = USERS.filter(u => {
        if (search && !u.name.toLowerCase().includes(search) && !u.skills.some(s => s.toLowerCase().includes(search)) && !u.role.toLowerCase().includes(search)) return false;
        if (roles.length > 0 && !roles.includes(u.role)) return false;
        if (exps.length > 0 && !exps.includes(u.experience)) return false;
        if (filterSkills.length > 0 && !filterSkills.some(s => u.skills.includes(s))) return false;
        if (tz && u.timezone !== tz) return false;
        if (openOnly && !u.openToTeam) return false;
        if (onlyMlMatches && !mlUserIds.has(Number(u.id))) return false;
        return true;
    });

    const resultsEl = document.getElementById('discoverResults');
    const countEl = document.getElementById('resultCount');

    if (countEl) countEl.textContent = `${filtered.length} hacker${filtered.length !== 1 ? 's' : ''} found`;

    if (resultsEl) {
        if (discoverViewMode === 'grid') {
            resultsEl.className = 'grid-3';
            resultsEl.style.display = 'grid';
            resultsEl.style.flexDirection = '';
            resultsEl.style.gap = '';
            resultsEl.innerHTML = filtered.length > 0
                ? filtered.map((u, i) => renderPersonCard(u, i)).join('')
                : '<div style="grid-column:1/-1;text-align:center;padding:60px 0"><p class="text-muted">No hackers match your filters. Try adjusting your search.</p></div>';
        } else {
            resultsEl.className = '';
            resultsEl.style.display = 'flex';
            resultsEl.style.flexDirection = 'column';
            resultsEl.style.gap = '8px';
            resultsEl.innerHTML = filtered.length > 0
                ? filtered.map(u => renderPersonListItem(u)).join('')
                : '<div style="text-align:center;padding:60px 0"><p class="text-muted">No hackers match your filters. Try adjusting your search.</p></div>';
        }
    }
}
