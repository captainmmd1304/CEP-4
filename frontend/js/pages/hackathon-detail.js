// ===== HACKATHON DETAIL PAGE =====
function renderHackathonDetail(hackId) {
    const hack = HACKATHONS.find(h => h.id === parseInt(hackId));
    if (!hack) return '<div class="page"><div class="container"><h2>Hackathon not found</h2></div></div>';

    const attendees = hack.attendees.map(id => USERS.find(u => u.id === id)).filter(Boolean);
    const teams = TEAM_POSTINGS.filter(t => t.hackathonId === hack.id);
    const isGoing = hack.attendees.includes(CURRENT_USER.id);

    return `
    <div class="page">
      <div class="container" style="max-width:960px">
        <!-- Banner -->
        <div class="card animate-fade-in" style="padding:0;overflow:hidden;margin-bottom:32px">
          <div style="height:120px;background:${hack.bannerGradient};display:flex;align-items:flex-end;padding:24px">
            <div style="display:flex;align-items:center;gap:12px">
              <span class="tag ${hack.online ? 'tag-green' : 'tag-blue'}" style="font-size:13px">${hack.online ? '🌐 Online' : '📍 ' + hack.location}</span>
            </div>
          </div>
          <div style="padding:32px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px">
              <div>
                <h1 style="font-size:2.25rem;margin-bottom:8px">${hack.name}</h1>
                <p class="text-muted" style="font-size:14px">Organized by ${hack.organizer}</p>
              </div>
              <button class="btn ${isGoing ? 'btn-green' : 'btn-primary'}" onclick="toggleGoing(${hack.id}); this.outerHTML = '<button class=\\'btn ${!isGoing ? 'btn-green' : 'btn-primary'}\\' >${!isGoing ? '✓ Going' : "I'm going"}</button>'">
                ${isGoing ? '✓ Going' : "I'm going"}
              </button>
            </div>
            
            <div style="display:flex;gap:24px;margin:24px 0;flex-wrap:wrap">
              <div class="card" style="flex:1;min-width:140px;padding:16px;text-align:center">
                <div class="text-xs text-muted" style="margin-bottom:4px">DATE</div>
                <div style="font-weight:600">📅 ${hack.date}</div>
              </div>
              <div class="card" style="flex:1;min-width:140px;padding:16px;text-align:center">
                <div class="text-xs text-muted" style="margin-bottom:4px">LOCATION</div>
                <div style="font-weight:600">${hack.online ? '🌐 Online' : '📍 ' + hack.location}</div>
              </div>
              <div class="card" style="flex:1;min-width:140px;padding:16px;text-align:center">
                <div class="text-xs text-muted" style="margin-bottom:4px">PRIZE POOL</div>
                <div style="font-weight:600;color:var(--accent-green)">💰 ${hack.prize}</div>
              </div>
              <div class="card" style="flex:1;min-width:140px;padding:16px;text-align:center">
                <div class="text-xs text-muted" style="margin-bottom:4px">INTERESTED</div>
                <div style="font-weight:600;color:var(--accent-blue)">👥 ${hack.attendees.length} people</div>
              </div>
            </div>

            <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:16px">${hack.description}</p>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${hack.tags.map(t => `<span class="tag tag-outline">${t}</span>`).join('')}
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab active" onclick="showHackTab('people', this)">👥 People Looking (${attendees.length})</button>
          <button class="tab" onclick="showHackTab('teams', this)">🏗️ Open Teams (${teams.length})</button>
        </div>

        <!-- People Tab -->
        <div id="hackTab-people">
          <div class="grid-3">
            ${attendees.length > 0
            ? attendees.map((u, i) => renderPersonCard(u, i)).join('')
            : '<div style="grid-column:1/-1;text-align:center;padding:40px"><p class="text-muted">No one has signaled interest yet. Be the first!</p></div>'
        }
          </div>
        </div>

        <!-- Teams Tab -->
        <div id="hackTab-teams" style="display:none">
          <div class="grid-2">
            ${teams.length > 0
            ? teams.map(t => renderTeamCard(t)).join('')
            : '<div style="grid-column:1/-1;text-align:center;padding:40px"><p class="text-muted">No open teams yet. Create one!</p></div>'
        }
          </div>
        </div>
      </div>
    </div>`;
}

function renderTeamCard(team) {
    return `
    <div class="team-card animate-fade-in">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span class="tag tag-purple">${team.hackathonName}</span>
        <span class="text-xs text-muted">${team.currentSize}/${team.maxSize} members</span>
      </div>
      ${team.projectIdea
            ? `<h4 style="margin-bottom:8px">${team.projectIdea}</h4>`
            : '<h4 style="margin-bottom:8px;color:var(--text-muted);font-style:italic">Idea TBD — open to brainstorming</h4>'
        }
      <div style="margin-bottom:12px">
        <span class="text-xs text-muted" style="display:block;margin-bottom:6px">ROLES NEEDED</span>
        <div class="team-card-roles">
          ${team.rolesNeeded.map(r => `<span class="tag tag-blue">${r}</span>`).join('')}
        </div>
      </div>
      <div class="progress-bar" style="margin-bottom:16px">
        <div class="progress-bar-fill" style="width:${(team.currentSize / team.maxSize) * 100}%"></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:8px">
          ${renderAvatarStack(team.members.map(m => m.id), 3)}
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm">Message</button>
          <button class="btn btn-primary btn-sm">Join</button>
        </div>
      </div>
    </div>`;
}

function showHackTab(tab, el) {
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('hackTab-people').style.display = tab === 'people' ? 'block' : 'none';
    document.getElementById('hackTab-teams').style.display = tab === 'teams' ? 'block' : 'none';
}
