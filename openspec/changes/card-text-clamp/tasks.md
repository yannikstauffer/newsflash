## 1. Card Layout Changes

- [ ] 1.1 Wrap the title (`<h3>`) and description (`<p>`) in a flex-column container with `md:h-[92px] md:flex md:flex-col` on desktop
- [ ] 1.2 Set title to `md:flex-none` (keeps natural height, retains `md:line-clamp-2`)
- [ ] 1.3 Set description to `md:flex-1 md:overflow-hidden`, remove existing `md:line-clamp-2`

## 2. Gradient Fade

- [ ] 2.1 Add CSS `mask-image` gradient to description on desktop: `md:[mask-image:linear-gradient(to_bottom,black_calc(100%-0.75rem),transparent)]`
- [ ] 2.2 Verify gradient fade renders correctly in Chrome, Firefox, and Safari (mask-image has broad support but check `-webkit-mask-image` if needed)

## 3. Testing

- [ ] 3.1 Visual check: 1-line title shows ~3 lines of description with gradient fade
- [ ] 3.2 Visual check: 2-line title shows ~2 lines of description, clean cutoff
- [ ] 3.3 Visual check: card without image has same behavior
- [ ] 3.4 Visual check: card without description — container height still applies, no visual artifact
- [ ] 3.5 Visual check: mobile layout unchanged (description hidden, title `line-clamp-4`)
- [ ] 3.6 Run `npm run lint` and fix any issues
- [ ] 3.7 Run `npm run test` and fix any failures
