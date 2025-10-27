console.log('JobMail AI: Content script loaded');

const OA_KEYWORDS = [
  'online assessment', 'oa invite', 'coding test', 'hackerrank', 'codesignal',
  'codility', 'technical assessment', 'coding challenge', 'take-home assignment',
  'programming test', 'assessment link', 'complete the assessment', 'leetcode',
  'online coding', 'timed assessment', 'technical evaluation', 'coding assignment'
];

let processedEmails = new Set();
let aiSessionReady = false;
let summarizerSession = null;
let promptSession = null;

async function initializeAI() {
  try {
    if (typeof ai === 'undefined' || !ai.languageModel) {
      console.warn('JobMail AI: Chrome AI APIs not available yet. Using fallback detection.');
      return false;
    }

    const capabilities = await ai.languageModel.capabilities();
    console.log('JobMail AI: AI capabilities:', capabilities);

    if (capabilities.available === 'readily') {
      promptSession = await ai.languageModel.create({
        systemPrompt: 'You are an email classifier. Analyze emails and classify them as: OA_INVITE (online assessment/coding test invitation), REJECTION, STATUS_UPDATE, or OTHER. Respond with only the classification label.'
      });
      aiSessionReady = true;
      console.log('JobMail AI: AI session initialized successfully');
      return true;
    } else if (capabilities.available === 'after-download') {
      console.log('JobMail AI: AI model needs to be downloaded first');
      return false;
    }
  } catch (error) {
    console.error('JobMail AI: Error initializing AI:', error);
    return false;
  }
}

function containsOAKeywords(text) {
  const lowerText = text.toLowerCase();
  return OA_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

async function classifyEmailWithAI(emailContent) {
  try {
    if (!aiSessionReady || !promptSession) {
      return fallbackClassification(emailContent);
    }

    const prompt = `Classify this email. Respond with only one word: OA_INVITE, REJECTION, STATUS_UPDATE, or OTHER.\n\nEmail:\n${emailContent.substring(0, 1000)}`;
    
    const result = await promptSession.prompt(prompt);
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
    if (typeof ai !== 'undefined' && ai.summarizer) {
      const canSummarize = await ai.summarizer.capabilities();
      if (canSummarize.available === 'readily') {
        const session = await ai.summarizer.create();
        const summary = await session.summarize(emailContent);
        session.destroy();
        return summary;
      }
    }
  } catch (error) {
    console.error('JobMail AI: Summarizer error:', error);
  }
  
  return emailContent.substring(0, 200) + '...';
}

function extractEmailData(emailRow) {
  try {
    const subjectElement = emailRow.querySelector('[data-thread-id] span[data-thread-id]') || 
                           emailRow.querySelector('.bog span');
    const senderElement = emailRow.querySelector('.yW span[email]') || 
                         emailRow.querySelector('.yP span');
    
    const subject = subjectElement ? subjectElement.textContent.trim() : '';
    const sender = senderElement ? senderElement.textContent.trim() : '';
    const threadId = emailRow.getAttribute('data-thread-id') || '';
    
    return { subject, sender, threadId };
  } catch (error) {
    console.error('JobMail AI: Error extracting email data:', error);
    return null;
  }
}

async function processEmail(emailRow) {
  const emailData = extractEmailData(emailRow);
  if (!emailData || !emailData.threadId) return;
  
  if (processedEmails.has(emailData.threadId)) return;
  
  const emailContent = `${emailData.subject} ${emailData.sender}`;
  const classification = await classifyEmailWithAI(emailContent);
  
  if (classification === 'OA_INVITE') {
    processedEmails.add(emailData.threadId);
    
    highlightOAEmail(emailRow);
    
    const summary = await summarizeEmail(emailContent);
    
    const oaEmail = {
      id: emailData.threadId,
      subject: emailData.subject,
      sender: emailData.sender,
      summary: summary,
      classification: classification,
      timestamp: Date.now(),
      read: false
    };
    
    saveOAEmail(oaEmail);
    
    chrome.runtime.sendMessage({
      type: 'OA_DETECTED',
      email: oaEmail
    });
    
    console.log('JobMail AI: OA Email detected!', oaEmail);
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
  console.log(`JobMail AI: Scanning ${emailRows.length} emails...`);
  
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
  await initializeAI();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
