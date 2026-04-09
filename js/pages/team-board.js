// ===== TEAM BOARD =====
function renderTeamBoard() {
    return `
    <div class="page">
      <div class="container">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:16px">
          <div>
            <h2>Team Board</h2>
            <p class="text-muted" style="margin-top:4px">Find open teams or create your own posting</p>
          </div>
          <button class="btn btn-primary" onclick="openTeamModal()">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Posting
          </button>
        </div>

        <!-- Filter row -->
        <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap" id="teamFilters">
          <button class="tag tag-outline tag-selectable selected team-hack-filter" data-hack="All" onclick="filterTeams(this)">All Hackathons</button>
          ${[...new Set(TEAM_POSTINGS.map(t => t.hackathonName))].map(h => `
            <button class="tag tag-outline tag-selectable team-hack-filter" data-hack="${h}" onclick="filterTeams(this)">${h}</button>
          `).join('')}
        </div>

        <div class="grid-2" id="teamGrid">
          ${TEAM_POSTINGS.map(t => renderTeamCard(t)).join('')}
        </div>
      </div>

      <!-- Create Team Modal -->
      <div class="modal-overlay" id="teamModal">
        <div class="modal">
          <div class="modal-header">
            <h3>Create Team Posting</h3>
            <button class="modal-close" onclick="closeTeamModal()">✕</button>
          </div>
          <div class="form-group">
            <label class="form-label">Hackathon</label>
            <select id="teamHackathon">
              ${HACKATHONS.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Project Idea (optional)</label>
            <textarea id="teamIdea" placeholder="Describe your project idea..." rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Roles Needed</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${ROLES.map(r => `
                <button class="tag tag-outline tag-selectable team-role-select" data-role="${r}" onclick="this.classList.toggle('selected')">${r}</button>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Max Team Size</label>
            <select id="teamSize">
              <option value="3">3</option>
              <option value="4" selected>4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>
          <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="submitTeamPosting()">
            Post to Board
          </button>
        </div>
      </div>
    </div>`;
}

function initTeamBoard() { }

function filterTeams(el) {
    document.querySelectorAll('.team-hack-filter').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    const hack = el.dataset.hack;

    const filtered = hack === 'All' ? TEAM_POSTINGS : TEAM_POSTINGS.filter(t => t.hackathonName === hack);
    const grid = document.getElementById('teamGrid');
    if (grid) {
        grid.innerHTML = filtered.length > 0
            ? filtered.map(t => renderTeamCard(t)).join('')
            : '<div style="grid-column:1/-1;text-align:center;padding:40px"><p class="text-muted">No open teams for this hackathon.</p></div>';
    }
}

function openTeamModal() {
    document.getElementById('teamModal').classList.add('active');
}

function closeTeamModal() {
    document.getElementById('teamModal').classList.remove('active');
}

function submitTeamPosting() {
    closeTeamModal();
    // Visual feedback: re-render with success feel
    const grid = document.getElementById('teamGrid');
    if (grid) {
        const successMsg = document.createElement('div');
        successMsg.className = 'card animate-fade-in';
        successMsg.style.cssText = 'grid-column:1/-1;text-align:center;padding:20px;border-color:var(--accent-green);background:rgba(0,255,136,0.05)';
        successMsg.innerHTML = '<p style="color:var(--accent-green);font-weight:600">✓ Team posting created successfully!</p>';
        grid.prepend(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
    }
}
