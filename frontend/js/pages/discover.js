// ===== DISCOVER PAGE =====
function renderDiscover() {
    return `
    <div class="page">
      <div class="container">
        <div style="margin-bottom:32px">
          <h2>Discover Hackers</h2>
          <p class="text-muted" style="margin-top:4px">Find the perfect teammates for your next hackathon</p>
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

function initDiscover() {
    discoverViewMode = 'grid';
    filterSkills = [];
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
    filterDiscover();
}

function filterDiscover() {
    const search = document.getElementById('discoverSearch')?.value.toLowerCase() || '';
    const roles = [...document.querySelectorAll('.filter-role:checked')].map(cb => cb.value);
    const exps = [...document.querySelectorAll('.filter-exp:checked')].map(cb => cb.value);
    const tz = document.getElementById('filterTimezone')?.value || '';
    const openOnly = document.getElementById('filterOpen')?.checked || false;

    let filtered = USERS.filter(u => {
        if (search && !u.name.toLowerCase().includes(search) && !u.skills.some(s => s.toLowerCase().includes(search)) && !u.role.toLowerCase().includes(search)) return false;
        if (roles.length > 0 && !roles.includes(u.role)) return false;
        if (exps.length > 0 && !exps.includes(u.experience)) return false;
        if (filterSkills.length > 0 && !filterSkills.some(s => u.skills.includes(s))) return false;
        if (tz && u.timezone !== tz) return false;
        if (openOnly && !u.openToTeam) return false;
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
