function renderLogin() {
  return `
    <div class="page">
      <div class="container" style="max-width:560px;padding-top:40px">
        <div class="card">
          <h2 style="margin-bottom:8px">Welcome back</h2>
          <p class="text-muted" style="margin-bottom:24px">Sign in to manage your profile and teams.</p>

          <div class="form-group">
            <label class="form-label" for="loginEmail">Email</label>
            <input id="loginEmail" type="email" autocomplete="email" placeholder="you@example.com">
          </div>

          <div class="form-group">
            <label class="form-label" for="loginPassword">Password</label>
            <input id="loginPassword" type="password" autocomplete="current-password" placeholder="Your password">
          </div>

          <button id="loginSubmitBtn" class="btn btn-primary" style="width:100%" onclick="submitLogin()">Log In</button>
          <p class="text-sm text-muted" style="margin-top:12px">Demo account: aisha@example.com / password123</p>
        </div>
      </div>
    </div>`;
}

function initLogin() {
  const input = document.getElementById('loginPassword');
  if (!input) return;

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      submitLogin();
    }
  });
}

async function submitLogin() {
  const email = document.getElementById('loginEmail')?.value?.trim() || '';
  const password = document.getElementById('loginPassword')?.value || '';

  if (!email || !password) {
    showToast('Please enter email and password.', 'error');
    return;
  }

  const btn = document.getElementById('loginSubmitBtn');
  const originalText = btn?.textContent || 'Log In';
  if (btn) {
    btn.textContent = 'Signing in...';
    btn.disabled = true;
  }

  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      timeoutMs: 8000,
    });

    localStorage.setItem(AUTH_STORAGE_KEYS.token, data.token);
    setAuthUserInfo(data.user);
    if (typeof renderAuthNav === 'function') renderAuthNav();
    showToast('Logged in successfully.', 'success');
    navigateTo(`profile/${data.user.id}`);
  } catch (err) {
    showToast(err.message || 'Login failed.', 'error');
  } finally {
    if (btn) {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }
}
