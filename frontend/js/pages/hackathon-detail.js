let currentHackathonDetail = null;

function renderHackathonDetail(hackId) {
  const fallback = HACKATHONS.find((h) => h.id === Number(hackId));
  if (!fallback) {
    return '<div class="page"><div class="container"><div class="card" style="margin-top:24px"><h3>Hackathon not found</h3></div></div></div>';
  }

  return renderHackathonDetailView({
    ...fallback,
    attendeeIds: fallback.attendees,
    attendeeCount: fallback.attendees.length,
    isGoing: fallback.attendees.includes(CURRENT_USER.id),
  },
  fallback.attendees.map((id) => USERS.find((u) => u.id === id)).filter(Boolean),
  TEAM_POSTINGS.filter((t) => t.hackathonId === fallback.id));
}

function renderHackathonDetailView(hack, attendees, teams) {
  return `
    <div class="page">
      <div class="container" style="max-width:960px">
        <div class="card animate-fade-in" style="padding:0;overflow:hidden;margin-bottom:32px">
          <div style="height:120px;background:${escapeHtml(hack.bannerGradient || 'linear-gradient(90deg,#00d4ff,#a855f7)')};display:flex;align-items:flex-end;padding:24px">
            <span class="tag ${hack.online ? 'tag-green' : 'tag-blue'}" style="font-size:13px">${hack.online ? 'Online' : `In-person: ${escapeHtml(hack.location)}`}</span>
          </div>
          <div style="padding:32px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px">
              <div>
                <h1 style="font-size:2rem;margin-bottom:8px">${escapeHtml(hack.name)}</h1>
                <p class="text-muted" style="font-size:14px">Organized by ${escapeHtml(hack.organizer)}</p>
              </div>
              <button class="btn ${hack.isGoing ? 'btn-green' : 'btn-primary'}" type="button" onclick="toggleDetailGoing(${hack.id})">
                ${hack.isGoing ? 'Going' : "I'm going"}
              </button>
            </div>
            <div style="display:flex;gap:24px;margin:24px 0;flex-wrap:wrap">
              <div class="card" style="flex:1;min-width:140px;padding:16px;text-align:center"><div class="text-xs text-muted" style="margin-bottom:4px">DATE</div><div style="font-weight:600">${escapeHtml(hack.date)}</div></div>
              <div class="card" style="flex:1;min-width:140px;padding:16px;text-align:center"><div class="text-xs text-muted" style="margin-bottom:4px">LOCATION</div><div style="font-weight:600">${hack.online ? 'Online' : escapeHtml(hack.location)}</div></div>
              <div class="card" style="flex:1;min-width:140px;padding:16px;text-align:center"><div class="text-xs text-muted" style="margin-bottom:4px">PRIZE</div><div style="font-weight:600">${escapeHtml(hack.prize)}</div></div>
              <div class="card" style="flex:1;min-width:140px;padding:16px;text-align:center"><div class="text-xs text-muted" style="margin-bottom:4px">INTERESTED</div><div style="font-weight:600">${hack.attendeeCount}</div></div>
            </div>
            <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:16px">${escapeHtml(hack.description || '')}</p>
            <div style="display:flex;flex-wrap:wrap;gap:8px">${(hack.tags || []).map((t) => `<span class="tag tag-outline">${escapeHtml(t)}</span>`).join('')}</div>
          </div>
        </div>

        <div class="tabs">
          <button class="tab active" type="button" onclick="showHackTab('people', this)">People (${attendees.length})</button>
          <button class="tab" type="button" onclick="showHackTab('teams', this)">Open Teams (${teams.length})</button>
        </div>

        <div id="hackTab-people">
          <div class="grid-3">
            ${attendees.length > 0
              ? attendees.map((u, i) => renderPersonCard(u, i)).join('')
              : '<div style="grid-column:1/-1;text-align:center;padding:40px"><p class="text-muted">No one has signaled interest yet.</p></div>'}
          </div>
        </div>

        <div id="hackTab-teams" style="display:none">
          <div class="grid-2">
            ${teams.length > 0
              ? teams.map((team) => renderHackathonTeamCard(team)).join('')
              : '<div style="grid-column:1/-1;text-align:center;padding:40px"><p class="text-muted">No open teams yet.</p></div>'}
          </div>
        </div>
      </div>
    </div>`;
}

function renderHackathonTeamCard(team) {
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
        <div class="team-card-roles">${(team.rolesNeeded || []).map((r) => `<span class="tag tag-blue">${escapeHtml(r)}</span>`).join('')}</div>
      </div>
      <div class="progress-bar" style="margin-bottom:16px"><div class="progress-bar-fill" style="width:${Math.min(100, (team.currentSize / team.maxSize) * 100)}%"></div></div>
      <div style="display:flex;justify-content:flex-end">
        <button class="btn btn-primary btn-sm" type="button" onclick="joinTeamFromHackathon(${team.id})">Join</button>
      </div>
    </div>`;
}

async function initHackathonDetail(hackId) {
  const id = Number(hackId);
  if (!id) return;

  try {
    const data = await apiRequest(`/api/hackathons/${id}`, {
      auth: Boolean(getAuthToken()),
      retries: 1,
      timeoutMs: 10000,
    });

    currentHackathonDetail = data;
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = renderHackathonDetailView(data.hackathon, data.attendees || [], data.teams || []);
    }
  } catch {
    showToast('Could not refresh hackathon details.', 'error');
  }
}

async function toggleDetailGoing(hackId) {
  if (!getAuthToken()) {
    showToast('Please sign in to mark attendance.', 'error');
    navigateTo('login');
    return;
  }

  try {
    const data = await apiRequest(`/api/hackathons/${hackId}/toggle-going`, {
      method: 'POST',
      auth: true,
      timeoutMs: 10000,
    });

    if (currentHackathonDetail?.hackathon?.id === hackId) {
      currentHackathonDetail.hackathon = { ...currentHackathonDetail.hackathon, ...data.hackathon };
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = renderHackathonDetailView(
          currentHackathonDetail.hackathon,
          currentHackathonDetail.attendees || [],
          currentHackathonDetail.teams || [],
        );
      }
    }
  } catch (err) {
    showToast(err.message || 'Could not update attendance.', 'error');
  }
}

function showHackTab(tab, el) {
  document.querySelectorAll('.tabs .tab').forEach((t) => t.classList.remove('active'));
  el.classList.add('active');
  const people = document.getElementById('hackTab-people');
  const teams = document.getElementById('hackTab-teams');
  if (people) people.style.display = tab === 'people' ? 'block' : 'none';
  if (teams) teams.style.display = tab === 'teams' ? 'block' : 'none';
}

async function joinTeamFromHackathon(teamId) {
  if (!getAuthToken()) {
    showToast('Please sign in to join a team.', 'error');
    navigateTo('login');
    return;
  }

  try {
    await apiRequest(`/api/teams/${teamId}/join`, {
      method: 'POST',
      auth: true,
      timeoutMs: 10000,
    });
    showToast('You joined the team.', 'success');
    await initHackathonDetail(currentHackathonDetail?.hackathon?.id || 0);
  } catch (err) {
    showToast(err.message || 'Could not join this team.', 'error');
  }
}
