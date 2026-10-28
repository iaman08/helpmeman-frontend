# 007 — Restore the earlier phone composition and remove uneven motion

- **Status**: DONE
- **Commit**: 49997ba (existing uncommitted hero is the source baseline)
- **Severity**: HIGH
- **Category**: Performance / cohesion / interruptibility
- **Scope**: HeroPhoneDemo.tsx, HeroSection.module.css, MentorOrbit.tsx and MentorOrbit.module.css only.

## Vetted findings

| # | Severity | Category | Location | Finding | Fix summary |
| --- | --- | --- | --- | --- | --- |
| 1 | HIGH | Performance | components/landing/MentorOrbit.tsx:101 | `if (!force && lastFrame && time - lastFrame < 1000 / 30) return;` skips refresh frames and can produce uneven cadence on displays whose timestamps straddle the threshold. User reports choppiness; measured FPS is not available. | Remove frame skipping and simplify the scene so each browser animation frame renders minimal geometry. |
| 2 | MEDIUM | Interruptibility | components/landing/HeroPhoneDemo.tsx:35–36,63–65,81 | The same advancing flag stops explanatory content AND decorative rendering whenever hover crosses the side annotations. | Pause reading content on hover/focus; keep the gentle decorative orbit independent of hover, while respecting explicit Pause, reading-link keyboard focus, viewport, hidden page, finite completion and reduced motion. Never reset orbit position on pause/resume. |
| 3 | HIGH | Cohesion | components/landing/HeroPhoneDemo.tsx:83–87,112–126; HeroSection.module.css:408–546 | Boxed question and three mentor panels replace the user's preferred quieter editorial composition. | Restore simple annotations, overlapping avatars and hand-drawn arrows from the saved earlier screenshot. |

## Reference

Inspect `/tmp/helpmeman-revamp/dark-homepage.png` and `/tmp/helpmeman-revamp/phone-preview.png`. These are the actual earlier design, not a new concept. Main traits: centered 284px phone; left small rounded sparkle icon, title “Your question.”, description “In your own words.” and curved arrow; right overlapping three avatars, title “Someone who gets it.”, description “Real experience. Human advice.” and curved arrow. Thin tilted elliptical orbit close behind the phone. Current top-level heading, navigation, trust band, cards and other work must remain unchanged.

## Target and implementation

1. Restore that composition in HeroPhoneDemo and its CSS. Remove box/chip/query repetition outside the phone. Use existing examples, images, Next Image and local fonts. Decorative annotations are aria-hidden. Keep directory CTA always available and phase controls accessible. Restore phone greeting “Let’s figure out your next step.” and small “A LITTLE CLARITY STARTS HERE” eyebrow, restrained profile card detail/footer similar to reference. Keep stable phone size and fixed card footprint.
2. Replace the route/tube renderer with three delicate static elliptical tracks and a few small traveling light points. Use Three.js LineLoop/BufferGeometry and MeshBasicMaterial, no lights, bloom, postprocessing, TubeGeometry rebuilding, DOM anchor measurement, pointer tracking, React frame state, or full-scene rotation. Keep tracks stationary so nothing visually slides under the phone. Existing Three.js only, no dependencies.
3. Render every browser frame while playing. Advance point angle by actual elapsed delta; cap delta at 0.05 seconds after interruptions. Slow constant linear circuit (18/22/26 seconds) is appropriate to decorative motion. Angles persist across Pause and reading stops. No `1000 / 30` threshold. DPR max 1.5; set renderer dimensions only on ResizeObserver, not per frame. Maintain lazy import, theme response, cleanup, disposal and context-loss fallback.
4. Separate orbitRunning from advancing: orbitRunning = playing && !focusWithin && inView && pageVisible && !reduceMotion. Scope focusWithin to the phone reading surface, excluding playback controls so clicking Play actually resumes. Content advancing can still pause on phone hover. Remove hover reading handlers from decorative annotations. Manual phase selection stops playing and therefore orbit. Explicit pause/resume must remain immediate; do not restart timeline angle or reset points. Finite completion must stop rendering. Viewport/visibility stops also stop rendering.
5. Retain a static SVG ellipse fallback with no animated movement for reduced motion or unsupported WebGL. Both themes must have subtle visible tracks and points. At <=760px hide editorial side annotations as before; keep orbit confined behind phone without horizontal overflow. No phone bobbing or pointer tilt.
6. Existing shared transition tokens remain: `--ease-out: cubic-bezier(0.23,1,0.32,1)`, dialog240ms, feedback150ms, press160ms. Do not animate text/layout or change unrelated global tokens. Reduced motion uses static geometry and existing150ms opacity feedback.

