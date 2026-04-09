// ===== MESSAGES / CONNECTION PAGE =====
function renderMessages() {
    return `
    <div class="page">
      <div class="container">
        <h2 style="margin-bottom:24px">Messages</h2>
        <div class="inbox-layout">
          <!-- Sidebar -->
          <div class="inbox-sidebar" id="inboxSidebar">
            <div class="inbox-sidebar-header">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <h4>Inbox</h4>
                <span class="tag tag-blue">${MESSAGES.filter(m => m.type === 'request').length} new</span>
              </div>
            </div>
            
            <!-- Pending requests -->
            ${MESSAGES.filter(m => m.type === 'request').map((m, i) => `
              <div class="conversation-item ${i === 0 ? 'active' : ''}" onclick="showConversation(${m.id})" id="conv-${m.id}">
                ${renderAvatar(m.from, 'avatar-sm')}
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;justify-content:space-between">
                    <span style="font-weight:600;font-size:14px">${m.from.name}</span>
                    <span class="text-xs text-muted">${m.timestamp}</span>
                  </div>
                  <p class="text-xs text-muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🔔 Team-up request</p>
                </div>
              </div>
            `).join('')}

            <!-- Active chats -->
            ${MESSAGES.filter(m => m.type === 'chat').map(m => `
              <div class="conversation-item" onclick="showConversation(${m.id})" id="conv-${m.id}">
                ${renderAvatar(m.from, 'avatar-sm')}
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;justify-content:space-between">
                    <span style="font-weight:600;font-size:14px">${m.from.name}</span>
                    <span class="text-xs text-muted">${m.timestamp}</span>
                  </div>
                  <p class="text-xs text-muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.messages[m.messages.length - 1].text}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Chat Pane -->
          <div class="chat-pane" id="chatPane">
            ${renderMessagePane(MESSAGES[0])}
          </div>
        </div>
      </div>
    </div>`;
}

function renderMessagePane(msg) {
    if (!msg) return '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">Select a conversation</div>';

    if (msg.type === 'request') {
        return `
      <div class="chat-header">
        ${renderAvatar(msg.from, 'avatar-sm')}
        <div>
          <span style="font-weight:600;font-size:14px">${msg.from.name}</span>
          <span class="text-xs text-muted" style="display:block">${msg.from.role} · ${msg.from.experience}</span>
        </div>
      </div>
      <div class="chat-messages" style="justify-content:center;align-items:center">
        <div class="request-card" style="max-width:420px;text-align:center">
          <div style="margin-bottom:16px">
            ${renderAvatar(msg.from, 'avatar-lg')}
          </div>
          <h4 style="margin-bottom:4px">${msg.from.name}</h4>
          <p class="text-sm text-muted" style="margin-bottom:12px">${msg.from.role} · ${msg.from.timezone}</p>
          <div style="display:flex;justify-content:center;gap:6px;margin-bottom:16px">
            ${renderSkillTags(msg.from.skills)}
          </div>
          <div class="card" style="padding:16px;margin-bottom:16px;text-align:left;background:var(--surface)">
            <p style="font-size:14px;line-height:1.6;color:var(--text-secondary)">"${msg.message}"</p>
          </div>
          <span class="text-xs text-muted">${msg.timestamp}</span>
          <div class="request-actions" style="justify-content:center">
            <button class="btn btn-primary" onclick="acceptRequest(${msg.id})">✓ Accept</button>
            <button class="btn btn-secondary" onclick="declineRequest(${msg.id})">✕ Decline</button>
          </div>
        </div>
      </div>`;
    }

    // Chat thread
    return `
    <div class="chat-header">
      ${renderAvatar(msg.from, 'avatar-sm')}
      <div>
        <span style="font-weight:600;font-size:14px">${msg.from.name}</span>
        <span class="text-xs text-muted" style="display:block">${msg.from.role}</span>
      </div>
      <div style="margin-left:auto">
        <button class="btn btn-ghost btn-sm" onclick="navigateTo('profile/${msg.from.id}')">View Profile</button>
      </div>
    </div>
    <div class="chat-messages">
      ${msg.messages.map(m => `
        <div style="display:flex;flex-direction:column;${m.sender === 'me' ? 'align-items:flex-end' : 'align-items:flex-start'}">
          <div class="chat-bubble ${m.sender === 'me' ? 'sent' : 'received'}">${m.text}</div>
          <span class="text-xs text-muted" style="margin-top:4px">${m.time}</span>
        </div>
      `).join('')}
    </div>
    <div class="chat-input-area">
      <input type="text" placeholder="Type a message..." id="chatInput" onkeydown="if(event.key==='Enter')sendMessage(${msg.id})">
      <button class="btn btn-primary" onclick="sendMessage(${msg.id})">Send</button>
    </div>`;
}

function initMessages() { }

function showConversation(msgId) {
    const msg = MESSAGES.find(m => m.id === msgId);
    document.querySelectorAll('.conversation-item').forEach(ci => ci.classList.remove('active'));
    document.getElementById(`conv-${msgId}`)?.classList.add('active');
    const pane = document.getElementById('chatPane');
    if (pane) pane.innerHTML = renderMessagePane(msg);
}

function acceptRequest(msgId) {
    const msg = MESSAGES.find(m => m.id === msgId);
    if (msg) {
        msg.type = 'chat';
        msg.messages = [
            { text: msg.message, sender: 'them', time: 'Earlier' },
            { text: 'Accepted! Let\'s chat about the project.', sender: 'me', time: 'Just now' },
        ];
    }
    showConversation(msgId);
}

function declineRequest(msgId) {
    const pane = document.getElementById('chatPane');
    if (pane) {
        pane.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);flex-direction:column;gap:8px"><p>Request declined.</p><button class="btn btn-ghost btn-sm" onclick="showConversation(1)">← Back to inbox</button></div>';
    }
}

function sendMessage(msgId) {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;

    const msg = MESSAGES.find(m => m.id === msgId);
    if (msg && msg.messages) {
        msg.messages.push({ text: input.value, sender: 'me', time: 'Just now' });
        showConversation(msgId);
        // Re-focus and scroll
        setTimeout(() => {
            const chatMsgs = document.querySelector('.chat-messages');
            if (chatMsgs) chatMsgs.scrollTop = chatMsgs.scrollHeight;
        }, 50);
    }
}
