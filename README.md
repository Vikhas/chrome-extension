# JobMail AI - OA Email Detector

> **Never miss an Online Assessment invite again!**

A Chrome Extension that automatically detects and summarizes Online Assessment (OA) emails using Chrome's built-in AI APIs (Prompt API + Summarizer API). Built for the **Google Chrome Built-in AI Challenge 2025**.

## 🎯 What It Does

JobMail AI monitors your Gmail inbox and uses **Gemini Nano** (Chrome's built-in AI) to:

- 🔍 **Automatically detect** OA invitation emails from companies like HackerRank, CodeSignal, Codility, etc.
- 📝 **Summarize** email content to extract key details (deadline, platform, instructions)
- 🔔 **Notify** you instantly when an OA email arrives
- ✨ **Highlight** OA emails in your inbox with visual badges
- 📊 **Track** all detected OA emails in a beautiful dashboard

## 🧠 Chrome Built-in AI APIs Used

This extension showcases two of Chrome's powerful built-in AI APIs:

1. **Prompt API** - Classifies emails into categories (OA_INVITE, REJECTION, STATUS_UPDATE, OTHER)
2. **Summarizer API** - Extracts key information and generates summaries

All AI processing happens **locally in your browser** with Gemini Nano - no data sent to external servers!

## 🚀 Installation

### For Testing & Development

1. **Clone or Download** this repository
   ```bash
   git clone <your-repo-url>
   cd jobmail-ai
   ```

2. **Enable Chrome AI APIs** (Required)
   - Open Chrome Canary or Chrome Dev (version 128+)
   - Go to `chrome://flags`
   - Enable these flags:
     - `chrome://flags/#optimization-guide-on-device-model`
     - `chrome://flags/#prompt-api-for-gemini-nano`
     - `chrome://flags/#summarization-api-for-gemini-nano`
   - Relaunch Chrome

3. **Load the Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `jobmail-ai` folder
   - The extension icon should appear in your toolbar!

4. **Open Gmail**
   - Navigate to https://mail.google.com
   - The extension will automatically start scanning for OA emails
   - Or click the extension icon and press "Scan Inbox Now"

## 📖 How to Use

### Automatic Detection
1. Open Gmail in Chrome
2. The extension automatically monitors your inbox
3. When an OA email is detected:
   - Email gets highlighted with a yellow background and "OA" badge
   - You receive a browser notification
   - Email is saved to your dashboard

### Manual Scan
1. Click the JobMail AI extension icon
2. Click "Scan Inbox Now" button
3. View all detected OA emails in the dashboard

### Dashboard Features
- View all detected OA emails with summaries
- See how long ago each email arrived
- Clear all tracked emails
- Toggle notifications on/off

## 🎨 Features

✅ **Real-time Email Detection** - Monitors Gmail inbox automatically  
✅ **AI-Powered Classification** - Uses Prompt API to identify OA invites  
✅ **Smart Summarization** - Extracts key details with Summarizer API  
✅ **Visual Highlighting** - Yellow background + OA badge in Gmail  
✅ **Browser Notifications** - Get alerted immediately  
✅ **Beautiful Dashboard** - Track all OA emails in one place  
✅ **Privacy-First** - All AI processing happens locally (no external servers)  
✅ **Offline Capable** - Works without internet once AI model is downloaded  

## 🏗️ Technical Architecture

```
jobmail-ai/
├── manifest.json         # Extension configuration (Manifest V3)
├── content.js            # Gmail integration & email scanning
├── background.js         # Service worker for notifications
├── popup.html            # Dashboard UI
├── popup.js              # Dashboard logic
├── popup.css             # Dashboard styling
├── styles.css            # Gmail injection styles
└── icons/                # Extension icons (16x16, 48x48, 128x128)
```

### Key Technologies
- **Manifest V3** - Latest Chrome Extension standard
- **Chrome Prompt API** - Email classification with Gemini Nano
- **Chrome Summarizer API** - Email summarization
- **Chrome Storage API** - Local data persistence
- **Chrome Notifications API** - Alert system
- **Content Scripts** - Gmail DOM integration

## 🔑 Keyword Detection

The extension detects emails containing terms like:
- Online Assessment, OA Invite, Coding Test
- HackerRank, CodeSignal, Codility, LeetCode
- Technical Assessment, Programming Test
- Take-home Assignment, Coding Challenge
- And more...

## 🎯 Hackathon Submission

**Challenge:** Google Chrome Built-in AI Challenge 2025  
**Category:** Most Helpful - Chrome Extension  
**APIs Used:** Prompt API, Summarizer API  
**Problem Solved:** Job seekers often miss time-sensitive OA invites buried in their inbox

## 🤝 Contributing

This is a hackathon project, but suggestions and improvements are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the **Google Chrome Built-in AI Challenge 2025**
- Powered by **Gemini Nano** and Chrome's built-in AI APIs
- Thanks to the Chrome team for making AI accessible in the browser!

## 📧 Contact

Created by **Vikhas** - Feel free to reach out!

---

**⭐ If you find this extension helpful, please star the repository!**

## 📋 Current Capabilities & Limitations

### What Works Well
- ✅ Detects OA emails using subject lines and preview snippets
- ✅ AI classification works with available inbox data
- ✅ Visual highlighting and notifications function perfectly
- ✅ Keyword-based fallback ensures high detection rate
- ✅ All processing happens locally (privacy-first)

### Known Limitations
- ⚠️ **Email Body Access:** The extension currently analyzes subject + sender + Gmail preview snippet (~100-150 chars). Full email body retrieval would require opening each message or Gmail API integration, which is beyond the scope of this hackathon MVP.
- ⚠️ **Summaries:** AI summaries are based on preview text. For detailed information, users should click through to the email.
- ✅ **Mitigation:** Strong keyword detection ensures OA emails are identified even without full content analysis.

### Why This Approach?
This design prioritizes:
1. **Performance** - Fast scanning without opening every email
2. **Privacy** - No external API calls or data collection
3. **Reliability** - Works immediately without complex setup
4. **Hackathon Timeline** - Functional MVP within 4 days

For a production version, Gmail API integration would enable full email body analysis.

## 🔮 Future Enhancements

- 📧 Gmail API integration for full email body access
- 📅 Deadline extraction and tracking with calendar integration
- 🌐 Multilingual support with Translator API
- ✍️ Email reply proofreading with Proofreader API
- 🎨 Multimodal support (analyze company logos)
- 📊 Analytics dashboard with application tracking
- 🔗 Direct links to assessment platforms
# AI-chrome-extension
# mail-filter-extension
