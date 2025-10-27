const emailList = document.getElementById('emailList');
const emptyState = document.getElementById('emptyState');
const emailCount = document.getElementById('emailCount');
const scanBtn = document.getElementById('scanBtn');
const clearBtn = document.getElementById('clearBtn');
const notificationsToggle = document.getElementById('notificationsToggle');

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function renderEmails(emails) {
  emailCount.textContent = emails.length;
  
  if (emails.length === 0) {
    emailList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No OA emails detected yet</p>
        <p class="empty-hint">Open Gmail and click "Scan Inbox Now" or wait for automatic detection</p>
      </div>
    `;
    return;
  }
  
  emailList.innerHTML = emails.map(email => `
    <div class="email-card">
      <div class="email-header">
        <span class="email-badge">OA INVITE</span>
        <span class="email-time">${formatTime(email.timestamp)}</span>
      </div>
      <div class="email-sender">${escapeHtml(email.sender)}</div>
      <div class="email-subject">${escapeHtml(email.subject)}</div>
      ${email.summary ? `<div class="email-summary">${escapeHtml(email.summary)}</div>` : ''}
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function loadEmails() {
  chrome.storage.local.get(['oaEmails'], (result) => {
    const emails = result.oaEmails || [];
    renderEmails(emails);
  });
}

function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || { notifications: true };
    notificationsToggle.checked = settings.notifications;
  });
}

scanBtn.addEventListener('click', () => {
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="btn-icon">⏳</span> Scanning...';
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    
    if (activeTab.url && activeTab.url.includes('mail.google.com')) {
      chrome.tabs.sendMessage(activeTab.id, { type: 'SCAN_INBOX' }, () => {
        setTimeout(() => {
          scanBtn.disabled = false;
          scanBtn.innerHTML = '<span class="btn-icon">🔍</span> Scan Inbox Now';
          loadEmails();
        }, 2000);
      });
    } else {
      alert('Please open Gmail first to scan your inbox.');
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<span class="btn-icon">🔍</span> Scan Inbox Now';
    }
  });
});

clearBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all detected OA emails?')) {
    chrome.storage.local.set({ oaEmails: [] }, () => {
      loadEmails();
      chrome.action.setBadgeText({ text: '' });
    });
  }
});

notificationsToggle.addEventListener('change', (e) => {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    settings.notifications = e.target.checked;
    chrome.storage.local.set({ settings });
  });
});

loadEmails();
loadSettings();

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.oaEmails) {
    loadEmails();
  }
});
