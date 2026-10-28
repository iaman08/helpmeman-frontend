# 006 — Make repeated matching actions immediate and celebrations finite

- **Status**: IMPLEMENTED — see VERIFICATION.md for coverage and limits
- **Commit**: 49997ba
- **Working tree**: includes the existing uncommitted homepage/dark-mode work; preserve it.
- **Severity**: HIGH
- **Category**: Keyboard frequency / accessibility
- **Estimated scope**: SwipeArena, FilterSheet Toggle, MatchFoundModal, optional keyboard utility and focused node tests

## Problem

Keyboard arrows await a 320ms card throw and the document handler lacks editable-target/repeat guards. Filter toggles are clickable divs. Priority actions trigger infinite confetti and an icon entering from scale zero.

Current code from `/Users/prativ/dev/helpmeman-platform/frontend/components/matching/SwipeArena.tsx:131`:

```tsx
131:   // Keyboard navigation
132:   useEffect(() => {
133:     const handler = (e: KeyboardEvent) => {
134:       if (showFilters || matchedMentor) return;
135: 
136:       switch (e.key) {
137:         case "ArrowLeft":
138:           e.preventDefault();
139:           handleActionSwipe("skip");
140:           break;
141:         case "ArrowRight":
142:           e.preventDefault();
143:           handleActionSwipe("interested");
144:           break;
145:         case "ArrowUp":
146:           e.preventDefault();
147:           handleActionSwipe("priority");
148:           break;
```

## Target

Keep pointer drag physics and the existing swipe engine. Keyboard shortcuts execute the action immediately, bypassing throw animation. Ignore events from input/textarea/select/contenteditable controls, defaultPrevented events, repeats and unsupported modifier combinations; keep Ctrl/Meta+Z undo only outside editors. Pointer button actions can retain the existing card throw. A native button role=switch/aria-checked (or installed Base UI Switch) replaces click-only toggles; keyboard changes settle instantly, fine-pointer toggle thumb can transition transform160ms strong ease-out.

The priority modal uses a stable labelled, focus-managed shell where practical with existing Base UI, opacity + scale(.97) over240ms (150ms opacity only reduced). Eliminate infinite confetti; either one finite <=1200ms celebration with a small budget or a static priority acknowledgement. Never scale from0. Avoid calling any existing priority marking a guaranteed match or booking.

## Repo conventions to follow

Next.js 16.2.4 / React 19 / Tailwind 4. Read `/Users/prativ/dev/helpmeman-platform/frontend/AGENTS.md` and relevant local Next documentation before edits. Motion 12.38, Three 0.184 and Base UI 1.8 are installed. Keep the existing MSaans font, white/light and blue-charcoal/lavender dark palette, current routing and real mentor data. CSS modules sit beside their components. `components/landing/HeroSection.module.css` uses the intended strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; extend the shared tokens from plan 001. For Motion numeric easing use `[0.23, 1, 0.32, 1]`. Pointer press budget: 160ms, scale .97. Reduced motion keeps brief 150ms opacity feedback and drops positional movement.

## Steps

1. Separate keyboard action dispatch from the action-bar/gesture throw path in SwipeArena. Preserve current navigation and engine actions.
2. Add a small pure event-policy helper only if it makes input guards testable. Test actual helper policy for editable targets, modifiers, repeat, composition and arrows/undo; do not write source-string snapshot tests.
3. Replace only FilterSheet Toggle with a proper accessible native control and named labels; keep filter values and API identical.
4. Remove repeat:Infinity confetti and scale0 from MatchFoundModal, preserve explicit dismissal and destinations. Avoid any celebration for reduced motion.
5. Do not refactor SWR, scoring, swipe persistence or real backend operations.

## Boundaries

- Do not alter useSwipeEngine, API requests, mentor scoring or gesture velocity logic.
- Do not invent production mentors or seed live data for verification.
- If the live directory is empty, verify keyboard policy mechanically and report the missing live deck; never claim full gesture hardware testing.

## Verification

- Focused node tests for the event guard (if extracted), TypeScript and targeted ESLint.
- Check source ensures keyboard action calls do not await the animated ref path. Verify switch keyboard semantics on the real filter surface without submitting backend actions.
- Feel-check finite priority feedback with a real or controlled fixture when available; document lack of physical-device/backend coverage.
- Done when repeated keyboard use has no animation delay, editing is not intercepted and no priority overlay loops forever.

All source changes must be reviewed against `/Users/prativ/.agents/skills/review-animations/SKILL.md`. Current official Motion documentation supports independent x/scale acceleration: do not mechanically rewrite shorthand props based on the older audit catalog. No frame-rate claim may be called measured without a trace. A live backend is not required for mechanical checks; report fixture-only verification clearly.
