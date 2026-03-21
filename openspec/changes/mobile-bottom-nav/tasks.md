## Tasks

- [ ] Restructure `app-layout.tsx` — pull nav out of header wrapper, apply responsive positioning classes (`fixed bottom-0` on mobile, `sm:sticky sm:top-0` on desktop)
- [ ] Add safe-area bottom padding to nav for iOS home indicator
- [ ] Add bottom padding to `<main>` on mobile (`pb-16 sm:pb-0`) to prevent content overlap
- [ ] Switch active indicator: top border on mobile, bottom border on desktop
- [ ] Adjust header/border styles: `border-t` on mobile, `border-b` on desktop
- [ ] Test at 320px, 375px, 768px, 1024px viewports
- [ ] Verify skip-to-content link works in both layouts
- [ ] Verify single nav landmark in accessibility tree