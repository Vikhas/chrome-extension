# Contributing to JobMail AI

Thank you for your interest in contributing to JobMail AI! This document provides guidelines for contributing to this Chrome Extension.

## Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/jobmail-ai.git
   cd jobmail-ai
   ```
3. **Load the extension** in Chrome (see INSTALLATION.md)

## Project Structure

```
jobmail-ai/
├── manifest.json         # Extension configuration
├── content.js            # Gmail integration & email scanning
├── background.js         # Service worker for notifications
├── popup.html            # Dashboard UI structure
├── popup.js              # Dashboard logic
├── popup.css             # Dashboard styling
├── styles.css            # Gmail injection styles
├── icons/                # Extension icons
├── README.md             # Main documentation
├── INSTALLATION.md       # Setup guide
└── LICENSE               # MIT License
```

## Making Changes

### Code Style
- Use 2 spaces for indentation
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Follow existing code patterns

### Testing Your Changes
1. Make your changes in the code
2. Go to `chrome://extensions/`
3. Click refresh icon on JobMail AI
4. Reload Gmail to test changes
5. Check console for errors

### Before Submitting
- [ ] Test in Gmail with real/sample emails
- [ ] Verify no console errors
- [ ] Update README if adding features
- [ ] Test with AI APIs enabled and disabled
- [ ] Ensure backward compatibility

## Pull Request Process

1. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "Add feature: description"
   ```

3. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request** on GitHub with:
   - Clear title and description
   - Screenshots/GIFs if UI changes
   - Testing steps
   - Related issue numbers (if any)

## Feature Ideas

Want to contribute but not sure what to work on? Here are some ideas:

### High Priority
- [ ] Add deadline extraction and countdown timer
- [ ] Support for more email providers (Outlook, Yahoo)
- [ ] Export detected emails to CSV
- [ ] Dark mode for popup dashboard

### Medium Priority
- [ ] Implement Translator API for multilingual emails
- [ ] Add Proofreader API for email replies
- [ ] Company logo detection (multimodal)
- [ ] Statistics and analytics page

### Nice to Have
- [ ] Calendar integration
- [ ] Custom keyword configuration
- [ ] Email templates for responses
- [ ] Sound notifications

## Bug Reports

Found a bug? Please open an issue with:
- Clear title describing the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Chrome version and OS
- Console error messages

## Questions?

Feel free to open an issue for:
- Feature discussions
- Architecture questions
- Implementation help
- General questions

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to JobMail AI!** 🎉
