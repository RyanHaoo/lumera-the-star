// @ts-check

import "path";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js },
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
        tsconfigRootDir: __dirname,
      },
    },
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig
);
