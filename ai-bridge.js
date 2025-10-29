// ai-bridge.js

let aiSessionReady = false;
let classifierSession = null;
let summarizerSession = null;

async function initializeAI() {
  try {
    if (typeof LanguageModel === 'undefined') {
      console.warn('JobMail AI: LanguageModel API not available in main world.');
      return false;
    }

    classifierSession = await LanguageModel.create({
      initialPrompts: [{
        role: 'system',
        content: 'You are an email classifier. Analyze emails and classify them as: OA_INVITE (online assessment/coding test invitation), REJECTION, STATUS_UPDATE, or OTHER. Respond with only the classification label.'
      }]
    });

    summarizerSession = await LanguageModel.create({
        initialPrompts: [{
            role: 'system',
            content: 'You are an email summarizer. Take the provided email content and generate a concise, one-sentence summary of 20 words or less.'
        }]
    });

    aiSessionReady = true;
    console.log('JobMail AI: AI sessions initialized successfully in main world using LanguageModel.create ✓');
    return true;
  } catch (error) {
    console.error('JobMail AI: Error initializing AI in main world:', error);
    return false;
  }
}

async function classifyEmailWithAI(emailContent) {
  if (!aiSessionReady || !classifierSession) {
    return 'OTHER';
  }

  try {
    const prompt = `Classify this email. Respond with only one word: OA_INVITE, REJECTION, STATUS_UPDATE, or OTHER.\n\nEmail:\n${emailContent.substring(0, 1000)}`;
    const result = await classifierSession.prompt(prompt);
    return result;
  } catch (error) {
    console.error('JobMail AI: AI classification error in main world:', error);
    return 'OTHER';
  }
}

async function summarizeEmail(emailContent) {
  if (!aiSessionReady || !summarizerSession) {
    return emailContent.substring(0, 200) + '...';
  }
  try {
    const prompt = `Summarize the following email content in one short sentence, focusing on the key action or information. Keep it under 20 words.\n\nEmail:\n${emailContent}`;
    const summary = await summarizerSession.prompt(prompt);
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
