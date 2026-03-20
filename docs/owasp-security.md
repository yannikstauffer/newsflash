# OWASP Security Standards

The system **MUST** meet OWASP security standards and withstand security audits. This document covers frontend-specific security measures for a Vite + React SPA.

## Input Validation

Validate all user input on the client for UX, and always validate again on the backend for security.

```tsx
// Required — Validate all user input
function ContactForm() {
  function validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email) && email.length <= 254
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }
    submitForm({ email }) // Backend will validate again
  }
}

// Violation — No validation
function handleSubmit() {
  submitForm({ email }) // Submitting raw user input
}
```

### Validation rules

- **Type** — Ensure the value is the expected type (string, number, etc.)
- **Length** — Enforce min/max length limits
- **Format** — Use regex or parsing for emails, URLs, phone numbers
- **Range** — Validate numeric ranges and date boundaries
- **Allowlist** — Prefer allowlists over denylists for accepted values

## XSS Prevention

React escapes JSX expressions by default. The main risk is `dangerouslySetInnerHTML` and dynamic script injection.

```tsx
// Safe — React automatically escapes
<h1>{username}</h1>

// Safe — Sanitize HTML when rendering user-generated rich text
import DOMPurify from "isomorphic-dompurify"
const sanitized = DOMPurify.sanitize(html)
<div dangerouslySetInnerHTML={{ __html: sanitized }} />

// Critical Violation — XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Critical Violation — Never use eval
eval(userInput)
new Function(userInput)()
```

### Additional XSS vectors to avoid

- Never inject user input into `<script>` tags
- Never construct URLs from unsanitized user input for `href` or `src`
- Never use `javascript:` protocol in links

```tsx
// Violation — javascript: protocol XSS
<a href={`javascript:${userInput}`}>Click</a>

// Safe — Validate URL scheme
function isSafeHref(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    return ["http:", "https:", "mailto:"].includes(parsed.protocol)
  } catch {
    return false
  }
}
```

## Sensitive Data Handling

```tsx
// Required — Never store credentials in localStorage
// Use HTTP-only cookies (set by backend)

// Required — Don't log sensitive data
console.log("Login attempt:", { username }) // OK
console.log("User data:", { username, password }) // VIOLATION

// Critical Violation — Storing tokens in localStorage
localStorage.setItem("authToken", token) // Vulnerable to XSS

// Critical Violation — Exposing API keys in client code
console.log(import.meta.env.VITE_API_KEY)
```

### Rules

- **Never** store auth tokens in `localStorage` or `sessionStorage` — use HTTP-only cookies
- **Never** log passwords, tokens, API keys, or PII
- **Never** expose secret keys via `VITE_` env vars — only public, non-sensitive values should use the `VITE_` prefix
- **Never** include secrets in client-side bundles

## Error Handling

Never expose internal error details to the user. Log details for debugging, show generic messages to users.

```tsx
// Required — Generic user-facing messages
try {
  await apiCall()
} catch (error) {
  console.error("API error:", error) // Log for debugging
  showError("Failed to save changes") // Generic user message
}

// Violation — Exposing internal details
catch (error) {
  alert(error.message) // Might expose database info, paths, stack traces
}
```

## URL Validation

Validate and restrict URLs before using them in requests, redirects, or DOM attributes.

```tsx
// Required — Validate URLs before use
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const allowedDomains = ["api.example.com", "cdn.example.com"]
    return allowedDomains.includes(parsed.hostname)
  } catch {
    return false
  }
}

// Violation — Using user input directly as image source
<img src={userProvidedUrl} /> // Potential SSRF / data exfiltration
```

### Open redirect prevention

```tsx
// Violation — Unvalidated redirect
window.location.href = params.get("returnUrl")

// Safe — Validate redirect target
function safeRedirect(url: string): void {
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.origin === window.location.origin) {
      window.location.href = parsed.href
    }
  } catch {
    window.location.href = "/"
  }
}
```

## Dependency Security

- Run `npm audit` regularly to check for known vulnerabilities
- Keep dependencies up to date
- Review new dependencies before adding (check download count, maintenance status, bundle size)
- Prefer well-maintained packages with small attack surfaces

## Security Checklist

### Automated (runs on commit/push)

- ESLint security checks (15+ rules) — **Pre-commit hook**
- Secret detection in code — **Pre-commit hook**

### Manual Code Review

- [ ] All user input validated (type, length, format)
- [ ] No `eval()` or `dangerouslySetInnerHTML` without sanitization
- [ ] No credentials in `localStorage` / `sessionStorage`
- [ ] No sensitive data in `console.log`
- [ ] Error messages don't expose internals
- [ ] URLs validated before use in requests or DOM
- [ ] No `javascript:` protocol in links
- [ ] `VITE_` env vars contain only public, non-sensitive values
- [ ] Dependencies audited (`npm audit`)
