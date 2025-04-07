// .eslintrc.js
module.exports = {
    "env": {
      "browser": true,
      "es2021": true,
      "jest": true,
      "webextensions": true
    },
    "extends": [
      "eslint:recommended",
      "plugin:jest/recommended"
    ],
    "parserOptions": {
      "ecmaVersion": 12,
      "sourceType": "module"
    },
    "plugins": [
      "jest"
    ],
    "rules": {
      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "no-console": "off", // Allow console for Chrome extensions
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error"
    },
    "globals": {
      "chrome": "readonly"
    }
  };