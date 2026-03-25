## 1. Restructure filter bar JSX

- [ ] 1.1 Extract the "Refreshed..." span out of the shared status div into a standalone element (left-aligned)
- [ ] 1.2 Move the article count span into the toggles div, placing it before the first Button
- [ ] 1.3 Add `ml-auto` to the toggles div to push it (with article count) to the right edge
- [ ] 1.4 Change the toggles div gap to `gap-1.5 md:gap-3` for responsive spacing

## 2. Verify

- [ ] 2.1 Visual check at 320px, 375px, 768px, 1024px — confirm right-alignment and spacing
- [ ] 2.2 Confirm layout is correct when `lastRefreshedAt` is null (no refresh text rendered)
- [ ] 2.3 Run `npm run lint` and fix any issues
