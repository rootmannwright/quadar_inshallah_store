// eslint.config.js
import { defineConfig } from "eslint/config";

export default defineConfig({
  root: true,
  env: {
    node: true,
    es2023: true
  },
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: "module"
  },
  extends: ["eslint:recommended"],
  rules: {
    "no-unused-vars": "warn",
    "no-undef": "error",
    "no-console": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"]
  }
});