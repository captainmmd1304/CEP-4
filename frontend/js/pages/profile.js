// ===== PROFILE PAGE =====
function renderProfile(userId) {
    const user = userId ? USERS.find(u => u.id === parseInt(userId)) : CURRENT_USER;
    if (!user) return '<div class="page"><div class="container"><h2>User not found</h2></div></div>';

    const isOwnProfile = user.id === CURRENT_USER.id;
    const userHackathons = HACKATHONS.filter(h => h.attendees.includes(user.id));
    const userTeams = TEAM_POSTINGS.filter(t => t.members.some(m => m.id === user.id));
    const userProjects = SHOWCASE_PROJECTS.filter(p => p.team.some(m => m.id === user.id));

    return `
    <div class="page">
      <div class="container" style="max-width:900px">
        <!-- Profile Header -->
        <div class="card animate-fade-in" style="padding:40px;margin-bottom:32px">
          <div class="profile-header">
            <div style="position:relative">
              ${renderAvatar(user, 'avatar-xl')}
              ${user.openToTeam ? '<div class="badge-status badge-online" style="position:absolute;bottom:-4px;right:-4px;font-size:11px">Open</div>' : ''}
            </div>
            <div class="profile-info">
              <h2 style="margin-bottom:4px">${user.name}</h2>
              <p class="text-muted" style="margin-bottom:8px">${user.role} · ${user.experience}</p>
              <p style="color:var(--text-secondary);line-height:1.6;max-width:500px">${user.bio}</p>
              
              <div class="profile-stats">
                <div class="profile-stat">
                  <div class="profile-stat-value">${user.hackathonsAttended}</div>
                  <div class="profile-stat-label">Hackathons</div>
                </div>
                <div class="profile-stat">
                  <div class="profile-stat-value">${user.teamsFormed}</div>
                  <div class="profile-stat-label">Teams</div>
                </div>
                <div class="profile-stat">
                  <div class="profile-stat-value">${user.projectsBuilt}</div>
                  <div class="profile-stat-label">Projects</div>
                </div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0">
              ${isOwnProfile
            ? `<div style="display:flex;align-items:center;gap:8px">
                     <span class="text-sm">Open to team up</span>
                     <div class="toggle ${user.openToTeam ? 'active' : ''}" onclick="this.classList.toggle('active')"></div>
                   </div>`
            : `<button class="btn btn-primary">
                     <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                     Connect
                   </button>`
        }
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px" id="profileGrid">
          <!-- Skills -->
          <div class="card animate-fade-in stagger-1" style="grid-column:1/-1">
            <div class="profile-section" style="margin-bottom:0">
              <h3>🛠️ Skills</h3>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                ${user.skills.map(s => renderSkillTag(s)).join('')}
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="card animate-fade-in stagger-2">
            <div class="profile-section" style="margin-bottom:0">
              <h3>📋 Info</h3>
              <div style="display:flex;flex-direction:column;gap:12px">
                <div style="display:flex;justify-content:space-between;font-size:14px">
                  <span class="text-muted">Experience</span>
                  <span style="font-weight:500">${user.experience}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:14px">
                  <span class="text-muted">Role</span>
                  <span style="font-weight:500">${user.role}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:14px">
                  <span class="text-muted">Timezone</span>
                  <span style="font-weight:500">${user.timezone}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Links -->
          <div class="card animate-fade-in stagger-3">
            <div class="profile-section" style="margin-bottom:0">
              <h3>🔗 Links</h3>
              <div style="display:flex;flex-direction:column;gap:8px">
                <a href="https://${user.github}" target="_blank" class="btn btn-secondary" style="justify-content:flex-start">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  GitHub
                </a>
                <a href="https://${user.linkedin}" target="_blank" class="btn btn-secondary" style="justify-content:flex-start">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <!-- Hackathons Attended -->
          <div class="card animate-fade-in stagger-4" style="grid-column:1/-1">
            <div class="profile-section" style="margin-bottom:0">
              <h3>🚀 Hackathons</h3>
              ${userHackathons.length > 0
            ? `<div style="display:flex;gap:12px;flex-wrap:wrap">${userHackathons.map(h => `
                    <div class="card" style="padding:14px 18px;cursor:pointer;flex:1;min-width:200px" onclick="navigateTo('hackathon/${h.id}')">
                      <div style="height:4px;border-radius:2px;margin:-14px -18px 12px;background:${h.bannerGradient}"></div>
                      <h5>${h.name}</h5>
                      <span class="text-xs text-muted">${h.date}</span>
                    </div>
                  `).join('')}</div>`
            : '<p class="text-muted">No hackathons yet.</p>'
        }
            </div>
          </div>

          <!-- Projects Built -->
          <div class="card animate-fade-in stagger-5" style="grid-column:1/-1">
            <div class="profile-section" style="margin-bottom:0">
              <h3>💡 Projects</h3>
              ${userProjects.length > 0
            ? `<div style="display:flex;gap:16px;flex-wrap:wrap">${userProjects.map(p => `
                    <div class="card" style="flex:1;min-width:260px;padding:0;overflow:hidden">
                      <div style="height:60px;background:${p.bannerGradient};position:relative">
                        ${p.placement ? `<div class="project-card-win">${p.placement}</div>` : ''}
                      </div>
                      <div style="padding:16px">
                        <h5 style="margin-bottom:4px">${p.name}</h5>
                        <span class="text-xs text-muted">${p.hackathon}</span>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">
                          ${p.techStack.map(t => `<span class="tag tag-outline" style="font-size:11px;padding:2px 8px">${t}</span>`).join('')}
                        </div>
                      </div>
                    </div>
                  `).join('')}</div>`
            : '<p class="text-muted">No projects yet.</p>'
        }
            </div>
          </div>

          <!-- Endorsements -->
          ${isOwnProfile ? `
          <div class="card animate-fade-in stagger-6" style="grid-column:1/-1">
            <div class="profile-section" style="margin-bottom:0">
              <h3>⭐ Endorsements</h3>
              ${ENDORSEMENTS.map(e => `
                <div class="endorsement">
                  ${renderAvatar(e.from, 'avatar-sm')}
                  <div style="flex:1">
                    <div style="display:flex;align-items:center;gap:8px">
                      <span style="font-weight:600;font-size:14px">${e.from.name}</span>
                      <span class="tag ${getSkillColorClass(e.skill)}" style="font-size:11px;padding:2px 8px">${e.skill}</span>
                    </div>
                    <p class="text-sm text-muted" style="margin-top:2px">"${e.comment}"</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    </div>`;
}
