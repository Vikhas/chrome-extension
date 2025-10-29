console.log('JobMail AI: Content script loaded');

const OA_KEYWORDS = [
  'online assessment', 'oa invite', 'coding test', 'hackerrank', 'codesignal',
  'codility', 'technical assessment', 'coding challenge', 'take-home assignment',
  'programming test', 'assessment link', 'complete the assessment', 'leetcode',
  'online coding', 'timed assessment', 'technical evaluation', 'coding assignment'
];

let processedEmails = new Set();
let aiSessionReady = false;
let promptSession = null;

const pendingAIRequests = new Map();

function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data || event.data.source !== 'jobmail-ai-bridge') {
    return;
  }

  const { type, payload, requestId } = event.data;
  if (pendingAIRequests.has(requestId)) {
    const { resolve } = pendingAIRequests.get(requestId);
    resolve(payload);
    pendingAIRequests.delete(requestId);
  }
});

function callAI(type, payload) {
  return new Promise((resolve, reject) => {
    const requestId = generateRequestId();
    pendingAIRequests.set(requestId, { resolve, reject });
    window.postMessage({
      source: 'jobmail-content-script',
      type,
      payload,
      requestId
    }, '*');

    setTimeout(() => {
        if (pendingAIRequests.has(requestId)) {
            reject(new Error('AI request timed out'));
            pendingAIRequests.delete(requestId);
        }
    }, 10000);
  });
}

function containsOAKeywords(text) {
  const lowerText = text.toLowerCase();
  return OA_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

async function classifyEmailWithAI(emailContent) {
  try {
    const result = await callAI('CLASSIFY_EMAIL', emailContent);
    console.log('JobMail AI: AI Classification:', result);
    
    if (result.includes('OA_INVITE')) {
      return 'OA_INVITE';
    } else if (result.includes('REJECTION')) {
      return 'REJECTION';
    } else if (result.includes('STATUS_UPDATE')) {
      return 'STATUS_UPDATE';
    }
    return 'OTHER';
  } catch (error) {
    console.error('JobMail AI: AI classification error:', error);
    return fallbackClassification(emailContent);
  }
}

function fallbackClassification(emailContent) {
  const lowerContent = emailContent.toLowerCase();
  
  if (containsOAKeywords(lowerContent)) {
    return 'OA_INVITE';
  } else if (lowerContent.includes('unfortunately') || lowerContent.includes('not moving forward') || lowerContent.includes('not selected')) {
    return 'REJECTION';
  } else if (lowerContent.includes('application') || lowerContent.includes('status') || lowerContent.includes('interview')) {
    return 'STATUS_UPDATE';
  }
  
  return 'OTHER';
}

async function summarizeEmail(emailContent) {
  try {
    const summary = await callAI('SUMMARIZE_EMAIL', emailContent);
    console.log('JobMail AI: Generated summary with AI');
    return summary;
  } catch (error) {
    console.error('JobMail AI: Summarizer error:', error);
    const maxLength = 200;
    const trimmed = emailContent.substring(0, maxLength);
    return trimmed.length < emailContent.length ? trimmed + '...' : trimmed;
  }
}

function extractEmailData(emailRow) {
  try {
    const subjectElement = emailRow.querySelector('.bog span') || 
                           emailRow.querySelector('span.bqe') ||
                           emailRow.querySelector('.y6 span');
    const senderElement = emailRow.querySelector('.yW span[email]') || 
                         emailRow.querySelector('.yP span') ||
                         emailRow.querySelector('span[email]');
    
    const snippetElement = emailRow.querySelector('.y2') || 
                          emailRow.querySelector('.Zt');
    
    const subject = subjectElement ? subjectElement.textContent.trim() : '';
    const sender = senderElement ? senderElement.textContent.trim() : '';
    let snippet = snippetElement ? snippetElement.textContent.trim() : '';
    
    if (snippet.includes('—')) {
      snippet = snippet.split('—').slice(1).join('—').trim();
    }
    
    const threadId = emailRow.getAttribute('data-legacy-thread-id') || 
                     emailRow.getAttribute('data-thread-id') || 
                     emailRow.id ||
                     `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return { subject, sender, snippet, threadId, emailRow };
  } catch (error) {
    console.error('JobMail AI: Error extracting email data:', error);
    return null;
  }
}

async function processEmail(emailRow) {
  const emailData = extractEmailData(emailRow);
  if (!emailData || !emailData.threadId) {
    return;
  }
  
  if (processedEmails.has(emailData.threadId)) return;
  
  const emailContent = `Subject: ${emailData.subject}\nFrom: ${emailData.sender}\nContent: ${emailData.snippet}`;
  
  const classification = await classifyEmailWithAI(emailContent);
  
  if (classification === 'OA_INVITE') {
    processedEmails.add(emailData.threadId);
    
    highlightOAEmail(emailRow);
    
    let summary = emailData.snippet;
    if (summary.length > 20) {
      summary = await summarizeEmail(emailContent);
    } else {
      summary = `${emailData.subject} - Click to view full details`;
    }
    
    const oaEmail = {
      id: emailData.threadId,
      subject: emailData.subject,
      sender: emailData.sender,
      summary: summary,
      snippet: emailData.snippet,
      classification: classification,
      timestamp: Date.now(),
      read: false
    };
    
    saveOAEmail(oaEmail);
    
    chrome.runtime.sendMessage({
      type: 'OA_DETECTED',
      email: oaEmail
    }).catch(err => console.log('JobMail AI: Background script not ready:', err));
    
    console.log('JobMail AI: OA detected!', { subject: oaEmail.subject, sender: oaEmail.sender });
  }
}

function highlightOAEmail(emailRow) {
  emailRow.classList.add('jobmail-oa-detected');
  
  const badge = document.createElement('div');
  badge.className = 'jobmail-oa-badge';
  badge.textContent = 'OA';
  badge.title = 'Online Assessment Detected';
  
  const subjectContainer = emailRow.querySelector('.y6') || emailRow.querySelector('.bog');
  if (subjectContainer && !subjectContainer.querySelector('.jobmail-oa-badge')) {
    subjectContainer.style.position = 'relative';
    subjectContainer.insertBefore(badge, subjectContainer.firstChild);
  }
}

function saveOAEmail(email) {
  chrome.storage.local.get(['oaEmails'], (result) => {
    const oaEmails = result.oaEmails || [];
    
    const exists = oaEmails.some(e => e.id === email.id);
    if (!exists) {
      oaEmails.unshift(email);
      chrome.storage.local.set({ oaEmails });
    }
  });
}

function scanInbox() {
  const emailRows = document.querySelectorAll('tr.zA');
  console.log(`JobMail AI: Scanning ${emailRows.length} emails in inbox...`);
  
  if (emailRows.length === 0) {
    console.warn('JobMail AI: No email rows found. Make sure you are on Gmail inbox view.');
  }
  
  emailRows.forEach((emailRow, index) => {
    setTimeout(() => processEmail(emailRow), index * 100);
  });
}

let scanTimeout;
function scheduleScan() {
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(() => {
    scanInbox();
  }, 1000);
}

const observer = new MutationObserver((mutations) => {
  scheduleScan();
});

function startObserver() {
  const inboxContainer = document.querySelector('.AO');
  if (inboxContainer) {
    observer.observe(inboxContainer, {
      childList: true,
      subtree: true
    });
    console.log('JobMail AI: Observer started');
    scanInbox();
  } else {
    setTimeout(startObserver, 1000);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_INBOX') {
    scanInbox();
    sendResponse({ success: true });
  }
});

(async function init() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('ai-bridge.js');
  document.head.appendChild(script);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
