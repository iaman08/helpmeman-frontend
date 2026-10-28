# 004 — Make navigation and public dialogs feel precise and remain keyboard-safe

- **Status**: IMPLEMENTED — see VERIFICATION.md for coverage and limits
- **Commit**: 49997ba
- **Working tree**: includes the existing uncommitted homepage/dark-mode work; preserve it.
- **Severity**: MEDIUM
- **Category**: Interruptibility / origin / accessibility
- **Estimated scope**: LandingNavbar, AuthModal shell, ProfileCard lightbox, ConfirmModal shell, new CSS modules; navbar-only landing.css rules

## Problem

The navbar animates width/top on scroll and uses an entrance-only mobile panel. Auth returns before its AnimatePresence so exits cannot play. Public lightboxes/dialogs need reliable focus trapping, Escape, labelling and return focus.

Current code from `/Users/prativ/dev/helpmeman-platform/frontend/components/landing/LandingNavbar.tsx:109`:

```tsx
109:           <AnimatePresence>
110:             {!isLoggedIn && scrolled && (
111:               <motion.div
112:                 initial={{ opacity: 0, scale: 0.9, width: 0 }}
113:                 animate={{ opacity: 1, scale: 1, width: "auto" }}
114:                 exit={{ opacity: 0, scale: 0.9, width: 0 }}
115:                 transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
116:                 className="overflow-hidden flex items-center"
117:               >
118:                 <Link
119:                   href="/?auth=signup"
120:                   className="text-[13px] font-semibold text-white dark:text-black bg-[#141414] dark:bg-[#f4f4f5] px-4 py-1.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all no-underline whitespace-nowrap shadow-sm inline-block"
121:                 >
122:                   Join for free
123:                 </Link>
124:               </motion.div>
125:             )}
126:           </AnimatePresence>
```

## Target

Use the installed Base UI Popover for the mobile navigation panel and Dialog/AlertDialog for public modal shells. Keep all existing business logic, props and form markup. Base UI `[data-starting-style]` / `[data-ending-style]` transitions: popover opacity + scale(.97), 180ms strong ease-out, `transform-origin:var(--transform-origin)`; dialog opacity + scale(.97), 240ms, centered origin; reduced motion 150ms opacity only. Close should reverse naturally and remain rendered until transition completion. Use native accessible triggers with aria-expanded/controls where appropriate, 44px touch targets and visible focus. Preserve nested two-factor behavior and busy-state dismissal rules.

Navbar capsule width remains stable at `min(92%,860px)` across scroll; translateY(0→-4px) and opacity-only shadow overlay may respond in 200ms. Never animate top, width or max-width. Guest CTA reserves its slot or remains a stable navigation action; no width 0→auto. Native anchor/link navigation must respect reduced motion; no keyboard-triggered smooth movement. CSS placement uses safe-area top inset where needed.

## Repo conventions to follow

Next.js 16.2.4 / React 19 / Tailwind 4. Read `/Users/prativ/dev/helpmeman-platform/frontend/AGENTS.md` and relevant local Next documentation before edits. Motion 12.38, Three 0.184 and Base UI 1.8 are installed. Keep the existing MSaans font, white/light and blue-charcoal/lavender dark palette, current routing and real mentor data. CSS modules sit beside their components. `components/landing/HeroSection.module.css` uses the intended strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; extend the shared tokens from plan 001. For Motion numeric easing use `[0.23, 1, 0.32, 1]`. Pointer press budget: 160ms, scale .97. Reduced motion keeps brief 150ms opacity feedback and drops positional movement.

## Steps

1. Read local Base UI declaration files before wiring actual installed APIs; the online docs may be newer than 1.8.
2. Replace the mobile conditional panel with a controlled Base UI Popover, keeping the menu's existing destinations and support handler. Close on Escape/outside interaction and restore trigger focus.
3. Remove navbar layout animation in its CSS and CTA. Ensure only the navbar rules in app/landing.css change; coordinate with root owner of reduced-motion rules.
4. Convert AuthModal's outer shell to a persistent controlled Base UI Dialog without moving the authentication handlers, request payloads or routing policies. TwoFactorModal must not be inadvertently unmounted or focus-trapped behind the auth shell.
5. Convert the profile photo lightbox and ConfirmModal shells to accessible Base UI primitives, labelled titles, named dismiss controls, correct initial/return focus, sensible disabled/busy behavior and interruptible close transitions.

## Boundaries

- Do not change login/signup/OTP/passkey endpoints or business validation, role routing, auth-context, mentor data, or card layout.
- Do not replace the existing theme provider, implement a custom focus trap, or add a second UI primitive package.
- Use colocated CSS; avoid blanket changes to all modal classes. Confirm destructive actions continue to require existing user actions.

## Verification

- Typecheck, targeted ESLint and existing `npm run test:onboarding`.
- Browser: mobile nav open/close rapidly; Escape/outside close; correct focus return. Keyboard navigation must not trigger a positional animation.
- Open auth and profile photo dialogs without submitting credentials. Tab/Shift+Tab remain inside; Escape closes; focus returns. Closing during entry must not jump. Confirm busy state does not dismiss incorrectly.
- Inspect reduced-motion paths and exercise supported emulation if available.
- Done when no public surface loses focus and navbar scrolling changes no layout dimensions.

All source changes must be reviewed against `/Users/prativ/.agents/skills/review-animations/SKILL.md`. Current official Motion documentation supports independent x/scale acceleration: do not mechanically rewrite shorthand props based on the older audit catalog. No frame-rate claim may be called measured without a trace. A live backend is not required for mechanical checks; report fixture-only verification clearly.
