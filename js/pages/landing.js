// ===== LANDING PAGE =====
function renderLanding() {
  const lookingForTeam = USERS.filter(u => u.openToTeam).slice(0, 8);
  const featuredHackathons = HACKATHONS.slice(0, 3);

  return `
    <div class="page">
      <!-- Hero -->
      <section class="hero">
        <div class="container">
          <h1 class="animate-fade-in">Find Your Dream<br><span class="text-gradient">Code Sathi</span></h1>
          <p class="animate-fade-in stagger-2">Connect with talented developers, designers, and innovators. Build something amazing together — at any hackathon, anywhere in the world.</p>
          <div class="hero-ctas animate-fade-in stagger-3">
            <a href="#onboarding" class="btn btn-primary btn-lg">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Join Code Sathi
            </a>
            <a href="#hackathons" class="btn btn-secondary btn-lg">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Browse Hackathons
            </a>
          </div>
          <div class="hero-stats animate-fade-in stagger-4">
            <div class="hero-stat">
              <h3 class="text-gradient">2,400+</h3>
              <p>Active Hackers</p>
            </div>
            <div class="hero-stat">
              <h3 class="text-gradient">150+</h3>
              <p>Hackathons</p>
            </div>
            <div class="hero-stat">
              <h3 class="text-gradient">800+</h3>
              <p>Teams Formed</p>
            </div>
            <div class="hero-stat">
              <h3 class="text-gradient">320+</h3>
              <p>Projects Built</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Feed -->
      <section class="section" style="padding-top:40px">
        <div class="container">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:32px;">
            <div>
              <h2>People Looking for Teams</h2>
              <p class="text-muted" style="margin-top:4px">Connect with hackers who are ready to build</p>
            </div>
            <a href="#discover" class="btn btn-ghost">View all →</a>
          </div>
          <div class="grid-4">
            ${lookingForTeam.map((u, i) => renderPersonCard(u, i)).join('')}
          </div>
        </div>
      </section>

      <!-- Featured Hackathons -->
      <section class="section" style="padding-top:0">
        <div class="container">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:32px;">
            <div>
              <h2>Upcoming Hackathons</h2>
              <p class="text-muted" style="margin-top:4px">Find your next hackathon and signal your interest</p>
            </div>
            <a href="#hackathons" class="btn btn-ghost">View all →</a>
          </div>
          <div class="grid-3">
            ${featuredHackathons.map((h, i) => `
              <div class="hackathon-card animate-fade-in stagger-${i + 1}" onclick="navigateTo('hackathon/${h.id}')">
                <div style="height:8px;border-radius:4px 4px 0 0;margin:-24px -24px 20px;background:${h.bannerGradient}"></div>
                <div class="hackathon-card-header">
                  <h4>${h.name}</h4>
                  <span class="tag ${h.online ? 'tag-green' : 'tag-blue'}">${h.online ? '🌐 Online' : '📍 In-Person'}</span>
                </div>
                <div class="hackathon-card-meta">
                  <span>📅 ${h.date}</span>
                  <span>💰 ${h.prize}</span>
                </div>
                <div class="hackathon-card-tags">
                  ${h.tags.map(t => `<span class="tag tag-outline">${t}</span>`).join('')}
                </div>
                <div class="hackathon-card-footer">
                  ${renderAvatarStack(h.attendees)}
                  <span class="text-xs text-muted">${h.attendees.length} interested</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="section" style="padding-top:0;padding-bottom:80px">
        <div class="container" style="text-align:center">
          <div class="card" style="padding:60px 40px;background:linear-gradient(135deg, rgba(0,212,255,0.08), rgba(168,85,247,0.08));border-color:rgba(0,212,255,0.15)">
            <h2 style="margin-bottom:12px">Ready to find your team?</h2>
            <p class="text-muted" style="max-width:500px;margin:0 auto 24px">Set up your profile in under 2 minutes and start connecting with talented hackers worldwide.</p>
            <a href="#onboarding" class="btn btn-primary btn-lg">Get Started Free</a>
          </div>
        </div>
      </section>
    </div>`;
}
