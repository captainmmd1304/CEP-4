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
    const isGoing = h.attendees.includes(CURRENT_USER.id);
    return `
    <div class="hackathon-card animate-fade-in stagger-${(i % 8) + 1}" onclick="navigateTo('hackathon/${h.id}')">
      <div style="height:6px;border-radius:4px 4px 0 0;margin:-24px -24px 20px;background:${h.bannerGradient}"></div>
      <div class="hackathon-card-header">
        <div>
          <h4 style="margin-bottom:4px">${h.name}</h4>
          <span class="text-xs text-muted">${h.organizer}</span>
        </div>
        <span class="tag ${h.online ? 'tag-green' : 'tag-blue'}">${h.online ? '🌐 Online' : '📍 In-Person'}</span>
      </div>
      <div class="hackathon-card-meta">
        <span>📅 ${h.date}</span>
        <span>${h.online ? '' : '📍 ' + h.location}</span>
        <span>💰 ${h.prize}</span>
      </div>
      <div class="hackathon-card-tags">
        ${h.tags.map(t => `<span class="tag tag-outline">${t}</span>`).join('')}
      </div>
      <div class="hackathon-card-footer">
        <div style="display:flex;align-items:center;gap:8px">
          ${renderAvatarStack(h.attendees, 3)}
          <span class="text-xs text-muted">${h.attendees.length} interested</span>
        </div>
        <button class="btn ${isGoing ? 'btn-green btn-sm' : 'btn-outline btn-sm'}" onclick="event.stopPropagation(); toggleGoing(${h.id})">
          ${isGoing ? '✓ Going' : "I'm going"}
        </button>
      </div>
    </div>`;
}

let hackTagFilter = 'All';

function initHackathons() {
    hackTagFilter = 'All';
}

function filterHackTag(el) {
    document.querySelectorAll('.hack-tag-filter').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    hackTagFilter = el.dataset.tag;
    filterHackathons();
}

function toggleGoing(hackId) {
    const hack = HACKATHONS.find(h => h.id === hackId);
    if (!hack) return;
    const idx = hack.attendees.indexOf(CURRENT_USER.id);
    if (idx >= 0) {
        hack.attendees.splice(idx, 1);
    } else {
        hack.attendees.push(CURRENT_USER.id);
    }
    filterHackathons();
}

function filterHackathons() {
    const search = document.getElementById('hackSearch')?.value.toLowerCase() || '';

    let filtered = HACKATHONS.filter(h => {
        if (search && !h.name.toLowerCase().includes(search) && !h.tags.some(t => t.toLowerCase().includes(search))) return false;
        if (hackTagFilter !== 'All') {
            if (hackTagFilter === 'Online') {
                if (!h.online) return false;
            } else if (!h.tags.includes(hackTagFilter)) return false;
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
