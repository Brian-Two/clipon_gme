// tests/setup/jest.setup.js
// Import Chrome API mock
const { createChromeMock } = require('../mocks/chrome-api.mock');

// Set up global Chrome API mock
global.chrome = createChromeMock();

// Add any other global mocks or setup needed
global.alert = jest.fn();
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Add custom matchers if needed
expect.extend({
  // Example custom matcher
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid email`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid email`,
        pass: false
      };
    }
  }
});