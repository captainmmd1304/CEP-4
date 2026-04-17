// ===== POST-HACKATHON SHOWCASE =====
function renderShowcase() {
  return `
    <div class="page">
      <div class="container">
        <div style="margin-bottom:32px">
          <h2>Project Showcase</h2>
          <p class="text-muted" style="margin-top:4px">Explore amazing projects built by Code Sathi teams</p>
        </div>

        <!-- Filters -->
        <div style="display:flex;gap:8px;margin-bottom:32px;flex-wrap:wrap">
          <button class="tag tag-outline tag-selectable selected showcase-filter" data-filter="All" onclick="filterShowcase(this)">All Projects</button>
          <button class="tag tag-outline tag-selectable showcase-filter" data-filter="winner" onclick="filterShowcase(this)">🏆 Winners</button>
          ${[...new Set(SHOWCASE_PROJECTS.map(p => p.hackathon))].map(h => `
            <button class="tag tag-outline tag-selectable showcase-filter" data-filter="${h}" onclick="filterShowcase(this)">${h}</button>
          `).join('')}
        </div>

        <div class="grid-3" id="showcaseGrid">
          ${SHOWCASE_PROJECTS.map((p, i) => renderProjectCard(p, i)).join('')}
        </div>
      </div>
    </div>`;
}

function renderProjectCard(project, i = 0) {
  const safeLink = safeExternalUrl(project.link);
  return `
    <div class="project-card animate-fade-in stagger-${(i % 8) + 1}">
      <div class="project-card-banner" style="background:${escapeHtml(project.bannerGradient)}">
        ${project.placement ? `<div class="project-card-win">${escapeHtml(project.placement)}</div>` : ''}
      </div>
      <div class="project-card-body">
        <h4 style="margin-bottom:4px">${escapeHtml(project.name)}</h4>
        <span class="text-xs text-muted" style="display:block;margin-bottom:12px">${escapeHtml(project.hackathon)}</span>
        <p class="text-sm text-muted" style="margin-bottom:16px;line-height:1.6">${escapeHtml(project.description)}</p>
        
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
          ${project.techStack.map(t => `<span class="tag tag-outline" style="font-size:11px">${escapeHtml(t)}</span>`).join('')}
        </div>
        
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:8px">
            ${renderAvatarStack(project.team.map(m => m.id), 3)}
            <span class="text-xs text-muted">${project.team.length} members</span>
          </div>
          ${safeLink
            ? `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">View</a>`
            : '<span class="text-xs text-muted">No link</span>'}
        </div>
      </div>
    </div>`;
}

function filterShowcase(el) {
  document.querySelectorAll('.showcase-filter').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  const filter = el.dataset.filter;

  let filtered = SHOWCASE_PROJECTS;
  if (filter === 'winner') {
    filtered = SHOWCASE_PROJECTS.filter(p => p.placement);
  } else if (filter !== 'All') {
    filtered = SHOWCASE_PROJECTS.filter(p => p.hackathon === filter);
  }

  const grid = document.getElementById('showcaseGrid');
  if (grid) {
    grid.innerHTML = filtered.length > 0
      ? filtered.map((p, i) => renderProjectCard(p, i)).join('')
      : '<div style="grid-column:1/-1;text-align:center;padding:60px 0"><p class="text-muted">No projects match your filter.</p></div>';
  }
}
