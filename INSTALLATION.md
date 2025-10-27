# JobMail AI - Installation Guide

## Prerequisites

To use this Chrome Extension, you need:

1. **Chrome Canary or Chrome Dev** (version 128 or higher)
   - Download: https://www.google.com/chrome/canary/
   - Or: https://www.google.com/chrome/dev/

2. **Enable Chrome AI APIs**

## Step-by-Step Installation

### Step 1: Enable AI Features in Chrome

1. Open Chrome Canary or Chrome Dev
2. Navigate to `chrome://flags`
3. Search for and enable these flags:
   - `Optimization Guide On Device Model` → **Enabled**
   - `Prompt API for Gemini Nano` → **Enabled**
   - `Summarization API for Gemini Nano` → **Enabled**
4. Click **Relaunch** button at the bottom

### Step 2: Download Gemini Nano Model (First Time Only)

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Run this command:
   ```javascript
   await ai.languageModel.create()
   ```
4. If it says downloading, wait for completion (can take a few minutes)
5. You'll know it's ready when the command resolves successfully

### Step 3: Load the Extension

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right corner)
4. Click **Load unpacked** button
5. Select the `jobmail-ai` folder from this project
6. The extension should now appear in your extensions list!

### Step 4: Test the Extension

1. Navigate to https://mail.google.com
2. Log in to your Gmail account
3. The extension will automatically start monitoring your inbox
4. To manually scan: Click the extension icon → "Scan Inbox Now"

## Verification

To verify the extension is working:

1. **Check Console Logs:**
   - Open Gmail
   - Press F12 to open DevTools
   - Go to Console tab
   - You should see: `JobMail AI: Content script loaded`

2. **Test AI APIs:**
   - In Console, run:
     ```javascript
     await ai.languageModel.capabilities()
     ```
   - Should return `{ available: "readily" }`

3. **Test Detection:**
   - Click the extension icon
   - Click "Scan Inbox Now"
   - Check the dashboard for detected emails

## Troubleshooting

### AI APIs Not Available
**Problem:** Console shows "Chrome AI APIs not available"

**Solution:**
- Make sure you enabled all three flags in chrome://flags
- Relaunch Chrome completely
- Download the Gemini Nano model (see Step 2)
- Wait a few minutes after first installation

### Extension Not Scanning
**Problem:** No emails detected

**Solution:**
- Refresh Gmail page
- Check if you have emails matching OA keywords
- Try manual scan using "Scan Inbox Now" button
- Check console for errors

### Notifications Not Working
**Problem:** No browser notifications appearing

**Solution:**
- Check if notifications are enabled in extension popup
- Allow notifications for Chrome in your OS settings
- Check Chrome notification permissions: chrome://settings/content/notifications

### Gmail Not Loading Properly
**Problem:** Gmail doesn't load or shows errors

**Solution:**
- Disable the extension temporarily
- Clear browser cache
- Re-enable extension and refresh Gmail

## Testing with Sample Emails

To test the extension without real OA emails:

1. Compose a test email to yourself with subject like:
   - "HackerRank Online Assessment Invitation"
   - "Complete your CodeSignal Assessment"
   - "Technical Assessment - Coding Challenge"

2. Send it to yourself
3. Refresh Gmail
4. The extension should detect it!

## For Developers

### Development Mode
When developing, you can:
- Edit code files
- Go to `chrome://extensions/`
- Click refresh icon on the extension
- Reload Gmail page to see changes

### Debugging
- All console logs prefixed with "JobMail AI:"
- Use Chrome DevTools → Application → Storage to inspect saved data
- Background script logs: chrome://extensions → "Service Worker" → Inspect

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all flags are enabled
3. Ensure Gemini Nano model is downloaded
4. Try in a fresh Chrome profile

---

**Ready to use!** Open Gmail and let JobMail AI help you never miss an OA again!
