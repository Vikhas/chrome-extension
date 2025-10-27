# JobMail AI - Testing Guide

This guide will help you test the extension locally and verify all features are working correctly.

## Pre-Testing Setup

### 1. Verify Chrome Version
```bash
# Open Chrome and check version (must be 128+)
chrome://version
```

### 2. Enable AI Flags
Navigate to `chrome://flags` and enable:
- `#optimization-guide-on-device-model` → Enabled
- `#prompt-api-for-gemini-nano` → Enabled  
- `#summarization-api-for-gemini-nano` → Enabled

Then **Relaunch Chrome**.

### 3. Download Gemini Nano Model
1. Open DevTools (F12)
2. Go to Console tab
3. Run:
   ```javascript
   await ai.languageModel.create()
   ```
4. Wait for model download to complete

## Testing the Extension

### Test 1: Extension Loading
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the extension folder
4. Verify:
   - Extension appears in list
   - No errors shown
   - Extension icon visible in toolbar

**Expected Result:** Extension loads without errors

### Test 2: Gmail Integration
1. Navigate to https://mail.google.com
2. Open DevTools Console (F12)
3. Look for messages:
   ```
   JobMail AI: Content script loaded
   JobMail AI: AI session initialized successfully ✓
   JobMail AI: Observer started
   JobMail AI: Scanning X emails in inbox...
   ```

**Expected Result:** Console shows initialization messages, no errors

### Test 3: Email Detection (Keyword Fallback)
Even without AI APIs, the extension should detect OA emails using keywords.

**Test Steps:**
1. Compose an email to yourself with subject:
   ```
   HackerRank Online Assessment Invitation - Software Engineer
   ```
2. Send it to yourself
3. Wait for email to arrive in inbox
4. Check console for:
   ```
   JobMail AI: Processing email - HackerRank Online Assessment...
   JobMail AI: OA Email detected!
   ```
5. Verify email has:
   - Yellow background highlight
   - "OA" badge next to subject

**Expected Result:** Email is highlighted and detected

### Test 4: AI Classification (Requires AI APIs)
If AI APIs are enabled:

1. Send emails with different content:
   - **OA Invite:** "Please complete your CodeSignal assessment by Friday"
   - **Rejection:** "Unfortunately, we are not moving forward with your application"
   - **Status Update:** "Your application is under review"

2. Check console for:
   ```
   JobMail AI: AI Classification: OA_INVITE
   ```

3. Only OA emails should be highlighted

**Expected Result:** AI correctly classifies emails

### Test 5: Summarization (Requires AI APIs)
1. Send an OA email with detailed content:
   ```
   Subject: Technical Assessment - Complete by Oct 30
   Body: Please complete your HackerRank assessment. 
   You have 48 hours from receiving this email. 
   The test includes 3 coding problems. Good luck!
   ```

2. Open extension popup
3. Check if summary includes key details

**Expected Result:** Summary extracts important information

### Test 6: Popup Dashboard
1. Click extension icon in toolbar
2. Verify dashboard shows:
   - Email count
   - "Scan Inbox Now" button
   - List of detected OA emails
   - Email details (sender, subject, time)

3. Click "Scan Inbox Now"
4. Verify:
   - Button shows "Scanning..." temporarily
   - Email list updates

**Expected Result:** Dashboard displays correctly and scan works

### Test 7: Notifications
1. Ensure notifications are enabled in popup
2. Send a new OA email
3. Verify:
   - Browser notification appears
   - Notification shows sender and subject
   - Extension badge shows "!"

**Expected Result:** Notification appears for new OA emails

### Test 8: Storage Persistence
1. Detect some OA emails
2. Close and reopen popup
3. Verify emails still appear in dashboard

**Expected Result:** Data persists across popup opens

### Test 9: Clear Functionality
1. Click "Clear All" button in popup
2. Confirm the dialog
3. Verify:
   - Dashboard shows empty state
   - Badge clears
   - Storage is emptied

**Expected Result:** All data clears successfully

## Debugging Common Issues

### Issue: "AI APIs not available"
**Debug Steps:**
1. Check console for exact error message
2. Verify flags are enabled: `chrome://flags`
3. Check AI availability:
   ```javascript
   await ai.languageModel.capabilities()
   // Should return { available: "readily" }
   ```
4. Try restarting Chrome completely

### Issue: "No emails detected"
**Debug Steps:**
1. Check console for "Scanning X emails"
2. If X is 0, verify you're on Gmail inbox (not search/label view)
3. Check if emails have OA keywords
4. Try manual scan: Click extension → "Scan Inbox Now"
5. Check console for "Processing email" messages

### Issue: "Highlighting not working"
**Debug Steps:**
1. Inspect email row in DevTools
2. Check if class `jobmail-oa-detected` is added
3. Verify styles.css is loaded
4. Check console for errors

### Issue: "Popup not loading"
**Debug Steps:**
1. Right-click extension icon → Inspect popup
2. Check popup console for errors
3. Verify popup.html/js/css files exist
4. Check manifest.json for correct popup paths

## Testing Checklist

Before submitting:
- [ ] Extension loads without errors
- [ ] Content script initializes on Gmail
- [ ] AI APIs initialize (or graceful fallback)
- [ ] Email detection works (keyword-based)
- [ ] Email highlighting appears in Gmail
- [ ] Popup dashboard displays correctly
- [ ] "Scan Inbox Now" button works
- [ ] Notifications appear for new OA emails
- [ ] Data persists in storage
- [ ] "Clear All" functionality works
- [ ] No console errors during normal operation
- [ ] Extension works in fresh Chrome profile

## Manual Testing Scenarios

### Scenario 1: Fresh Install
1. Install extension in fresh Chrome profile
2. Navigate to Gmail
3. Send test OA email
4. Verify all features work

### Scenario 2: Multiple OA Emails
1. Send 5-10 OA emails with different keywords
2. Verify all are detected
3. Check dashboard shows all emails
4. Verify no duplicates

### Scenario 3: Mixed Emails
1. Send mix of OA, rejection, and normal emails
2. Verify only OA emails are highlighted
3. Check dashboard shows only OA emails

### Scenario 4: Real-World Test
1. Use with actual Gmail account
2. Monitor inbox for 24 hours
3. Verify real OA emails are detected
4. Check for false positives

## Performance Testing

### Memory Check
1. Open Chrome Task Manager (Shift+Esc)
2. Find extension process
3. Monitor memory usage
4. Should stay under 50MB

### Processing Speed
1. Test with inbox containing 100+ emails
2. Click "Scan Inbox Now"
3. Monitor console for processing time
4. Should complete within 10-15 seconds

## Browser Compatibility

**Tested On:**
- Chrome Canary 128+ ✓
- Chrome Dev 128+ ✓
- Chrome Beta (without AI) ✓ (keyword fallback works)
- Chrome Stable (without AI) ✓ (keyword fallback works)

## Reporting Issues

When reporting bugs, include:
1. Chrome version
2. Extension version
3. Console logs (with "JobMail AI" prefix)
4. Steps to reproduce
5. Expected vs actual behavior
6. Screenshots if applicable

## Test Results Template

```
Test Date: [DATE]
Chrome Version: [VERSION]
AI APIs Enabled: [YES/NO]

✓ Extension loads
✓ Gmail integration works  
✓ Email detection works
✓ Highlighting visible
✓ Popup dashboard functional
✓ Notifications working
✓ Storage persistence works
✓ No critical errors

Notes: [ANY OBSERVATIONS]
```

---

**Ready to test!** Follow this guide to ensure the extension is working perfectly before submission.
