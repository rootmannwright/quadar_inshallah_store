// eslint.config.js
// translated by RootmannWright
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    
    // parserOptions é aqui
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2026, // versão do JS
        sourceType: "module", // usar import/export
      },
      globals: globals.node, // variáveis globais do node
    },

    env: {
      browser: true,
      node: true,
      es2026: true,
    },

    plugins: {
      js,
    },

    extends: [
      "js/recommended",             // regras básicas do @eslint/js
      pluginReact.configs.flat.recommended, // regras recomendadas do react
    ],

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      // Aqui você coloca as regras que quer customizar
      "no-console": "warn",       // console.log vira warning
      "quotes": ["error", "double"], // força aspas duplas
      "curly": "error",           // sempre usar {}
      "consistent-return": "error", // arrow async precisa sempre retornar
      "semi": ["error", "always"], // ponto e vírgula obrigatório
    },
  },
]);