# HelpMeMan — visual and motion upgrade plan

**Prepared:** 27 October 2026 · **Base commit:** `49997ba` · **Mode:** research → verified audit → self-contained specifications → implementation → visual and mechanical verification.

This plan targets a visible improvement in the public experience while repairing the shared interactions that determine whether it feels professional. The user requested an autonomous research/plan/execution pass; the six items below are selected without another approval/selection round. Existing uncommitted work is the baseline, not something to reset. Implementation follows the audit phase using construction skills and disjoint file ownership; the audit itself has not modified product source.

## Direction

**Human guidance, visibly connected.** One memorable Three.js matching sequence shows a question finding its way to an experienced person. Clear typography, warm profile photography, compact trust content and stable reading surfaces give that sequence context. The product should feel calm, credible and quick. It should not feel like a gallery of unrelated animation demos.

- Keep the locally hosted MSaans family and the established charcoal/lavender direction. Core colors: paper `#FBFCFE`, ink `#151927`, night `#0D1018`, dark surface `#1A2130`, lavender `#9C94D1`, teal `#76AEA6`; warm gold is an existing small status accent, not a new primary color.
- Keep the requested phone below the heading and animated text. Use one stable headline footprint, one product explanation and one readable three-step control. Do not render text in a canvas.
- Make comparison data, prices, ratings, typing and repeated navigation steady. Spend the motion budget on explanation and state changes.
- Reduce the 135vh statistics interlude to a compact band. Present mentors before the long competitive comparison. Remove the competing infinite logo spectacle.

```
Desktop/mobile content order:
  navigation
  readable heading + primary actions
  question → Three.js connection paths + phone → experienced person
  compact trust band (all counts immediately visible)
  AI composer
  featured people
  comparison / outcomes / honest pricing navigation
  quiet institution wall / final CTA / footer
```

## Execution order and ownership

| Order | Plan | Priority | Status | Dependencies / owner |
| --- | --- | --- | --- | --- |
| 1 | [001 — Motion foundation](001-motion-foundation.md) | HIGH | IMPLEMENTED | Root: global tokens, MotionConfig, root reduced-scroll/zoom |
| 2 | [002 — Hero matching choreography](002-hero-matching-choreography.md) | HIGH | IMPLEMENTED | Hero executor; only hero/renderer modules; uses 001 tokens |
| 3 | [003 — Marketing rhythm](003-marketing-rhythm.md) | HIGH | IMPLEMENTED | Marketing executor; public section files + app/page.tsx |
| 4 | [004 — Public surfaces](004-accessible-public-surfaces.md) | MEDIUM | IMPLEMENTED | Interaction executor; navbar and dialog shells; navbar-only landing CSS |
| 5 | [005 — Sonner notifications](005-sonner-notifications.md) | MEDIUM | IMPLEMENTED | Root; one dependency install, preserve useToast API |
| 6 | [006 — Matching input modes](006-matching-input-modes.md) | HIGH | IMPLEMENTED | Root; bounded keyboard/toggle/priority-feedback repairs |

Plans 002–004 can run in parallel after their ownership is assigned. Only root installs dependencies or edits package metadata. Root owns global reduced-motion CSS; the navigation executor owns navbar-specific rules in the same stylesheet and must preserve the other region. No commits, backend changes, deployments, payment/booking actions, or account creation are part of this work.

## Vetted audit

Findings cite the baseline before this execution. Sources were re-read to confirm the selected findings; performance risks are not presented as measured frame drops.

