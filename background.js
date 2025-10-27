console.log('JobMail AI: Background service worker initialized');

chrome.runtime.onInstalled.addListener(() => {
  console.log('JobMail AI: Extension installed');
  
  chrome.storage.local.set({
    oaEmails: [],
    settings: {
      notifications: true,
      autoScan: true
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OA_DETECTED') {
    handleOADetection(message.email);
  }
});

function handleOADetection(email) {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || { notifications: true };
    
    if (settings.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Online Assessment Detected!',
        message: `From: ${email.sender}\nSubject: ${email.subject}`,
        priority: 2
      });
    }
  });
  
  chrome.action.setBadgeText({ text: '!' });
  chrome.action.setBadgeBackgroundColor({ color: '#FF6B6B' });
  
  setTimeout(() => {
    chrome.storage.local.get(['oaEmails'], (result) => {
      const count = (result.oaEmails || []).length;
      chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
    });
  }, 3000);
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('mail.google.com')) {
    chrome.tabs.sendMessage(tab.id, { type: 'SCAN_INBOX' });
  }
});
