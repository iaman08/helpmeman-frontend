# 002 — Turn the hero into a deliberate Three.js matching story

- **Status**: IMPLEMENTED — see VERIFICATION.md for coverage and limits
- **Commit**: 49997ba
- **Working tree**: includes the existing uncommitted homepage/dark-mode work; preserve it.
- **Severity**: HIGH
- **Category**: Explanation / accessibility / lifecycle
- **Estimated scope**: HeroSection, HeroPhoneDemo, MentorOrbit and their CSS modules

## Problem

The scene is a decorative set of unrelated rings; it receives no ask/match/connect phase. The timed preview can hide its focused Explore mentors link when a new example starts. The hero is tall on desktop and its side annotations are spatially disconnected from the animation.

Current code from `/Users/prativ/dev/helpmeman-platform/frontend/components/landing/HeroPhoneDemo.tsx:38`:

```tsx
38:   }, [exampleIndex, onExampleChange]);
39:
40:   useEffect(() => {
41:     if (reduceMotion || !playing || !inView || !pageVisible) return;
42:     const timer = window.setTimeout(() => {
43:       if (step === 8) setPlaying(false);
44:       else setStep((value) => value + 1);
45:     }, [1100, 1000, 3200][phase]);
46:     return () => window.clearTimeout(timer);
47:   }, [step, phase, playing, inView, pageVisible, reduceMotion]);
48:
49:   return (
```

## Target

Keep the finite examples and DOM-readable phone. Pass `phase:0|1|2` and `exampleIndex` into MentorOrbit. Build an original, lightweight Three.js connection-path composition: three curved paths share an origin/question side and branch toward expertise/people. One path becomes the selected connection during phase 2. Use existing lavender, teal and warm gold accents; no copied premium registry source or external textures. Suggested geometry: three CatmullRomCurve3/TubeGeometry routes (64 longitudinal segments, 4 radial segments, radius .012–.018), three small travelling points with soft low-opacity halos. Phase 0: paths faintly present; phase 1: controlled travelling signal; phase 2: one clear route and endpoints settle. Shader interpolation or ref-driven transforms/opacity should update outside React rendering. Maintain max 30fps, DPR <=1.5, one canvas, lazy load near viewport, no idle loop when paused/hidden/offscreen, and CSS/SVG fallback when unsupported or reduced motion.

Use a 240ms strong ease-out for DOM state changes; 150ms opacity-only reduced variant. Keep current phase holds 1100/1000/3200ms unless a rendered feel-check demonstrates a documented need; never delay a real action. Freeze automatic phase progression whenever focus is inside the preview or pause/play controls; do not automatically resume after explicit user pause. Pause on pointer hover while reading the preview. Keyboard-triggered replay/selection changes settle without a positional reveal. Keep all interactive targets stable while focused. Desktop phone width 284–300px, header type max 76px, stage gap 28–36px; reduce excess vertical space while keeping the requested phone below the heading.

## Repo conventions to follow

Next.js 16.2.4 / React 19 / Tailwind 4. Read `/Users/prativ/dev/helpmeman-platform/frontend/AGENTS.md` and relevant local Next documentation before edits. Motion 12.38, Three 0.184 and Base UI 1.8 are installed. Keep the existing MSaans font, white/light and blue-charcoal/lavender dark palette, current routing and real mentor data. CSS modules sit beside their components. `components/landing/HeroSection.module.css` uses the intended strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; extend the shared tokens from plan 001. For Motion numeric easing use `[0.23, 1, 0.32, 1]`. Pointer press budget: 160ms, scale .97. Reduced motion keeps brief 150ms opacity feedback and drops positional movement.

## Steps

1. Extract or type the preview phase model so the DOM and renderer receive the same values. Keep the existing examples and links.
2. Add focus-within and hover pause tracking; treat relatedTarget within the whole demo as internal navigation. Ensure play/replay control cannot unmount while focused.
3. Replace the ring-only composition with original three-dimensional connection paths. Interpolate toward phase targets, with pointer depth capped at <=.09 radians horizontally and <=.06 vertically on fine pointers only.
4. Preserve resource cleanup, context-loss fallback, theme updates, finite completion, and lazy loading. Keep text and the phone outside WebGL.
5. Refine the phone-stage annotations, spacing and step control; keep labels sentence case and use numbers only for the actual three-step sequence. Do not move the phone text for decorative tilt.

## Boundaries

- Own only hero/renderer files and newly needed colocated hero modules. Do not edit globals, layout, package files, auth, profile stats or backend.
- No GSAP/Lenis/R3F migration, postprocessing stack, model/texture downloads, full-page particle field, custom cursor or perpetual phone bobbing.
- Preserve explicit user-selected dark palette and existing dashboard/pricing routes.

## Verification

- Targeted typecheck/lint. Review both themes at 320/390px and desktop.
- Observe a full ask→match→connect cycle; pause/replay; keyboard Tab into the preview and wait longer than a phase; verify the focused link stays visible.
- Scroll out, hide/show the tab, and verify renderer data-running stops/resumes without duplicate canvases. Inspect cleanup and context loss; force fallback only through supported testing controls.
- Feel-check phase transitions at 2–5x duration during development or the browser animation inspector; remove test timing afterward. Confirm the path is visible enough to explain the connection without competing with text.
- Done when the signature scene visibly follows the product sequence and the preview cannot take focus away.

All source changes must be reviewed against `/Users/prativ/.agents/skills/review-animations/SKILL.md`. Current official Motion documentation supports independent x/scale acceleration: do not mechanically rewrite shorthand props based on the older audit catalog. No frame-rate claim may be called measured without a trace. A live backend is not required for mechanical checks; report fixture-only verification clearly.