| # | Severity | Category | Location | Finding | Fix summary |
| --- | --- | --- | --- | --- | --- |
| 1 | HIGH | Accessibility | `components/landing/HeroPhoneDemo.tsx:40,79` | A timed phase hides the focusable profile link; no focus-within pause | Pause progression during focus/reading and keep targets stable (002) |
| 2 | HIGH | Accessibility / performance | `components/landing/FloatingStatsSection.tsx:221,348,393` | JS logo motion ignores reduced motion, still schedules frames offscreen, and three counts occupy 135vh | Replace the spectacle with a readable compact band (003) |
| 3 | HIGH | Keyboard frequency | `components/landing/ServicesSection.tsx:373,478,555` | Filtering can mount returning results with up to 400ms delay + 400ms entrance | Immediate results; remove motion from repeated search changes (003) |
| 4 | HIGH | Keyboard frequency | `components/matching/SwipeArena.tsx:111,136`; `MentorSwipeCard.tsx:163` | Keyboard arrows await the same 320ms throw as pointer actions, with no editor/repeat guard | Immediate keyboard path and tested input policy (006) |
| 5 | HIGH | Accessibility | `components/matching/FilterSheet.tsx:313` | Four filter toggles are click-only divs | Native accessible switches with unchanged filter API (006) |
| 6 | MEDIUM | Lifecycle | `components/landing/FloatingLogosSection.tsx:532,561` | Infinite rows ignore current visibility/reduced motion and repeat accessible content four times | Quiet unique static wall (003) |
| 7 | MEDIUM | Layout / cohesion | `app/landing.css:138,153`; `LandingNavbar.tsx:112` | Capsule width/top and scroll CTA width animate in parallel | Stable dimensions and restrained transform/opacity change (004) |
| 8 | MEDIUM | Accessibility / interruption | `LandingNavbar.tsx:61,144` | Explicit smooth scrolling ignores user preference; mobile menu disappears instantly and lacks robust focus/dismiss semantics | Base UI popover and preference-aware native navigation (004) |
| 9 | MEDIUM | Modal lifecycle | `components/AuthModal.tsx:94,236` | Early return removes AnimatePresence before exit; shell lacks managed focus | Controlled Base UI shell, preserve all auth logic (004) |
| 10 | MEDIUM | Accessibility | `components/ProfileCard.tsx:205`; `ConfirmModal.tsx:55` | Lightbox/confirm focus is not trapped and reliably restored | Accessible modal primitives, labels, busy semantics (004) |
| 11 | MEDIUM | Feedback / lifecycle | `components/Toast.tsx:39,52,77` | Custom timers do not pause for reading and notifications/dismiss controls lack accessible semantics | Sonner behind the unchanged useToast interface (005) |
| 12 | MEDIUM | Repetition / physicality | `components/matching/MatchFoundModal.tsx:32,80,122` | Repeated priority actions produce infinite confetti and a scale-zero star | Finite or static acknowledgement, no scale-zero entrance (006) |
| 13 | LOW | Cohesion | Hero, AI and ProfileCard CSS module token declarations | Same intended easing duplicated with mixed legacy conventions elsewhere | Shared motion policy, only migrate touched surfaces (001) |
| 14 | Product-flow prerequisite | Action integrity | `components/landing/PricingSection.tsx:153` | Tier CTAs are buttons with no action | Real, honestly labelled directory navigation; no invented booking flow (003) |

### Additive opportunities

1. Synchronise the Three.js visual with the existing ask/match/connect phase; communicate a relationship rather than ambient orbiting alone.
2. Let a mobile navigation surface emerge from its trigger and reverse smoothly when interrupted.
3. Make real success/error notifications readable and dismissible with a maintained stack rather than hand-written timer/reflow logic.

### Deliberate exclusions

- Keep the finite hero playback, pause/replay, static WebGL fallback, stable profile statistics, and existing dark palette.
- No automatic count-up prices, cursor-following profile cards, perpetual phone bobbing, full-page particles, or keyboard-delayed navigation.
- No blanket conversion of Motion x/y/scale props. Current official Motion documentation says independent transforms can be hardware accelerated; the older audit playbook's categorical claim is outdated. Actual layout-triggering properties and observed behavior determine findings. [Motion performance](https://motion.dev/docs/performance).
- Sidebar width/content reflow is a known layout constraint; defer that separate dashboard redesign rather than blindly replacing it with overlays.
- Unreferenced legacy hero/logo components are not counted as active homepage defects. Broad admin/dashboard/onboarding restyling and unfinished backend data are outside this visual pass.

## Research and installation decisions

