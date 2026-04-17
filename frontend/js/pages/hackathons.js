// ===== HACKATHON DIRECTORY =====
function renderHackathons() {
    return `
    <div class="page">
      <div class="container">
        <div style="margin-bottom:32px">
          <h2>Hackathon Directory</h2>
          <p class="text-muted" style="margin-top:4px">Discover upcoming hackathons and find teammates</p>
        </div>

        <!-- Search + Filters -->
        <div style="display:flex;gap:12px;margin-bottom:32px;flex-wrap:wrap">
          <div class="search-bar" style="flex:1;min-width:280px">
            <svg width="18" height="18" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="hackSearch" placeholder="Search hackathons..." oninput="filterHackathons()">
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap" id="hackathonTagFilters">
            <button class="tag tag-outline tag-selectable hack-tag-filter selected" data-tag="All" onclick="filterHackTag(this)">All</button>
            <button class="tag tag-outline tag-selectable hack-tag-filter" data-tag="AI" onclick="filterHackTag(this)">AI</button>
            <button class="tag tag-outline tag-selectable hack-tag-filter" data-tag="Web3" onclick="filterHackTag(this)">Web3</button>
            <button class="tag tag-outline tag-selectable hack-tag-filter" data-tag="Health" onclick="filterHackTag(this)">Health</button>
            <button class="tag tag-outline tag-selectable hack-tag-filter" data-tag="Climate" onclick="filterHackTag(this)">Climate</button>
            <button class="tag tag-outline tag-selectable hack-tag-filter" data-tag="Online" onclick="filterHackTag(this)">🌐 Online</button>
          </div>
        </div>

        <div class="grid-2" id="hackathonGrid">
          ${HACKATHONS.map((h, i) => renderHackathonCard(h, i)).join('')}
        </div>
      </div>
    </div>`;
}

function renderHackathonCard(h, i = 0) {
    const attendeeIds = Array.isArray(h.attendeeIds) ? h.attendeeIds : (Array.isArray(h.attendees) ? h.attendees : []);
    const attendeeCount = typeof h.attendeeCount === 'number' ? h.attendeeCount : attendeeIds.length;
    const isGoing = typeof h.isGoing === 'boolean' ? h.isGoing : attendeeIds.includes(CURRENT_USER.id);
    return `
    <div class="hackathon-card animate-fade-in stagger-${(i % 8) + 1}" onclick="navigateTo('hackathon/${h.id}')">
      <div style="height:6px;border-radius:4px 4px 0 0;margin:-24px -24px 20px;background:${escapeHtml(h.bannerGradient || 'linear-gradient(90deg,#00d4ff,#a855f7)')}"></div>
      <div class="hackathon-card-header">
        <div>
          <h4 style="margin-bottom:4px">${escapeHtml(h.name)}</h4>
          <span class="text-xs text-muted">${escapeHtml(h.organizer)}</span>
        </div>
        <span class="tag ${h.online ? 'tag-green' : 'tag-blue'}">${h.online ? '🌐 Online' : '📍 In-Person'}</span>
      </div>
      <div class="hackathon-card-meta">
        <span>📅 ${escapeHtml(h.date)}</span>
        <span>${h.online ? '' : `📍 ${escapeHtml(h.location)}`}</span>
        <span>💰 ${escapeHtml(h.prize)}</span>
      </div>
      <div class="hackathon-card-tags">
        ${(Array.isArray(h.tags) ? h.tags : []).map((t) => `<span class="tag tag-outline">${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="hackathon-card-footer">
        <div style="display:flex;align-items:center;gap:8px">
          ${renderAvatarStack(attendeeIds, 3)}
          <span class="text-xs text-muted">${attendeeCount} interested</span>
        </div>
        <button class="btn ${isGoing ? 'btn-green btn-sm' : 'btn-outline btn-sm'}" onclick="event.stopPropagation(); toggleGoing(${h.id})">
          ${isGoing ? '✓ Going' : "I'm going"}
        </button>
      </div>
    </div>`;
}

let hackTagFilter = 'All';
let hackathonsCache = [...HACKATHONS];

function initHackathons() {
    hackTagFilter = 'All';
    hackathonsCache = [...HACKATHONS];
    loadHackathons();
}

async function loadHackathons() {
    try {
        const data = await apiRequest('/api/hackathons', {
            auth: Boolean(getAuthToken()),
            retries: 1,
            timeoutMs: 8000,
        });
        if (Array.isArray(data.hackathons) && data.hackathons.length > 0) {
            hackathonsCache = data.hackathons;
            filterHackathons();
        }
    } catch {
        showToast('Using local hackathon data.', 'info');
    }
}

function filterHackTag(el) {
    document.querySelectorAll('.hack-tag-filter').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    hackTagFilter = el.dataset.tag;
    filterHackathons();
}

async function toggleGoing(hackId) {
    if (!getAuthToken()) {
        showToast('Please sign in to mark attendance.', 'error');
        navigateTo('login');
        return;
    }

    try {
        const data = await apiRequest(`/api/hackathons/${hackId}/toggle-going`, {
            method: 'POST',
            auth: true,
            retries: 1,
            timeoutMs: 8000,
        });

        const idx = hackathonsCache.findIndex((h) => h.id === hackId);
        if (idx >= 0) {
            hackathonsCache[idx] = {
                ...hackathonsCache[idx],
                ...data.hackathon,
            };
        }
        showToast('Attendance updated.', 'success');
    } catch (err) {
        showToast(err.message || 'Could not update attendance.', 'error');
    }

    filterHackathons();
}

function filterHackathons() {
    const search = document.getElementById('hackSearch')?.value.toLowerCase() || '';

    let filtered = hackathonsCache.filter(h => {
        const tags = Array.isArray(h.tags) ? h.tags : [];
        if (search && !String(h.name || '').toLowerCase().includes(search) && !tags.some(t => String(t).toLowerCase().includes(search))) return false;
        if (hackTagFilter !== 'All') {
            if (hackTagFilter === 'Online') {
                if (!h.online) return false;
            } else if (!tags.includes(hackTagFilter)) return false;
        }
        return true;
    });

    const grid = document.getElementById('hackathonGrid');
    if (grid) {
        grid.innerHTML = filtered.length > 0
            ? filtered.map((h, i) => renderHackathonCard(h, i)).join('')
            : '<div style="grid-column:1/-1;text-align:center;padding:60px 0"><p class="text-muted">No hackathons match your search.</p></div>';
    }
}
