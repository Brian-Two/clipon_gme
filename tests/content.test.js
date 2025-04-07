// tests/content.test.js
const { resetChromeMock } = require('./mocks/chrome-api.mock');

describe('Google Meet Email Helper Content Script Tests', () => {
  // Store the original document methods to restore after tests
  let originalQuerySelector;
  let originalQuerySelectorAll;
  let originalAddEventListener;
  
  beforeEach(() => {
    // Reset chrome mock
    resetChromeMock(chrome);
    
    // Mock document methods
    originalQuerySelector = document.querySelector;
    originalQuerySelectorAll = document.querySelectorAll;
    originalAddEventListener = document.addEventListener;
    
    document.querySelector = jest.fn();
    document.querySelectorAll = jest.fn(() => []);
    document.addEventListener = jest.fn();
    
    // Load the content script - using jest.isolateModules to ensure a clean module for each test
    jest.isolateModules(() => {
      require('../content');
    });
  });
  
  afterEach(() => {
    // Restore original document methods
    document.querySelector = originalQuerySelector;
    document.querySelectorAll = originalQuerySelectorAll;
    document.addEventListener = originalAddEventListener;
    
    // Clean up
    jest.resetAllMocks();
  });
  
  test('should register message listener', () => {
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });
  
  test('should register keyboard shortcut listener', () => {
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  describe('pasteEmailInChat function', () => {
    test('should paste email to chat input and click send button', () => {
      // Mock DOM elements
      const mockChatInput = {
        focus: jest.fn(),
        value: '',
        dispatchEvent: jest.fn()
      };
      
      const mockSendButton = {
        click: jest.fn(),
        hasAttribute: jest.fn(() => false),
        removeAttribute: jest.fn()
      };
      
      // Setup DOM mocks
      document.querySelector.mockImplementation((selector) => {
        if (selector.includes('textarea')) return mockChatInput;
        if (selector.includes('button')) return mockSendButton;
        return null;
      });
      
      // Create a reference to the message listener
      const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      
      // Mock response function
      const mockSendResponse = jest.fn();
      
      // Trigger the paste email action
      messageListener({ action: 'pasteEmail', email: 'test@example.com' }, {}, mockSendResponse);
      
      // Verify that the email was pasted
      expect(mockChatInput.focus).toHaveBeenCalled();
      expect(mockChatInput.value).toBe('test@example.com');
      expect(mockChatInput.dispatchEvent).toHaveBeenCalled();
      
      // Fast-forward timers to trigger the send button click
      jest.runAllTimers();
      
      // Verify that the send button was clicked
      expect(mockSendButton.click).toHaveBeenCalled();
      
      // Verify response was sent
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });
    
    // Additional tests remain the same...
  });
  
  // Additional test suites remain the same...
});