| Tool / library / skill | Decision | Reason and primary source |
| --- | --- | --- |
| Motion 12.38 | Keep; configure centrally | Installed and sufficient for interruption, state transitions and gesture springs. Site-wide reduced-motion policy defaults to never unless configured. [MotionConfig](https://motion.dev/docs/react-motion-config) |
| Three.js 0.184 | Keep; improve the original scene | One bounded renderer is sufficient. Preserve disposal and render only while useful. [Renderer](https://threejs.org/docs/pages/WebGLRenderer), [rendering on demand](https://threejs.org/manual/pages/rendering-on-demand.html) |
| React Three Fiber / Drei | Keep installed; no migration | Useful for future complex declarative scenes, not a reason to rewrite this small renderer. [Performance guide](https://r3f.docs.pmnd.rs/advanced/scaling-performance) |
| Base UI 1.8 | Use existing dependency | Accessible popup/dialog states support interruptible CSS and controlled lifecycle. Read local installed types because current online docs may be newer. [Animation guide](https://base-ui.com/react/handbook/animation) |
| Sonner | **Add one runtime dependency** | Bounded replacement for a fragile custom notification stack. Upstream inspected version is 2.0.8; confirm the published registry version before installation. [Official package metadata](https://raw.githubusercontent.com/emilkowalski/sonner/main/package.json), [source](https://github.com/emilkowalski/sonner) |
| GSAP / ScrollTrigger | Do not add | No complex pinned timeline requires another sequencing model. [Official React guide](https://gsap.com/resources/React/) |
| Lenis | Do not add | Native scroll suits the product; smooth-scroll interception would add integration and accessibility work. [Maintainer repository](https://github.com/darkroomengineering/lenis) |
| Magic UI | Research/reference only | Selective connection-beam ideas are relevant; bulk effects are not a design system. Do not run shadcn init over the configured app. [Animated Beam](https://magicui.design/docs/components/animated-beam), [installation](https://magicui.design/docs/installation) |
| Aceternity | Research/reference only | Its exact Wispr text reference uses SVG/Motion. No premium implementation is needed or copied. [Wispr Flow text animation](https://ui.aceternity.com/labs/wispr-flow-text-animation) |
| React Bits | Research/reference only | Good effect explorations; avoid another background system and inspect component-specific licensing before any future import. [Official introduction](https://www.reactbits.dev/get-started/introduction), [Silk](https://www.reactbits.dev/backgrounds/silk) |
| Torph / NumberFlow | Do not add now | No functional text morph or live numeric ticker requires them. The heading stays in the DOM and comparison data stays still. [Torph](https://torph.lochie.me/), [NumberFlow](https://number-flow.barvian.me/) |
| Vercel web-design-guidelines skill | **Install** | Adds a focused interface QA checklist to the existing taste skills. [Publisher source](https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/web-design-guidelines/SKILL.md), [current rules](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) |
| Vercel react-best-practices skill | **Install** | Adds performance/bundle/event-lifecycle review guidance relevant to deferred WebGL and a large React app. [Publisher source](https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/SKILL.md) |
| Anthropic frontend-design skill | Reviewed; do not add redundantly | Useful compositional guidance, but overlaps the installed Emil/Apple design skills and must not override the user's established direction. [Publisher source](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md) |
| Existing animate, apple-design, mobile-native, review-animations, ask-sonner, break-ui | Reuse as applicable | Construction, restraint, mobile behavior, final review and worst-case checks are already available locally. No reinstall needed. |
| Figma plugins/skills | Not required for this pass | No Figma file or source design system was supplied. An external account connection is not a prerequisite to completing the work. |

The official OpenAI curated skill catalog was checked through the installer helper. It primarily offered integration/workflow skills here; the two Vercel publisher skills fill the clearer gaps. Skill installations must retain supporting references/license files and use the official installer. Newly installed skills become available for normal discovery on the next turn; their reviewed guidance can still inform this research and verification.

## Verification and completion gates

1. Review each executor diff for scope, duplicated animation systems, focus safety, lifecycle cleanup and theme consistency. Preserve unrelated working-tree edits.
2. Run focused keyboard-policy tests, existing onboarding-routing tests, targeted ESLint and TypeScript. Build once after integration with `npm run build -- --webpack`; repeat only after a relevant new fix.
3. Prefer a clean production preview when the existing dev server has stale hot-reload state. Request sandbox elevation only if opening the localhost port requires it. Do not deploy.
4. Inspect light and dark layouts at 320px, 390px and desktop. Check long names, prices and existing card content. Native zoom must remain possible.
5. Exercise hero pause/replay, focus pause, finite completion, route/theme persistence, nav Escape/outside dismiss, auth and avatar dialog Tab/Shift+Tab/return focus, real pricing destinations, and representative toast behavior when a harmless available flow can trigger it.
6. Inspect every CSS/JS/WebGL reduced-motion path. Use supported browser emulation if offered; otherwise record source-only coverage. Do not change the user's OS settings just to simulate a test.
7. Review the renderer at slow playback/source timings and inspect browser diagnostics. FPS limits and DOM costs are budgets, not claimed measured performance. No fake live mentors/bookings or real authentication submissions for testing.
8. Record completed plans and exact remaining limitations, save screenshots, and leave a working preview plus this research plan. Physical-device gesture testing and backend-dependent matching remain explicit limits if unavailable.

## Change control

If a source excerpt has drifted, compare the current implementation and preserve user intent; ask only for a genuine incompatible requirement, destructive action or external dependency that cannot be resolved. This plan does not promise zero review: the point is to perform the review within execution rather than make the user manage a sequence of small approvals.


## Execution result — 27 October 2026

All six specifications are implemented. Read [verification and final motion review](VERIFICATION.md) for exact checks, scope, and remaining coverage limits. Production preview: [127.0.0.1:3001](http://127.0.0.1:3001/).

Installed runtime dependency: **Sonner 2.0.8**, pinned. Installed publisher skills: `/Users/prativ/.codex/skills/web-design-guidelines` and `/Users/prativ/.codex/skills/react-best-practices`. Existing Three.js, Motion, and Base UI were reused. No bulk effects library or second scroll/animation engine was added.


## Follow-up correction

| Plan | Priority | Status |
| --- | --- | --- |
| [007 — Restore phone composition and smooth orbit](007-restore-phone-composition.md) | HIGH | DONE |

User prefers the earlier phone artwork. This correction supersedes plan002’s boxed annotations and routed-beam composition only.


## Typography follow-up

| Plan | Priority | Status |
| --- | --- | --- |
| [008 — Cohesive public typography](008-cohesive-typography.md) | HIGH | DONE |
