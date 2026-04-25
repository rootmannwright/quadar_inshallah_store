// eslint.config.js
import js from "@eslint/js";

export default [
  js.configs.recommended,

// (Node/backend)
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly"
      }
    }
  },

// (Browser/frontend)
  {
    files: ["src/**/*.js"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly"
      }
    }
  }
];