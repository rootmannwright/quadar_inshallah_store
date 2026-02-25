import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
    settings: {
      react: {
        version: "detect" // ⚡ remove o warning do React
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "eqeqeq": "error",
      "consistent-return": "error",
      "curly": "error",
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
    }
  }
]);