## Boundaries

- Work in an isolated Git worktree, copying the four current dirty source files as the implementation baseline before editing; base commit alone lacks this work. Use main node_modules via a symlink if needed. Do not install anything or copy secrets.
- Read applicable AGENTS.md and local Next client directive docs before editing.
- Do not change auth, cards, page order, top hero heading, package metadata or backend behavior.
- Return the four edited file paths and verification results. Do not merge/commit.

## Verification

- `npx tsc --noEmit` and targeted `npx eslint components/landing/HeroPhoneDemo.tsx components/landing/MentorOrbit.tsx` should pass in main after integration.
- Root integrates only the four owned files, reviews the diff, rebuilds production, and checks the updated preview at desktop and390px in light/dark.
- Feel check: view for a complete phase cycle, confirm thin orbit points move continuously without stepping at30fps, annotations stay still, moving pointer across side artwork does not stop it, hovering phone pauses readable content, explicit Pause freezes points, resuming continues at same position, finite completion stops.
- Reduced-motion/lifecycle checks must retain no active renderer when reduced, hidden or outside viewport. No measured smoothness/FPS claim without instrumentation. Capture screenshot alongside the earlier image.
- Done when earlier visual character is restored and the avoidable frame skipping/hover renderer restart are removed; root reports actual remaining device-testing limits.


## Execution and review result

Implemented in isolated worktree `/private/tmp/helpmeman-phone-motion-007`, then integrated only the four scoped hero files into main. No dependency changes. Pre-correction source backup retained at `/private/tmp/helpmeman-phone-007-baseline`.

| Before | After | Why |
| --- | --- | --- |
| `1000 / 30` frame-skip threshold | One lightweight render per browser animation frame, delta-capped at0.05s | Removes deliberate stepping and uneven threshold cadence |
| Tube routes and cursor parallax | Three stationary LineLoop ellipses with small points on18/22/26-second linear circuits | Restores the earlier visual character and lowers scene complexity |
| Hover pauses both content and renderer | Hover pauses content only; explicit Pause, reading-link focus, visibility and finite completion stop renderer | Avoids incidental hover stop/start without sacrificing pause control |
| Focus anywhere in demo blocks Play | Focus pause scoped to phone reading surface | Play now starts while its own button retains focus |
| Four large side panels | Unboxed labels, arrows and overlapping avatars | Restores the user's preferred quieter composition |

**Verdict: Approve.** Targeted ESLint, TypeScript, production build (72 pages), and diff whitespace check pass. Browser verified desktop light/dark and390px mobile; no horizontal overflow observed. Play with button focus reports `running=true`; explicit Pause reports `running=false`; phone hover pauses content while orbit reports `running=true`; focusing directory link reports `running=false`. Renderer initialized one canvas successfully. Screenshot evidence: `/tmp/helpmeman-revamp/restored-phone-dark.png` and `/tmp/helpmeman-revamp/restored-phone-mobile-dark.png`. Browser viewport override reset. Preview refreshed at http://127.0.0.1:3001/.

The earlier boxed-path approval in VERIFICATION.md is superseded for these four hero files. Source inspection confirms preserved angle state across pause/resume, cleanup, reduced-motion static fallback and hidden/out-of-view gating. No FPS benchmark or physical-device smoothness certification is claimed.
