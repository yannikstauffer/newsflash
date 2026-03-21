## 1. Replace favicon SVG internals

- [ ] 1.1 Extract the bolt path `d` attribute from current `public/favicon.svg` (preserve exactly)
- [ ] 1.2 Rewrite `public/favicon.svg`: root `<svg>` with same `width`, `height`, `viewBox`; `<defs>` containing a single `<linearGradient id="bolt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">` with stops at 0% `#7e14ff`, 50% `#863bff`, 100% `#47bfff`; single `<path>` with `fill="url(#bolt-gradient)"` using the preserved `d` attribute
- [ ] 1.3 Remove all `<filter>`, `<mask>`, `<g>`, blurred ellipse elements and their `<defs>` entries — only `<linearGradient>` remains in `<defs>`

## 2. Verification

- [ ] 2.1 Visually verify the favicon renders correctly in the browser at multiple sizes (tab icon, bookmark)
- [ ] 2.2 Confirm SVG contains no `<filter>`, `<mask>`, `<feGaussianBlur>`, `<feFlood>`, or `<feBlend>` elements
- [ ] 2.3 Confirm bolt path `d` attribute is identical to original
- [ ] 2.4 Confirm root `<svg>` attributes are `width="48" height="46" viewBox="0 0 48 46"`
