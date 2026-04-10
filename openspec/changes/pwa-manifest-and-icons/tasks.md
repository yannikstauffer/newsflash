## 1. Design and Generate Icon Set

- [x] 1.1 Design the lightning bolt icon as an SVG source file (white bolt on `#2563eb` background) — save to `.tmp/icon-source.svg`
- [x] 1.2 Generate PNG icons at all required sizes (48, 72, 96, 128, 144, 192, 384, 512) and place in `public/icons/`
- [x] 1.3 Generate the maskable variant (512x512) with safe zone padding and place in `public/icons/icon-maskable-512.png`
- [x] 1.4 Generate the Apple touch icon (180x180) and place in `public/icons/apple-touch-icon-180.png`

## 2. Update Favicon

- [x] 2.1 Replace `public/favicon.svg` with the new lightning bolt design
- [x] 2.2 Generate `public/favicon-32.png` (32x32 PNG fallback)

## 3. Create Web App Manifest

- [x] 3.1 Create `public/manifest.json` with all required fields: `name`, `short_name`, `description`, `start_url`, `scope`, `display`, `orientation`, `background_color`, `theme_color`, and `icons` array referencing all generated icons with correct `sizes`, `type`, and `purpose`

## 4. Update index.html

- [x] 4.1 Add `<link rel="manifest" href="/manifest.json">` to `<head>`
- [x] 4.2 Add `<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">`
- [x] 4.3 Add `<meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)">`
- [x] 4.4 Add `<meta name="description" content="...">` with a short app description
- [x] 4.5 Add `<meta name="apple-mobile-web-app-capable" content="yes">`
- [x] 4.6 Add `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
- [x] 4.7 Add `<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png">`
- [x] 4.8 Add `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">` as PNG fallback

## 5. Quality Gates

- [x] 5.1 Run `npm run lint` and fix any issues
- [x] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 5.3 Run `npm run test` and fix any issues
- [x] 5.4 Run `npm run test:e2e` and fix any issues
- [x] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed
