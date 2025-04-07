# Google Meet Email Helper

A Chrome extension that streamlines email sharing in Google Meet breakout rooms. Perfect for educational programs, workshops, and collaborative sessions.

## 🌟 Features

- **One-Click Email Sharing**: Paste your email into the Google Meet chat with a single click
- **Email Collection**: Automatically extract all email addresses shared in the chat
- **Copy All Functionality**: Easily copy all collected emails with one button
- **Simple Setup**: Save your email once and use it across all your Google Meet sessions
- **Keyboard Shortcut**: Optional Ctrl+Shift+E (or Cmd+Shift+E on Mac) to quickly paste your email

## 🔍 Use Case

Originally developed for the Google TechExchange program to save time during breakout room sessions where participants need to share contact information for collaborative documents. This extension eliminates the repetitive task of typing your email address and manually collecting others' emails from the chat.

## 💻 Technical Details

- Built with vanilla JavaScript
- Uses Chrome Extension Manifest V3
- Leverages Chrome's storage API for saving preferences
- Implements content scripts to interact with Google Meet's interface
- No data sent to external servers - everything stays in your browser

## 🔧 Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory
5. Pin the extension to your toolbar for easy access

## 🧪 Running Unit Tests

To run the unit tests for this extension:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run all tests**
   ```bash
   npm test
   ```

3. **Run tests with coverage report**
   ```bash
   npm run test:coverage
   ```

4. **Run tests in watch mode** (automatically re-run when files change)
   ```bash
   npm run test:watch
   ```

5. **Run code linting**
   ```bash
   npm run lint
   ```

6. **Fix linting issues automatically**
   ```bash
   npm run lint:fix
   ```

### Test Structure

Tests are organized in the `tests/` directory:
- `content.test.js` - Tests for the Google Meet content script
- `popup.test.js` - Tests for the extension popup functionality
- `setup/` - Contains Jest configuration files
- `mocks/` - Contains mock implementations of Chrome APIs

*Made with ☕ to save time during collaborative online sessions*