import js from "@eslint/js"
import stylistic from "@stylistic/eslint-plugin"
import { defineConfig, globalIgnores } from "eslint/config"
import i18next from "eslint-plugin-i18next"
import importPlugin from "eslint-plugin-import"
import jsxA11y from "eslint-plugin-jsx-a11y"
import noSecrets from "eslint-plugin-no-secrets"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import security from "eslint-plugin-security"
import unicorn from "eslint-plugin-unicorn"
import globals from "globals"
import tseslint from "typescript-eslint"

const eslintConfig = defineConfig([
  // Base config for all TS/TSX files
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "@stylistic": stylistic,
      unicorn,
      security,
      "no-secrets": noSecrets,
      "jsx-a11y": jsxA11y,
      i18next,
      import: importPlugin,
      react,
    },
    rules: {
      // Stylistic/Formatting rules
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/arrow-parens": ["error", "always"],
      "@stylistic/arrow-spacing": ["error", { before: true, after: true }],
      "@stylistic/block-spacing": ["error", "always"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/comma-spacing": ["error", { before: false, after: true }],
      "@stylistic/comma-style": ["error", "last"],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/indent": ["error", 2, { SwitchCase: 1 }],
      "@stylistic/jsx-quotes": ["error", "prefer-double"],
      "@stylistic/key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "@stylistic/keyword-spacing": ["error", { before: true, after: true }],
      "@stylistic/linebreak-style": ["error", "unix"],
      "@stylistic/max-len": ["warn", {
        code: 120,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }],
      "@stylistic/member-delimiter-style": ["error", {
        multiline: { delimiter: "none" },
        singleline: { delimiter: "semi", requireLast: false },
      }],
      "@stylistic/no-extra-semi": "error",
      "@stylistic/no-mixed-spaces-and-tabs": "error",
      "@stylistic/no-multi-spaces": "error",
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0, maxBOF: 0 }],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/padded-blocks": ["error", "never"],
      "@stylistic/quote-props": ["error", "as-needed"],
      "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
      "@stylistic/semi": ["error", "never"],
      "@stylistic/semi-spacing": ["error", { before: false, after: true }],
      "@stylistic/space-before-blocks": ["error", "always"],
      "@stylistic/space-before-function-paren": ["error", {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      }],
      "@stylistic/space-in-parens": ["error", "never"],
      "@stylistic/space-infix-ops": "error",
      "@stylistic/spaced-comment": ["error", "always", { markers: ["/"] }],

      // Unicorn rules for better code practices
      "unicorn/better-regex": "error",
      "unicorn/catch-error-name": "error",
      "unicorn/consistent-destructuring": "error",
      "unicorn/consistent-function-scoping": "error",
      "unicorn/custom-error-definition": "error",
      "unicorn/error-message": "error",
      "unicorn/escape-case": "error",
      "unicorn/expiring-todo-comments": "warn",
      "unicorn/explicit-length-check": "error",
      "unicorn/filename-case": ["error", { cases: { kebabCase: true, pascalCase: true } }],
      "unicorn/new-for-builtins": "error",
      "unicorn/no-abusive-eslint-disable": "error",
      "unicorn/no-array-for-each": "error",
      "unicorn/no-array-push-push": "error",
      "unicorn/no-console-spaces": "error",
      "unicorn/no-for-loop": "error",
      "unicorn/no-instanceof-array": "error",
      "unicorn/no-invalid-remove-event-listener": "error",
      "unicorn/no-lonely-if": "error",
      "unicorn/no-negated-condition": "error",
      "unicorn/no-nested-ternary": "error",
      "unicorn/no-new-array": "error",
      "unicorn/no-new-buffer": "error",
      "unicorn/no-null": "off",
      "unicorn/no-object-as-default-parameter": "error",
      "unicorn/no-typeof-undefined": "error",
      "unicorn/no-unnecessary-await": "error",
      "unicorn/no-unreadable-array-destructuring": "error",
      "unicorn/no-unreadable-iife": "error",
      "unicorn/no-unused-properties": "error",
      "unicorn/no-useless-fallback-in-spread": "error",
      "unicorn/no-useless-length-check": "error",
      "unicorn/no-useless-promise-resolve-reject": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/no-useless-switch-case": "error",
      "unicorn/no-useless-undefined": "off",
      "unicorn/no-zero-fractions": "error",
      "unicorn/number-literal-case": "error",
      "unicorn/numeric-separators-style": "error",
      "unicorn/prefer-add-event-listener": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-array-flat": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-array-index-of": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/prefer-at": "error",
      "unicorn/prefer-code-point": "error",
      "unicorn/prefer-date-now": "error",
      "unicorn/prefer-default-parameters": "error",
      "unicorn/prefer-dom-node-append": "error",
      "unicorn/prefer-dom-node-remove": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-logical-operator-over-ternary": "error",
      "unicorn/prefer-modern-dom-apis": "error",
      "unicorn/prefer-modern-math-apis": "error",
      "unicorn/prefer-negative-index": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-number-properties": "error",
      "unicorn/prefer-object-from-entries": "error",
      "unicorn/prefer-optional-catch-binding": "error",
      "unicorn/prefer-query-selector": "error",
      "unicorn/prefer-reflect-apply": "error",
      "unicorn/prefer-regexp-test": "error",
      "unicorn/prefer-set-has": "error",
      "unicorn/prefer-spread": "error",
      "unicorn/prefer-string-replace-all": "error",
      "unicorn/prefer-string-slice": "error",
      "unicorn/prefer-string-starts-ends-with": "error",
      "unicorn/prefer-string-trim-start-end": "error",
      "unicorn/prefer-switch": "error",
      "unicorn/prefer-ternary": "error",
      "unicorn/prefer-top-level-await": "error",
      "unicorn/prefer-type-error": "error",
      "unicorn/prevent-abbreviations": ["error", {
        allowList: {
          props: true,
          Props: true,
          ref: true,
          Ref: true,
          params: true,
          Params: true,
          args: true,
          Args: true,
          env: true,
          Env: true,
          dir: true,
          Dir: true,
          utils: true,
        },
      }],
      "unicorn/relative-url-style": "error",
      "unicorn/require-array-join-separator": "error",
      "unicorn/require-number-to-fixed-digits-argument": "error",
      "unicorn/switch-case-braces": "error",
      "unicorn/text-encoding-identifier-case": "error",
      "unicorn/throw-new-error": "error",

      // WCAG Level AA Accessibility Rules
      "jsx-a11y/alt-text": ["error", {
        elements: ["img", "object", "area", 'input[type="image"]'],
      }],
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-activedescendant-has-tabindex": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/iframe-has-title": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/media-has-caption": "error",
      "jsx-a11y/mouse-events-have-key-events": "error",
      "jsx-a11y/no-access-key": "error",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/no-distracting-elements": "error",
      "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",
      "jsx-a11y/no-noninteractive-tabindex": "error",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/scope": "error",
      "jsx-a11y/tabindex-no-positive": "error",

      // OWASP Security Rules
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "error",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-new-buffer": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-object-injection": "warn",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",
      "security/detect-unsafe-regex": "error",

      // Internationalization (disabled until an i18n system is adopted)
      "i18next/no-literal-string": "off",

      // Prevent secrets in code
      "no-secrets/no-secrets": ["error", {
        tolerance: 4.5,
        additionalDelimiters: ["=", ":", "\"", "'"],
      }],

      // TypeScript-specific rules
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],

      // Import rules
      "import/order": ["error", {
        groups: ["builtin", "external", "internal", ["parent", "sibling"], "index", "type"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      }],
      "import/no-duplicates": "error",
      "import/no-restricted-paths": ["error", {
        zones: [
          {
            target: "./src/features",
            from: "./src/app",
          },
          {
            target: ["./src/components", "./src/hooks", "./src/lib", "./src/types", "./src/utils"],
            from: ["./src/features", "./src/app"],
          },
        ],
      }],

      // React best practices
      "react/no-danger": "error",
    },
  },

  // Global ignores
  globalIgnores([
    "dist/**",
    "build/**",
    "node_modules/**",
    "public/**",
    ".husky/**",
    "coverage/**",
    "playwright-report/**",
    "*.config.{js,ts,mjs}",
  ]),
])

export default eslintConfig
