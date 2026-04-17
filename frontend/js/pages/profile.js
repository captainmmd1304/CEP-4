function renderProfile() {
  return `<div class="page" id="profile-wrapper">
    <div style="display:flex;align-items:center;justify-content:center;min-height:360px">
      <div class="text-muted">Loading profile...</div>
    </div>
  </div>`;
}

async function initProfile(userId) {
  const wrapper = document.getElementById('profile-wrapper');
  if (!wrapper) return;

  try {
    const fetchId = Number(userId || getCurrentUserId() || 1);
    if (!Number.isFinite(fetchId)) throw new Error('Invalid user id');

    const data = await apiRequest(`/api/users/${fetchId}`, {
      retries: 1,
      timeoutMs: 10000,
    });

    const currentLoggedId = getCurrentUserId();
    const isOwnProfile = data.user.id === currentLoggedId;
    const user = data.user;
    const userHackathons = Array.isArray(data.hackathons) ? data.hackathons : [];
    const userProjects = Array.isArray(data.projects) ? data.projects : [];
    const endorsements = Array.isArray(data.endorsements) ? data.endorsements : [];

    const githubUrl = safeExternalUrl(user.github);
    const linkedinUrl = safeExternalUrl(user.linkedin);

    wrapper.innerHTML = `
    <div class="page">
      <div class="container" style="max-width:900px">
        <div class="card animate-fade-in" style="padding:40px;margin-bottom:32px">
          <div class="profile-header">
            <div style="position:relative">
              ${renderAvatar(user, 'avatar-xl')}
              ${user.openToTeam ? '<div class="badge-status badge-online" style="position:absolute;bottom:-4px;right:-4px;font-size:11px">Open</div>' : ''}
            </div>
            <div class="profile-info">
              <h2 style="margin-bottom:4px">${escapeHtml(user.name)}</h2>
              <p class="text-muted" style="margin-bottom:8px">${escapeHtml(user.role)} · ${escapeHtml(user.experience)}</p>
              <p style="color:var(--text-secondary);line-height:1.6;max-width:500px">${escapeHtml(user.bio || '')}</p>

              <div class="profile-stats">
                <div class="profile-stat"><div class="profile-stat-value">${user.hackathonsAttended}</div><div class="profile-stat-label">Hackathons</div></div>
                <div class="profile-stat"><div class="profile-stat-value">${user.teamsFormed}</div><div class="profile-stat-label">Teams</div></div>
                <div class="profile-stat"><div class="profile-stat-value">${user.projectsBuilt}</div><div class="profile-stat-label">Projects</div></div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0">
              ${isOwnProfile
                ? `<div style="display:flex;align-items:center;gap:8px">
                    <span class="text-sm">Open to team up</span>
                    <button class="toggle ${user.openToTeam ? 'active' : ''}" type="button" onclick="toggleOpenToTeam(this, ${user.openToTeam})"></button>
                  </div>`
                : `<button class="btn btn-primary" type="button" onclick="showToast('Messaging starts from Discover or Hackathon pages.', 'info')">Connect</button>`}
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px" id="profileGrid">
          <div class="card animate-fade-in stagger-1" style="grid-column:1/-1">
            <div class="profile-section" style="margin-bottom:0">
              <h3>Skills</h3>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                ${(user.skills || []).length > 0 ? (user.skills || []).map((s) => renderSkillTag(s)).join('') : '<span class="text-muted">No skills listed yet.</span>'}
              </div>
            </div>
          </div>

          <div class="card animate-fade-in stagger-2">
            <div class="profile-section" style="margin-bottom:0">
              <h3>Info</h3>
              <div style="display:flex;flex-direction:column;gap:12px">
                <div style="display:flex;justify-content:space-between;font-size:14px"><span class="text-muted">Experience</span><span style="font-weight:500">${escapeHtml(user.experience)}</span></div>
                <div style="display:flex;justify-content:space-between;font-size:14px"><span class="text-muted">Role</span><span style="font-weight:500">${escapeHtml(user.role)}</span></div>
                <div style="display:flex;justify-content:space-between;font-size:14px"><span class="text-muted">Timezone</span><span style="font-weight:500">${escapeHtml(user.timezone)}</span></div>
              </div>
            </div>
          </div>

          <div class="card animate-fade-in stagger-3">
            <div class="profile-section" style="margin-bottom:0">
              <h3>Links</h3>
              <div style="display:flex;flex-direction:column;gap:8px">
                ${githubUrl ? `<a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="justify-content:flex-start">GitHub</a>` : '<span class="text-sm text-muted">GitHub not provided</span>'}
                ${linkedinUrl ? `<a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="justify-content:flex-start">LinkedIn</a>` : '<span class="text-sm text-muted">LinkedIn not provided</span>'}
              </div>
            </div>
          </div>

          <div class="card animate-fade-in stagger-4" style="grid-column:1/-1">
            <div class="profile-section" style="margin-bottom:0">
              <h3>Hackathons</h3>
              ${userHackathons.length > 0
                ? `<div style="display:flex;gap:12px;flex-wrap:wrap">${userHackathons.map((h) => `
                    <div class="card" style="padding:14px 18px;cursor:pointer;flex:1;min-width:200px" onclick="navigateTo('hackathon/${h.id}')">
                      <div style="height:4px;border-radius:2px;margin:-14px -18px 12px;background:${escapeHtml(h.bannerGradient || 'linear-gradient(90deg,#00d4ff,#a855f7)')}"></div>
                      <h5>${escapeHtml(h.name)}</h5>
                      <span class="text-xs text-muted">${escapeHtml(h.date)}</span>
                    </div>`).join('')}</div>`
                : '<p class="text-muted">No hackathons yet.</p>'}
            </div>
          </div>

          <div class="card animate-fade-in stagger-5" style="grid-column:1/-1">
            <div class="profile-section" style="margin-bottom:0">
              <h3>Projects</h3>
              ${userProjects.length > 0
                ? `<div style="display:flex;gap:16px;flex-wrap:wrap">${userProjects.map((p) => `
                    <div class="card" style="flex:1;min-width:260px;padding:0;overflow:hidden">
                      <div style="height:60px;background:${escapeHtml(p.bannerGradient || 'linear-gradient(90deg,#00d4ff,#a855f7)')};position:relative">
                        ${p.placement ? `<div class="project-card-win">${escapeHtml(p.placement)}</div>` : ''}
                      </div>
                      <div style="padding:16px">
                        <h5 style="margin-bottom:4px">${escapeHtml(p.name)}</h5>
                        <span class="text-xs text-muted">${escapeHtml(p.hackathon)}</span>
                      </div>
                    </div>`).join('')}</div>`
                : '<p class="text-muted">No projects yet.</p>'}
            </div>
          </div>

          ${isOwnProfile
            ? `<div class="card animate-fade-in stagger-6" style="grid-column:1/-1">
                <div class="profile-section" style="margin-bottom:0">
                  <h3>Endorsements</h3>
                  ${endorsements.length > 0
                    ? endorsements.map((e) => `
                      <div class="endorsement">
                        ${renderAvatar(e.from, 'avatar-sm')}
                        <div style="flex:1">
                          <div style="display:flex;align-items:center;gap:8px">
                            <span style="font-weight:600;font-size:14px">${escapeHtml(e.from.name)}</span>
                            <span class="tag tag-outline" style="font-size:11px;padding:2px 8px">${escapeHtml(e.skill)}</span>
                          </div>
                          <p class="text-sm text-muted" style="margin-top:2px">"${escapeHtml(e.comment)}"</p>
                        </div>
                      </div>`).join('')
                    : '<p class="text-muted">No endorsements yet.</p>'}
                </div>
              </div>`
            : ''}
        </div>
      </div>
    </div>`;
  } catch {
    wrapper.innerHTML = '<div class="page"><div class="container"><div class="card" style="margin-top:24px"><h3>User not found</h3><p class="text-muted">Try another profile from discover.</p></div></div></div>';
  }
}

async function toggleOpenToTeam(el, currentValue) {
  if (!getAuthToken()) {
    showToast('Please log in to update profile settings.', 'error');
    return;
  }

  const nextValue = !currentValue;
  el.disabled = true;

  try {
    await apiRequest('/api/users/me', {
      method: 'PATCH',
      auth: true,
      body: { openToTeam: nextValue },
      timeoutMs: 8000,
    });
    el.classList.toggle('active', nextValue);
    el.setAttribute('onclick', `toggleOpenToTeam(this, ${nextValue})`);
    showToast('Availability updated.', 'success');
  } catch (err) {
    showToast(err.message || 'Could not update availability.', 'error');
  } finally {
    el.disabled = false;
  }
}
