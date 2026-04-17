let teamPostingsCache = [...TEAM_POSTINGS];

function renderTeamBoard() {
  return `
    <div class="page">
      <div class="container">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:16px">
          <div>
            <h2>Team Board</h2>
            <p class="text-muted" style="margin-top:4px">Find open teams or create your own posting</p>
          </div>
          <button class="btn btn-primary" type="button" onclick="openTeamModal()">Create Posting</button>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap" id="teamFilters"></div>
        <div class="grid-2" id="teamGrid"></div>
      </div>

      <div class="modal-overlay" id="teamModal">
        <div class="modal">
          <div class="modal-header">
            <h3>Create Team Posting</h3>
            <button class="modal-close" type="button" onclick="closeTeamModal()">✕</button>
          </div>
          <div class="form-group">
            <label class="form-label" for="teamHackathon">Hackathon</label>
            <select id="teamHackathon">${HACKATHONS.map((h) => `<option value="${h.id}">${escapeHtml(h.name)}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label class="form-label" for="teamIdea">Project Idea (optional)</label>
            <textarea id="teamIdea" placeholder="Describe your project idea..." rows="3" maxlength="300"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Roles Needed</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${ROLES.map((r) => `<button class="tag tag-outline tag-selectable team-role-select" type="button" data-role="${r}" onclick="this.classList.toggle('selected')">${escapeHtml(r)}</button>`).join('')}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="teamSize">Max Team Size</label>
            <select id="teamSize"><option value="3">3</option><option value="4" selected>4</option><option value="5">5</option><option value="6">6</option></select>
          </div>
          <button class="btn btn-primary" id="teamCreateBtn" style="width:100%;margin-top:8px" type="button" onclick="submitTeamPosting()">Post to Board</button>
        </div>
      </div>
    </div>`;
}

function initTeamBoard() {
  teamPostingsCache = [...TEAM_POSTINGS];
  renderTeamFilters();
  filterTeams('All');
  loadTeams();
}

function renderTeamBoardCard(team) {
  return `
    <div class="team-card animate-fade-in">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span class="tag tag-purple">${escapeHtml(team.hackathonName || 'Hackathon')}</span>
        <span class="text-xs text-muted">${team.currentSize}/${team.maxSize} members</span>
      </div>
      ${team.projectIdea
        ? `<h4 style="margin-bottom:8px">${escapeHtml(team.projectIdea)}</h4>`
        : '<h4 style="margin-bottom:8px;color:var(--text-muted);font-style:italic">Idea TBD - open to brainstorming</h4>'}
      <div style="margin-bottom:12px">
        <span class="text-xs text-muted" style="display:block;margin-bottom:6px">ROLES NEEDED</span>
        <div class="team-card-roles">
          ${(team.rolesNeeded || []).map((r) => `<span class="tag tag-blue">${escapeHtml(r)}</span>`).join('')}
        </div>
      </div>
      <div class="progress-bar" style="margin-bottom:16px"><div class="progress-bar-fill" style="width:${Math.min(100, (team.currentSize / team.maxSize) * 100)}%"></div></div>
      <div style="display:flex;align-items:center;justify-content:flex-end">
        <button class="btn btn-primary btn-sm" type="button" onclick="joinTeam(${team.id})">Join</button>
      </div>
    </div>`;
}

function renderTeamFilters() {
  const wrap = document.getElementById('teamFilters');
  if (!wrap) return;

  const names = ['All', ...new Set(teamPostingsCache.map((t) => t.hackathonName).filter(Boolean))];
  wrap.innerHTML = names.map((name, index) => `
    <button class="tag tag-outline tag-selectable team-hack-filter ${index === 0 ? 'selected' : ''}" type="button" data-hack="${escapeHtml(name)}" onclick="filterTeamsByIndex(${index})">
      ${escapeHtml(name === 'All' ? 'All Hackathons' : name)}
    </button>`).join('');
}

function filterTeamsByIndex(index) {
  const names = ['All', ...new Set(teamPostingsCache.map((t) => t.hackathonName).filter(Boolean))];
  filterTeams(names[index] || 'All');
}

function filterTeams(hackName) {
  const selected = hackName || 'All';
  document.querySelectorAll('.team-hack-filter').forEach((b) => {
    b.classList.toggle('selected', b.dataset.hack === selected);
  });

  const filtered = selected === 'All' ? teamPostingsCache : teamPostingsCache.filter((t) => t.hackathonName === selected);
  const grid = document.getElementById('teamGrid');
  if (!grid) return;

  grid.innerHTML = filtered.length > 0
    ? filtered.map((team) => renderTeamBoardCard(team)).join('')
    : '<div style="grid-column:1/-1;text-align:center;padding:40px"><p class="text-muted">No open teams for this hackathon.</p></div>';
}

function openTeamModal() {
  if (!getAuthToken()) {
    showToast('Please sign in to create a team posting.', 'error');
    navigateTo('login');
    return;
  }

  document.getElementById('teamModal')?.classList.add('active');
}

function closeTeamModal() {
  document.getElementById('teamModal')?.classList.remove('active');
}

async function submitTeamPosting() {
  const hackathonId = Number(document.getElementById('teamHackathon')?.value || 0);
  const projectIdea = document.getElementById('teamIdea')?.value?.trim() || '';
  const maxSize = Number(document.getElementById('teamSize')?.value || 4);
  const rolesNeeded = [...document.querySelectorAll('.team-role-select.selected')].map((el) => el.dataset.role);
  const btn = document.getElementById('teamCreateBtn');

  if (!hackathonId || rolesNeeded.length === 0) {
    showToast('Choose a hackathon and at least one role.', 'error');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Posting...';
  }

  try {
    const data = await apiRequest('/api/teams', {
      method: 'POST',
      auth: true,
      body: { hackathonId, projectIdea: projectIdea || null, rolesNeeded, maxSize },
      timeoutMs: 10000,
    });

    teamPostingsCache = [data.team, ...teamPostingsCache];
    renderTeamFilters();
    filterTeams('All');
    closeTeamModal();
    showToast('Team posting created.', 'success');
  } catch (err) {
    showToast(err.message || 'Could not create posting.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Post to Board';
    }
  }
}

async function joinTeam(teamId) {
  if (!getAuthToken()) {
    showToast('Please sign in to join a team.', 'error');
    navigateTo('login');
    return;
  }

  try {
    const data = await apiRequest(`/api/teams/${teamId}/join`, {
      method: 'POST',
      auth: true,
      timeoutMs: 10000,
    });

    teamPostingsCache = teamPostingsCache.map((team) => (team.id === teamId ? data.team : team));
    filterTeams(document.querySelector('.team-hack-filter.selected')?.dataset.hack || 'All');
    showToast('You joined the team.', 'success');
  } catch (err) {
    showToast(err.message || 'Could not join this team.', 'error');
  }
}

async function loadTeams() {
  try {
    const data = await apiRequest('/api/teams', {
      retries: 1,
      timeoutMs: 10000,
    });
    if (Array.isArray(data.teams)) {
      teamPostingsCache = data.teams;
      renderTeamFilters();
      filterTeams('All');
    }
  } catch {
    showToast('Using local team listings.', 'info');
  }
}
