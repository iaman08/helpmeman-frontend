# 001 — Establish a shared motion and reduced-motion policy

- **Status**: IMPLEMENTED — see VERIFICATION.md for coverage and limits
- **Commit**: 49997ba
- **Working tree**: includes the existing uncommitted homepage/dark-mode work; preserve it.
- **Severity**: HIGH
- **Category**: Accessibility / cohesion
- **Estimated scope**: new MotionProvider + lib/motion.ts; app/layout.tsx; app/globals.css; scoped landing reduced-motion policy

## Problem

CSS reduced-motion guards cannot stop every JavaScript animation. Motion currently has no global reducedMotion policy. Root html still requests smooth scrolling, and viewport metadata disables user zoom. Local CSS modules duplicate the same easing.

Current code from `/Users/prativ/dev/helpmeman-platform/frontend/app/layout.tsx:182`:

```tsx
182:       lang="en"
183:       data-scroll-behavior="smooth"
184:       suppressHydrationWarning
185:       className={`${mSaans.variable} antialiased selection:bg-white selection:text-black`}
186:     >
187:       <head>
188:         <script dangerouslySetInnerHTML={{ __html: `(function(){var t='light';try{if(localStorage.getItem('helpmeman.theme')==='dark')t='dark'}catch(e){}var d=document.documentElement;d.dataset.theme=t;d.classList.toggle('dark',t==='dark');d.style.colorScheme=t})()` }} />
189:         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
190:         <script
191:           type="application/ld+json"
192:           dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
193:         />
194:         <script
195:           type="application/ld+json"
196:           dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
197:         />
198:       </head>
199:       <body className="font-sans bg-bg text-fg overflow-x-hidden">
200:         <ThemeProvider>
201:           <SidebarProvider>
202:             <LoaderProvider>
```

## Target

Create `lib/motion.ts` with `EASE_OUT = [0.23, 1, 0.32, 1] as const` and a duration vocabulary: press .16, feedback .15, surface .20, dialog .24. Add root CSS `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` and matching `--motion-press:160ms`, `--motion-feedback:150ms`, `--motion-surface:200ms`, `--motion-dialog:240ms`. A client `MotionProvider` wraps children in `<MotionConfig reducedMotion="user" transition={{duration:.20,ease:EASE_OUT}}>`. Add root html reduced-motion scroll behavior. Change viewport content to `width=device-width, initial-scale=1, viewport-fit=cover`. No theme bootstrap changes.

## Repo conventions to follow

Next.js 16.2.4 / React 19 / Tailwind 4. Read `/Users/prativ/dev/helpmeman-platform/frontend/AGENTS.md` and relevant local Next documentation before edits. Motion 12.38, Three 0.184 and Base UI 1.8 are installed. Keep the existing MSaans font, white/light and blue-charcoal/lavender dark palette, current routing and real mentor data. CSS modules sit beside their components. `components/landing/HeroSection.module.css` uses the intended strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; extend the shared tokens from plan 001. For Motion numeric easing use `[0.23, 1, 0.32, 1]`. Pointer press budget: 160ms, scale .97. Reduced motion keeps brief 150ms opacity feedback and drops positional movement.

## Steps

1. Add the tokens and provider; mount inside ThemeProvider without rearranging auth/currency/socket providers.
2. Replace the blanket landing `.001ms` transition override with scoped loop suppression and `150ms` gentle opacity feedback. CSS positional motion must be explicitly disabled in changed components; JS loops retain local guards.
3. Make root html `scroll-behavior:auto` under `(prefers-reduced-motion: reduce)` and allow zoom in metadata.
4. Remove only duplicate local easing declarations in components touched by other plans after their owners finish; do not perform a global search/replace across the app.

## Boundaries

- Do not change fonts, authentication, storage keys, backend code, or route destinations.
- Do not add another animation runtime or convert every motion import to LazyMotion without a measured bundle reason.
- Do not treat existing x/y/scale props alone as a defect.

## Verification

- `npx tsc --noEmit`; targeted ESLint on new provider/config and layout.
- Production `npm run build -- --webpack` after all plans are integrated.
- Check dark saved preference still loads and persists. Inspect reduced-motion branches and emulate if the supported browser controls permit it; disclose if only source-inspected.
- Done when all modified components share token names, root scroll respects the preference and normal pinch zoom is allowed.

All source changes must be reviewed against `/Users/prativ/.agents/skills/review-animations/SKILL.md`. Current official Motion documentation supports independent x/scale acceleration: do not mechanically rewrite shorthand props based on the older audit catalog. No frame-rate claim may be called measured without a trace. A live backend is not required for mechanical checks; report fixture-only verification clearly.
