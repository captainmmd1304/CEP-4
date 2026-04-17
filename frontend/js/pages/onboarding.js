// ===== ONBOARDING / PROFILE SETUP =====
function renderOnboarding() {
  return `
    <div class="page">
      <div class="container" style="max-width:1000px">
        <div style="text-align:center;margin-bottom:40px">
          <h2>Set Up Your Profile</h2>
          <p class="text-muted">Tell us about yourself so we can match you with the right team.</p>
        </div>

        <!-- Steps -->
        <div class="steps-indicator" id="stepsIndicator">
          <div class="step-item active" data-step="1">
            <div class="step-circle">1</div>
            <span class="step-label">About You</span>
          </div>
          <div class="step-item" data-step="2">
            <div class="step-circle">2</div>
            <span class="step-label">Skills</span>
          </div>
          <div class="step-item" data-step="3">
            <div class="step-circle">3</div>
            <span class="step-label">Preferences</span>
          </div>
          <div class="step-item" data-step="4">
            <div class="step-circle">4</div>
            <span class="step-label">Links</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 360px;gap:40px" id="onboardingLayout">
          <!-- Form -->
          <div>
            <!-- Step 1 -->
            <div class="onboarding-step active" id="step1">
              <div class="card" style="padding:32px">
                <h3 style="margin-bottom:24px">👋 Account & About You</h3>
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input type="text" id="obName" placeholder="e.g. Aisha Patel" oninput="updatePreview()">
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" id="obEmail" placeholder="you@example.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Password</label>
                  <input type="password" id="obPassword" placeholder="Minimum 6 characters">
                </div>
                <div class="form-group">
                  <label class="form-label">Bio</label>
                  <textarea id="obBio" placeholder="Tell us about yourself in a few sentences..." rows="3" oninput="updatePreview()"></textarea>
                </div>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="onboarding-step" id="step2" style="display:none">
              <div class="card" style="padding:32px">
                <h3 style="margin-bottom:24px">🛠️ Skills & Experience</h3>
                <div class="form-group">
                  <label class="form-label">Select your skills</label>
                  <div style="display:flex;flex-wrap:wrap;gap:8px" id="skillsSelector">
                    ${SKILL_TAGS.map(s => `
                      <button class="tag tag-outline tag-selectable" data-skill="${s.name}" onclick="toggleSkill(this)">
                        ${s.name}
                      </button>
                    `).join('')}
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Experience Level</label>
                  <div style="display:flex;gap:8px">
                    ${EXPERIENCE_LEVELS.map(level => `
                      <button class="btn btn-secondary" style="flex:1" data-exp="${level}" onclick="selectExperience(this)">${level}</button>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="onboarding-step" id="step3" style="display:none">
              <div class="card" style="padding:32px">
                <h3 style="margin-bottom:24px">⚙️ Preferences</h3>
                <div class="form-group">
                  <label class="form-label">Timezone</label>
                  <select id="obTimezone" onchange="updatePreview()">
                    <option value="">Select your timezone</option>
                    ${TIMEZONES.map(tz => `<option value="${tz}">${tz}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Preferred Role</label>
                  <div style="display:flex;gap:8px;flex-wrap:wrap">
                    ${ROLES.map(role => `
                      <button class="btn btn-secondary" data-role="${role}" onclick="selectRole(this)">
                        ${role === 'Builder' ? '⚡' : role === 'Designer' ? '🎨' : role === 'PM' ? '📋' : '🧠'} ${role}
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4 -->
            <div class="onboarding-step" id="step4" style="display:none">
              <div class="card" style="padding:32px">
                <h3 style="margin-bottom:24px">🔗 Links</h3>
                <div class="form-group">
                  <label class="form-label">GitHub Profile</label>
                  <input type="url" id="obGithub" placeholder="https://github.com/username" oninput="updatePreview()">
                </div>
                <div class="form-group">
                  <label class="form-label">LinkedIn Profile</label>
                  <input type="url" id="obLinkedin" placeholder="https://linkedin.com/in/username" oninput="updatePreview()">
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div style="display:flex;justify-content:space-between;margin-top:24px" id="stepNav">
              <button class="btn btn-secondary" id="prevBtn" onclick="prevStep()" style="visibility:hidden">← Back</button>
              <button class="btn btn-primary" id="nextBtn" onclick="nextStep()">Continue →</button>
            </div>
          </div>

          <!-- Live Preview -->
          <div id="livePreview">
            <div class="card" style="padding:24px;position:sticky;top:calc(var(--nav-height) + 24px)">
              <div style="text-align:center;margin-bottom:16px">
                <span class="text-xs text-muted" style="text-transform:uppercase;letter-spacing:1px">Live Preview</span>
              </div>
              <div style="text-align:center;margin-bottom:20px">
                <div class="avatar avatar-xl" id="previewAvatar" style="background:${AVATAR_COLORS[0]};margin:0 auto 12px">?</div>
                <h4 id="previewName" style="color:var(--text-muted)">Your Name</h4>
                <span class="text-sm text-muted" id="previewRole">Role · Experience</span>
              </div>
              <p class="text-sm text-muted" id="previewBio" style="margin-bottom:16px;text-align:center;font-style:italic">Your bio will appear here...</p>
              <div style="margin-bottom:16px">
                <span class="text-xs text-muted" style="display:block;margin-bottom:8px">SKILLS</span>
                <div style="display:flex;flex-wrap:wrap;gap:6px" id="previewSkills">
                  <span class="tag tag-outline">No skills selected</span>
                </div>
              </div>
              <div style="display:flex;gap:16px;font-size:13px;color:var(--text-muted)" id="previewMeta">
                <span>🕐 —</span>
              </div>
              <div style="margin-top:16px;display:flex;gap:8px" id="previewLinks">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

let currentStep = 1;
let selectedSkills = [];
let selectedExperience = '';
let selectedRole = '';

function initOnboarding() {
  currentStep = 1;
  selectedSkills = [];
  selectedExperience = '';
  selectedRole = '';
}

function toggleSkill(el) {
  const skill = el.dataset.skill;
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) {
    selectedSkills.push(skill);
  } else {
    selectedSkills = selectedSkills.filter(s => s !== skill);
  }
  updatePreview();
}

function selectExperience(el) {
  document.querySelectorAll('[data-exp]').forEach(b => {
    b.classList.remove('btn-primary');
    b.classList.add('btn-secondary');
  });
  el.classList.remove('btn-secondary');
  el.classList.add('btn-primary');
  selectedExperience = el.dataset.exp;
  updatePreview();
}

function selectRole(el) {
  document.querySelectorAll('[data-role]').forEach(b => {
    b.classList.remove('btn-primary');
    b.classList.add('btn-secondary');
  });
  el.classList.remove('btn-secondary');
  el.classList.add('btn-primary');
  selectedRole = el.dataset.role;
  updatePreview();
}

function updatePreview() {
  const name = document.getElementById('obName')?.value;
  const bio = document.getElementById('obBio')?.value;
  const tz = document.getElementById('obTimezone')?.value;
  const github = document.getElementById('obGithub')?.value;
  const linkedin = document.getElementById('obLinkedin')?.value;

  const previewName = document.getElementById('previewName');
  const previewBio = document.getElementById('previewBio');
  const previewAvatar = document.getElementById('previewAvatar');
  const previewRole = document.getElementById('previewRole');
  const previewSkills = document.getElementById('previewSkills');
  const previewMeta = document.getElementById('previewMeta');
  const previewLinks = document.getElementById('previewLinks');

  if (previewName) previewName.textContent = name || 'Your Name';
  if (previewName) previewName.style.color = name ? 'var(--text-primary)' : 'var(--text-muted)';

  if (previewAvatar && name) {
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    previewAvatar.textContent = initials || '?';
  }

  if (previewBio) {
    previewBio.textContent = bio || 'Your bio will appear here...';
    previewBio.style.fontStyle = bio ? 'normal' : 'italic';
  }

  if (previewRole) {
    const parts = [];
    if (selectedRole) parts.push(selectedRole);
    if (selectedExperience) parts.push(selectedExperience);
    previewRole.textContent = parts.length > 0 ? parts.join(' · ') : 'Role · Experience';
  }

  if (previewSkills) {
    if (selectedSkills.length > 0) {
      previewSkills.innerHTML = selectedSkills.map(s => renderSkillTag(s)).join('');
    } else {
      previewSkills.innerHTML = '<span class="tag tag-outline">No skills selected</span>';
    }
  }

  if (previewMeta) {
    previewMeta.innerHTML = `<span>🕐 ${tz || '—'}</span>`;
  }

  if (previewLinks) {
    let linksHtml = '';
    const githubUrl = safeExternalUrl(github);
    const linkedinUrl = safeExternalUrl(linkedin);
    if (githubUrl) linksHtml += `<a href="${githubUrl}" class="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">GitHub</a>`;
    if (linkedinUrl) linksHtml += `<a href="${linkedinUrl}" class="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">LinkedIn</a>`;
    previewLinks.innerHTML = linksHtml;
  }
}

async function nextStep() {
  if (currentStep >= 4) {
    const name = document.getElementById('obName')?.value?.trim() || '';
    const email = document.getElementById('obEmail')?.value?.trim() || '';
    const password = document.getElementById('obPassword')?.value || '';

    if (!name || !email || !password || password.length < 6 || !email.includes('@')) {
      showToast('Enter valid name, email, and password (6+ chars).', 'error');
      return;
    }

    const btn = document.getElementById('nextBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Creating Account...';
    btn.disabled = true;

    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
        timeoutMs: 10000,
      });

      const token = data.token;
      const userId = data.user.id;
      
      // Store auth for future requests
      localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
      setAuthUserInfo({ id: userId, name });
      if (typeof renderAuthNav === 'function') renderAuthNav();

      await apiRequest('/api/users/me', {
        method: 'PATCH',
        auth: true,
        body: {
          bio: document.getElementById('obBio')?.value?.trim() || '',
          experience: selectedExperience || 'Beginner',
          timezone: document.getElementById('obTimezone')?.value || 'UTC+0 (GMT)',
          role: selectedRole || 'Builder',
          github: document.getElementById('obGithub')?.value?.trim() || '',
          linkedin: document.getElementById('obLinkedin')?.value?.trim() || '',
          skills: selectedSkills,
        },
        timeoutMs: 10000,
      });

      showToast('Account created successfully.', 'success');
      navigateTo(`profile/${userId}`);
    } catch (err) {
      showToast(err.message || 'Could not create account.', 'error');
      btn.textContent = originalText;
      btn.disabled = false;
    }
    return;
  }

  document.getElementById(`step${currentStep}`).style.display = 'none';
  document.querySelector(`.step-item[data-step="${currentStep}"]`).classList.remove('active');
  document.querySelector(`.step-item[data-step="${currentStep}"]`).classList.add('completed');

  currentStep++;
  document.getElementById(`step${currentStep}`).style.display = 'block';
  document.querySelector(`.step-item[data-step="${currentStep}"]`).classList.add('active');

  document.getElementById('prevBtn').style.visibility = 'visible';
  document.getElementById('nextBtn').textContent = currentStep === 4 ? 'Complete Setup ✓' : 'Continue →';
}

function prevStep() {
  if (currentStep <= 1) return;

  document.getElementById(`step${currentStep}`).style.display = 'none';
  document.querySelector(`.step-item[data-step="${currentStep}"]`).classList.remove('active');

  currentStep--;
  document.getElementById(`step${currentStep}`).style.display = 'block';
  document.querySelector(`.step-item[data-step="${currentStep}"]`).classList.remove('completed');
  document.querySelector(`.step-item[data-step="${currentStep}"]`).classList.add('active');

  if (currentStep <= 1) document.getElementById('prevBtn').style.visibility = 'hidden';
  document.getElementById('nextBtn').textContent = 'Continue →';
}
