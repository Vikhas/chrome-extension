# JobMail AI - Chrome Extension Project

## Overview
JobMail AI is a Chrome Extension built for the **Google Chrome Built-in AI Challenge 2025**. It automatically detects and summarizes Online Assessment (OA) emails in Gmail using Chrome's built-in AI APIs (Prompt API + Summarizer API powered by Gemini Nano).

## Project Status
**Created:** October 27, 2025  
**Hackathon Deadline:** October 31, 2025, 11:45 PM PDT  
**Target Prize:** Most Helpful - Chrome Extension ($14,000)

## Key Features
- Real-time OA email detection in Gmail inbox
- AI-powered email classification using Prompt API
- Smart summarization using Summarizer API
- Visual highlighting with badges in Gmail
- Browser notifications for new OA emails
- Dashboard to track all detected emails
- Fully client-side AI (privacy-first, works offline)

## Architecture
- **Manifest V3** Chrome Extension
- **Content Script** (`content.js`) - Gmail integration
- **Background Service Worker** (`background.js`) - Notifications
- **Popup Dashboard** (`popup.html/js/css`) - User interface
- **Chrome Built-in AI APIs** - Prompt API + Summarizer API

## Technologies Used
- Vanilla JavaScript (no frameworks)
- Chrome Extension APIs (Manifest V3)
- Chrome Built-in AI APIs (Gemini Nano)
- HTML/CSS for UI

## Development Notes
- Extension requires Chrome Canary/Dev 128+ with AI flags enabled
- All AI processing happens locally in browser (no external servers)
- Uses keyword fallback detection when AI APIs unavailable
- Targets Gmail (mail.google.com) for content script injection

## Hackathon Requirements Met
✅ Uses Chrome built-in AI APIs (Prompt + Summarizer)  
✅ Solves real problem (missing OA invites)  
✅ Open source with MIT license  
✅ Manifest V3 compliant  
✅ Privacy-first (local AI execution)  
✅ Clear installation instructions  

## Testing
1. Enable Chrome AI flags (see README)
2. Load unpacked extension in chrome://extensions/
3. Navigate to Gmail
4. Extension auto-scans or use "Scan Inbox Now" button

## Future Enhancements
- Deadline tracking with calendar sync
- Multilingual support (Translator API)
- Email proofreading (Proofreader API)
- Multimodal features (image analysis)
