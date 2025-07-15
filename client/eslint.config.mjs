import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  // This line contains your existing configurations from Next.js
  ...compat.extends("next/core-web-vitals"),

  // Add a new configuration object right here for your custom rules
  {
    rules: {
      // This will turn OFF the error for using 'any'
      "@typescript-eslint/no-explicit-any": "off",

      // This will fix the "'_key' is defined but never used" error correctly.
      // It sets it as a warning and ignores any variable starting with an underscore.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
