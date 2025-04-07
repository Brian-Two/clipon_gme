// jest.config.js
module.exports = {
    // Enable automock
    automock: false,
    
    // Clear mock calls between tests
    clearMocks: true,
    
    // Collect coverage information
    collectCoverage: true,
    
    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",
    
    // Indicates which files to collect coverage from
    collectCoverageFrom: [
      "**/*.js",
      "!node_modules/**",
      "!coverage/**",
      "!jest.config.js",
      "!tests/**"
    ],
    
    // The test environment to use
    testEnvironment: "jsdom",
    
    // A list of paths to modules that run some code to configure the testing framework
    setupFiles: [
      "<rootDir>/tests/setup/jest.setup.js"
    ],
    
    // The glob patterns Jest uses to detect test files
    testMatch: [
      "**/tests/**/*.test.js"
    ],
    
    // Map module paths for testing
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/$1"
    },
    
    // Mocks all setTimeout, setInterval, etc. with test fakes
    timers: "fake",
    
    // Verbose output
    verbose: true
  };