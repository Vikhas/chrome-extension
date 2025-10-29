// ai-bridge.js

let aiSessionReady = false;
let promptSession = null;
let summarizer = null;

async function initializeAI() {
  try {
    if (typeof ai === 'undefined') {
      console.warn('JobMail AI: Chrome AI APIs not available in main world.');
      return false;
    }

    const canCreate = await window.ai.canCreateTextSession();
    if (canCreate === "no") {
        console.warn('JobMail AI: Cannot create AI session.');
        return false;
    }

    promptSession = await window.ai.createTextSession({
      systemPrompt: 'You are an email classifier. Analyze emails and classify them as: OA_INVITE (online assessment/coding test invitation), REJECTION, STATUS_UPDATE, or OTHER. Respond with only the classification label.'
    });

    summarizer = await ai.summarizer.create();

    aiSessionReady = true;
    console.log('JobMail AI: AI session initialized successfully in main world ✓');
    return true;
  } catch (error) {
    console.error('JobMail AI: Error initializing AI in main world:', error);
    return false;
  }
}

async function classifyEmailWithAI(emailContent) {
  if (!aiSessionReady || !promptSession) {
    return 'OTHER';
  }

  try {
    const prompt = `Classify this email. Respond with only one word: OA_INVITE, REJECTION, STATUS_UPDATE, or OTHER.\n\nEmail:\n${emailContent.substring(0, 1000)}`;
    const result = await promptSession.prompt(prompt);
    return result;
  } catch (error) {
    console.error('JobMail AI: AI classification error in main world:', error);
    return 'OTHER';
  }
}

async function summarizeEmail(emailContent) {
  if (!aiSessionReady || !summarizer) {
    return emailContent.substring(0, 200) + '...';
  }
  try {
    const summary = await summarizer.summarize(emailContent);
    return summary;
  } catch (error) {
    console.error('JobMail AI: Summarizer error in main world:', error);
    return emailContent.substring(0, 200) + '...';
  }
}

window.addEventListener('message', async (event) => {
  if (event.source !== window || !event.data || event.data.source !== 'jobmail-content-script') {
    return;
  }

  const { type, payload, requestId } = event.data;

  if (type === 'CLASSIFY_EMAIL') {
    const result = await classifyEmailWithAI(payload);
    window.postMessage({
      source: 'jobmail-ai-bridge',
      type: 'CLASSIFY_EMAIL_RESULT',
      payload: result,
      requestId,
    }, '*');
  } else if (type === 'SUMMARIZE_EMAIL') {
    const result = await summarizeEmail(payload);
    window.postMessage({
      source: 'jobmail-ai-bridge',
      type: 'SUMMARIZE_EMAIL_RESULT',
      payload: result,
      requestId,
    }, '*');
  }
});

initializeAI();
