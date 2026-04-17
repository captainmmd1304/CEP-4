let inboxConversations = [];
let activeConversationId = null;

function renderMessages() {
  return `
    <div class="page">
      <div class="container">
        <h2 style="margin-bottom:24px">Messages</h2>
        <div class="inbox-layout">
          <div class="inbox-sidebar" id="inboxSidebar">
            <div class="inbox-sidebar-header" style="display:flex;align-items:center;justify-content:space-between">
              <h4>Inbox</h4>
              <span class="tag tag-blue" id="inboxCount">0</span>
            </div>
            <div id="inboxList">
              <div class="text-muted" style="padding:20px">Loading conversations...</div>
            </div>
          </div>
          <div class="chat-pane" id="chatPane">
            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">Select a conversation</div>
          </div>
        </div>
      </div>
    </div>`;
}

function initMessages() {
  if (!getAuthToken()) {
    showToast('Please log in to open messages.', 'error');
    navigateTo('login');
    return;
  }

  loadInbox();
}

async function loadInbox() {
  try {
    const data = await apiRequest('/api/messages/inbox', {
      auth: true,
      retries: 1,
      timeoutMs: 10000,
    });

    inboxConversations = Array.isArray(data.conversations) ? data.conversations : [];
    renderInboxList();

    if (inboxConversations.length > 0) {
      showConversation(inboxConversations[0].id);
    }
  } catch (err) {
    showToast(err.message || 'Could not load inbox.', 'error');
    const list = document.getElementById('inboxList');
    if (list) {
      list.innerHTML = '<div class="text-muted" style="padding:20px">Could not load conversations.</div>';
    }
  }
}

function renderInboxList() {
  const list = document.getElementById('inboxList');
  const count = document.getElementById('inboxCount');
  if (!list || !count) return;

  count.textContent = String(inboxConversations.length);

  if (inboxConversations.length === 0) {
    list.innerHTML = '<div class="text-muted" style="padding:20px">No conversations yet.</div>';
    return;
  }

  list.innerHTML = inboxConversations.map((item) => `
    <button type="button" class="conversation-item ${item.id === activeConversationId ? 'active' : ''}" onclick="showConversation(${item.id})" id="conv-${item.id}">
      ${renderAvatar(item.from, 'avatar-sm')}
      <div style="flex:1;min-width:0;text-align:left">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-weight:600;font-size:14px">${escapeHtml(item.from.name)}</span>
          <span class="text-xs text-muted">${new Date(item.updatedAt).toLocaleDateString()}</span>
        </div>
        <p class="text-xs text-muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${item.type === 'request' ? 'Team-up request' : escapeHtml(item.lastMessage?.text || 'No messages yet')}
        </p>
      </div>
    </button>`).join('');
}

async function showConversation(conversationId) {
  activeConversationId = conversationId;
  renderInboxList();

  const pane = document.getElementById('chatPane');
  if (!pane) return;

  pane.innerHTML = '<div class="text-muted" style="padding:20px">Loading conversation...</div>';

  try {
    const data = await apiRequest(`/api/messages/${conversationId}`, {
      auth: true,
      retries: 1,
      timeoutMs: 10000,
    });
    pane.innerHTML = renderMessagePane(data.conversation);
  } catch (err) {
    pane.innerHTML = '<div class="text-muted" style="padding:20px">Could not load conversation.</div>';
    showToast(err.message || 'Unable to open conversation.', 'error');
  }
}

function renderMessagePane(conversation) {
  if (!conversation) {
    return '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">Select a conversation</div>';
  }

  if (conversation.type === 'request' && conversation.status !== 'accepted') {
    const canRespond = getCurrentUserId() === conversation.to.id;

    return `
      <div class="chat-header">
        ${renderAvatar(conversation.from, 'avatar-sm')}
        <div>
          <span style="font-weight:600;font-size:14px">${escapeHtml(conversation.from.name)}</span>
          <span class="text-xs text-muted" style="display:block">${escapeHtml(conversation.from.role)} · ${escapeHtml(conversation.from.experience)}</span>
        </div>
      </div>
      <div class="chat-messages" style="justify-content:center;align-items:center">
        <div class="request-card" style="max-width:460px;text-align:center">
          <h4 style="margin-bottom:8px">Team-up request</h4>
          <p class="text-sm text-muted" style="margin-bottom:12px">"${escapeHtml(conversation.requestMessage || '')}"</p>
          ${canRespond && conversation.status === 'pending'
            ? `<div class="request-actions" style="justify-content:center">
                <button class="btn btn-primary" type="button" onclick="respondToRequest(${conversation.id}, 'accept')">Accept</button>
                <button class="btn btn-secondary" type="button" onclick="respondToRequest(${conversation.id}, 'decline')">Decline</button>
              </div>`
            : `<p class="text-xs text-muted">Request status: ${escapeHtml(conversation.status || 'pending')}</p>`}
        </div>
      </div>`;
  }

  return `
    <div class="chat-header">
      ${renderAvatar(conversation.from, 'avatar-sm')}
      <div>
        <span style="font-weight:600;font-size:14px">${escapeHtml(conversation.from.name)}</span>
        <span class="text-xs text-muted" style="display:block">${escapeHtml(conversation.from.role)}</span>
      </div>
      <div style="margin-left:auto">
        <button class="btn btn-ghost btn-sm" type="button" onclick="navigateTo('profile/${conversation.from.id}')">View Profile</button>
      </div>
    </div>
    <div class="chat-messages" id="chatMessages">
      ${(conversation.messages || []).map((m) => {
        const own = getCurrentUserId() === m.senderId;
        return `
          <div style="display:flex;flex-direction:column;${own ? 'align-items:flex-end' : 'align-items:flex-start'}">
            <div class="chat-bubble ${own ? 'sent' : 'received'}">${escapeHtml(m.text)}</div>
            <span class="text-xs text-muted" style="margin-top:4px">${new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>`;
      }).join('')}
    </div>
    <div class="chat-input-area">
      <input type="text" placeholder="Type a message..." id="chatInput" onkeydown="if(event.key==='Enter')sendMessage()">
      <button class="btn btn-primary" type="button" onclick="sendMessage()">Send</button>
    </div>`;
}

async function respondToRequest(conversationId, action) {
  try {
    await apiRequest(`/api/messages/${conversationId}/${action}`, {
      method: 'POST',
      auth: true,
      timeoutMs: 10000,
    });
    showToast(action === 'accept' ? 'Request accepted.' : 'Request declined.', 'success');
    await loadInbox();
  } catch (err) {
    showToast(err.message || 'Could not update request.', 'error');
  }
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;

  const text = input.value.trim();
  if (!text || !activeConversationId) return;

  input.disabled = true;

  try {
    await apiRequest(`/api/messages/${activeConversationId}/send`, {
      method: 'POST',
      auth: true,
      body: { text },
      timeoutMs: 10000,
    });
    input.value = '';
    await showConversation(activeConversationId);
  } catch (err) {
    showToast(err.message || 'Could not send message.', 'error');
  } finally {
    input.disabled = false;
    input.focus();
  }
}
