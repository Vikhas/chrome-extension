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

async function initializeAI() {
  try {
    if (typeof ai === 'undefined' || !ai.languageModel) {
      console.warn('JobMail AI: Chrome AI APIs not available. Using fallback keyword detection.');
      console.warn('JobMail AI: To enable AI features, visit chrome://flags and enable Prompt API and Summarizer API');
      return false;
    }

    const capabilities = await ai.languageModel.capabilities();
    console.log('JobMail AI: AI capabilities:', capabilities);

    if (capabilities.available === 'readily') {
      promptSession = await ai.languageModel.create({
        systemPrompt: 'You are a helpful AI assistant for processing emails. You can classify emails and summarize them.'
      });
      aiSessionReady = true;
      console.log('JobMail AI: AI session initialized successfully ✓');
      return true;
    } else if (capabilities.available === 'after-download') {
      console.log('JobMail AI: AI model downloading... Please wait and reload Gmail.');
      return false;
    } else {
      console.warn('JobMail AI: AI not available. Capabilities:', capabilities);
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
    if (aiSessionReady && promptSession) {
      const prompt = `Summarize the following email content in one short sentence, focusing on the key action or information. Keep it under 20 words.\n\nEmail:\n${emailContent}`;
      const summary = await promptSession.prompt(prompt);
      console.log('JobMail AI: Generated summary with AI using prompt API');
      return summary;
    } else {
      console.log('JobMail AI: AI session not ready, using fallback for summary.');
    }
  } catch (error) {
    console.error('JobMail AI: Summarization error with prompt API:', error);
  }
  
  const maxLength = 200;
  const trimmed = emailContent.substring(0, maxLength);
  return trimmed.length < emailContent.length ? trimmed + '...' : trimmed;
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
  await initializeAI();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
