# Homepage and mentor card revamp

Implemented the three areas from the supplied design feedback. The phone is a clearly labelled product preview using existing featured profiles, with links to the real mentor directory. Existing dashboard destinations and the pricing link remain intact.

## Visual review

| Before | After | Why |
| --- | --- | --- |
| Hero typewriter deletes letters and changes headline width; logo stack has no product context | Stable headline footprint, synchronised example questions, phone preview underneath | Explain the product and preserve readable text |
| Neutral request rectangle with a shallow shadow | Blue, lavender, rose and warm gold stroke; soft shadows offset downward; clear focus outline | Give the primary task a distinct visual home |
| Edge-to-edge banner, many separate metadata rows and fixed five-star decoration | Inset rounded banner, overlapping avatar, organisation pill, actual numeric rating, price and duration, full-width profile action | Use the reference's hierarchy while retaining real profile data |
| Card grid enters on scroll with a long stagger | Readable immediately, without positional entrances | People should be able to scan profiles without waiting |

## Animation opportunities

Scope: homepage hero, request composer, featured cards, and shared profile cards. Next.js 16 / React 19; Motion is already installed. Existing page animations use mixed values, so the revised components use the skill's strong ease-out curve consistently. No new motion package was installed.

| # | Location | Today | Purpose | Frequency | Suggested motion |
| --- | --- | --- | --- | --- | --- |
| 1 | `components/landing/HeroSection.module.css:54`, `components/landing/HeroPhoneDemo.tsx:67` | Headline has no stable product demonstration in the original design | Explanation | Rare / first visit | Headline opacity 0→1 and translateY(30%)→0; preview opacity .18→1 and translateY(5px)→0. Both 240ms, cubic-bezier(0.23, 1, 0.32, 1). Holds of 1100ms / 1000ms / 3200ms describe ask / match / connect. Three examples, then stop. Pause/replay available; pause offscreen and while the document is hidden. Reduced motion renders the first example fully settled and omits automatic playback. |
| 2 | `components/landing/HeroSection.module.css:110`, `components/landing/AIDemoSection.module.css:43`, `components/ProfileCard.module.css` | Inconsistent press and hover feedback | Feedback | Tens/day | Pointer press scale(1)→scale(.97), transform 160ms cubic-bezier(0.23, 1, 0.32, 1). Focus-visible interactions do not scale; reduced motion removes scale. Hover opacity .8–.85 over 150–160ms ease, gated by (hover: hover) and (pointer: fine). |
| 3 | `components/landing/AIDemoSection.tsx:363` | Match cards move up on entry and hover while the reader is comparing them | Preventing a jarring change | Occasional search | Opacity 0→1 over 180ms, cubic-bezier(0.23, 1, 0.32, 1), with no positional movement or hover translation. Reduced-motion users retain the gentle fade. |

## Rejected candidates

- `components/landing/AIDemoSection.tsx:223` — animated placeholder, caret, or composer surface. Rejected by function: this is the area users type into. Keep the border, text and focus outline steady.
- `components/ProfileCard.module.css:221` — rating/price/duration count-ups. Rejected by function: the numbers are comparison data and must be immediately readable.
- `components/landing/FeaturedMentorsSection.tsx` — staggered card reveals and hover lifts. Rejected by frequency/function: browsing is repeated, and moving cards add delay to scanning.
- `components/landing/HeroSection.module.css` — perpetual phone bobbing and animated background glow. Rejected by purpose: movement would add no explanation beyond the actual preview sequence.

## Verdict

These areas benefit from a single explanatory sequence and subtle pointer feedback. The phone preview is the highest-leverage opportunity because it shows how a question leads to relevant human expertise. The selected recipes were handed to the animate skill and implemented in this revamp. For a future focused extension, the planning handoff is `improve-animations plan <suggestion>`.

## Validation

- `npx tsc --noEmit`: passed.
- ESLint on the five changed TSX components: zero errors; seven standard next/image warnings from image tags.
- `npm run build -- --webpack`: passed, including TypeScript and generation of 72 pages. The default Turbopack build stalled without diagnostics and was stopped before the successful Webpack build.
- Browser checks: desktop, 390px and 320px mobile widths, light/dark appearance, phone pause control, finite playback, non-empty and empty search button validation, featured card layout.
- Reduced-motion paths inspected in source; no physical-device or OS reduced-motion test was performed.
- The live mentor directory returned zero mentors during this session; card visuals were verified with the existing featured profiles. No live AI search was submitted.
- Wispr reference: https://wisprflow.ai/ . Used as a direction for explanatory product presentation; implementation uses this app's existing content and assets.

## Follow-up: dark mode and subtle 3D

| Before | After | Why |
| --- | --- | --- |
| Near-black marketing sections with a bright phone display | Blue-charcoal page, matching dark phone, layered cards and restrained lavender accents | Make the preview feel like part of the dark interface |
| Saved theme restored by effects after the initial light render | Small head bootstrap and a DOM-backed React external store; one theme owner | Apply the saved preference before paint and avoid route effects resetting it |
| Static glow behind the phone | Three.js orbital paths with three small travelling points and damped pointer response | Add a little depth to the first-visit product explanation |
| Input focus outline only | Soft 200ms opacity increase on the existing glow, plus a clear outline | Indicate focus without moving the writing surface |

Library choice: Motion remains the curated pick for interface transitions. The custom orbital scene is outside pick-ui-library's curated tasks; it uses the already-installed Three.js package. The existing theme implementation was repaired instead of adding next-themes or replacing the app's theme consumers. No dependencies were added.

Vocabulary: **Orbit** — An element circling around another in a continuous path. **3D tilt / Flip** — Rotate in 3D space (rotateX / rotateY) to add depth. This implementation tilts the background paths slightly; it does not move the readable phone content.

Motion gate: rare marketing surface; explanation and restrained delight. No new motion was added to profile statistics, navigation, or typed text. The orbit follows the finite phone preview's pause/replay state, stops offscreen and in hidden tabs, and renders at a maximum of 30fps with pixel ratio capped at 1.5. Reduced-motion users receive static CSS paths without loading WebGL. Failed loading or an unavailable/lost WebGL context leaves the same static fallback in place.

The renderer uses `setAnimationLoop`; geometries, materials and the renderer are disposed on teardown, following the [Three.js renderer documentation](https://threejs.org/docs/pages/WebGLRenderer) and [cleanup guidance](https://threejs.org/manual/pages/cleanup.html).

Validation: production Webpack build passed (72 pages), TypeScript passed, new renderer/theme code linted with zero errors or warnings. Existing phone/AI image tags retain four next/image warnings. Browser checks confirmed a live WebGL canvas, pause/replay, automatic completion, offscreen pause, saved dark theme after production reload, dark composer/cards, and no horizontal overflow at 320px/390px viewport widths. Reduced-motion and context-loss paths were inspected in source; they were not forced through browser emulation. The local dev server logged a CSS hot-reload error during checks, so the final theme/reload/scene checks were repeated successfully against a clean production preview on port 3001. No Three.js or hydration errors were found in the browser diagnostics examined.

A final 320px visual check found a wrapped currency value. Profile cards now use a container query below 300px card width to stack each stat's icon, value and label. The rebuilt production preview confirmed the full ₹499.00 value and each label fit, with no horizontal overflow. The final production build passed again after this adjustment.
