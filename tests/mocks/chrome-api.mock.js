// tests/mocks/chrome-api.mock.js
// Centralized mocks for Chrome Extension API

/**
 * Creates a mock of the Chrome API
 * @returns {Object} Mock Chrome API
 */
function createChromeMock() {
    return {
      runtime: {
        onMessage: {
          addListener: jest.fn()
        },
        lastError: null
      },
      storage: {
        sync: {
          get: jest.fn((keys, callback) => {
            if (callback) callback({ userEmail: 'test@example.com' });
          }),
          set: jest.fn((data, callback) => {
            if (callback) callback();
          })
        }
      },
      tabs: {
        query: jest.fn((queryInfo, callback) => {
          if (callback) callback([{ id: 123 }]);
        }),
        sendMessage: jest.fn((tabId, message, callback) => {
          if (callback) {
            if (message.action === 'pasteEmail') {
              callback({ success: true });
            } else if (message.action === 'collectEmails') {
              callback({ emails: ['user1@example.com', 'user2@example.com'] });
            }
          }
        })
      }
    };
  }
  
  /**
   * Resets all mock functions in the Chrome API mock
   * @param {Object} chromeMock - The Chrome API mock object to reset
   */
  function resetChromeMock(chromeMock) {
    // Reset all mocks
    jest.resetAllMocks();
    
    // Clear lastError
    chromeMock.runtime.lastError = null;
  }
  
  module.exports = {
    createChromeMock,
    resetChromeMock
  };