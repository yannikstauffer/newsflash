## 1. Article Card Layout Changes

- [x] 1.1 Update title classes in `article-card.tsx`: change `line-clamp-2 font-semibold` to `line-clamp-4 font-medium md:line-clamp-2 md:font-semibold`
- [x] 1.2 Hide description on mobile: add `hidden md:block` to the description paragraph in `article-card.tsx`
- [x] 1.3 Update thumbnail to uniform 96x96: replace `size-16 md:h-20 md:w-24` with `size-24`, update `width={96} height={96}` attributes

## 2. Action Button Visibility

- [x] 2.1 Update action button visibility in `article-action-buttons.tsx`: change `touch-device:flex` to `touch-device:md:flex`

## 3. Verification

- [x] 3.1 Run existing tests (`npm run test`) and fix any failures
- [x] 3.2 Run linting (`npm run lint`) and fix any violations
- [x] 3.3 Verify IDE diagnostics are clean on modified files
