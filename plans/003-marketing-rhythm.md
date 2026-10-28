# 003 — Give the homepage quieter trust content and a stronger visual hierarchy

- **Status**: IMPLEMENTED — see VERIFICATION.md for coverage and limits
- **Commit**: 49997ba
- **Working tree**: includes the existing uncommitted homepage/dark-mode work; preserve it.
- **Severity**: HIGH
- **Category**: Purpose / performance / visual cohesion
- **Estimated scope**: FloatingStatsSection, FloatingLogosSection, PricingSection, ServicesSection, app/page.tsx, new colocated marketing CSS

## Problem

Three counts currently consume a 135vh sticky section while logo physics continue scheduling frames offscreen and ignore reduced motion. A second infinite logo spectacle competes with the hero. Services results animate on keyboard filtering, and pricing buttons are inert.

Current code from `/Users/prativ/dev/helpmeman-platform/frontend/components/landing/FloatingStatsSection.tsx:389`:

```tsx
389: 
390:   return (
391:     <section
392:       ref={sectionRef}
393:       className="relative w-full h-[135vh] bg-white dark:bg-[#0A0A0A]"
394:     >
395:       {/* Sticky Full-Viewport Stage */}
396:       <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center px-4 select-none">
397:         {/* Real-time Organic Physics Floating Icons Container */}
398:         <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
399:           {LOGOS.map((logo, i) => {
```

## Target

Replace the sticky/physics count section with a compact trust band: existing `100+ mentors`, `200+ sessions`, `4400+ minutes` all visible immediately. Target section padding 28px mobile / 40px desktop; stat type 32px mobile / 44px desktop, labels 12–14px, tabular numbers. Use a restrained, unique logo arrangement built from existing local assets. Make the lower institutions section a finite static logo/category wall (at most 8–12 unique entries visible; no four-copy DOM duplication, infinite marquee or decorative hover lift). Keep warm human profile photography as the visual contrast to charcoal/lavender surfaces.

Homepage order: Hero → compact trust band → AI composer → featured mentors → comparison → outcomes → pricing → institutions → final CTA/footer. Preserve anchors and auth behavior. Marketing surfaces share max width 1200px, 24px desktop gutters/16px mobile minimum, existing font. All useful content appears without a delayed scroll gate. Optional one-time opacity reveal <=240ms, not on data being filtered. Pricing CTAs become real links to the mentor directory using supported existing filters only; if a tier has no supported filter, label clearly as `Explore mentors` and link `/mentors` rather than pretending to book a selected tier. Do not change price amounts or promises.

## Repo conventions to follow

Next.js 16.2.4 / React 19 / Tailwind 4. Read `/Users/prativ/dev/helpmeman-platform/frontend/AGENTS.md` and relevant local Next documentation before edits. Motion 12.38, Three 0.184 and Base UI 1.8 are installed. Keep the existing MSaans font, white/light and blue-charcoal/lavender dark palette, current routing and real mentor data. CSS modules sit beside their components. `components/landing/HeroSection.module.css` uses the intended strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; extend the shared tokens from plan 001. For Motion numeric easing use `[0.23, 1, 0.32, 1]`. Pointer press budget: 160ms, scale .97. Reduced motion keeps brief 150ms opacity feedback and drops positional movement.

## Steps

1. Replace the stats physics and scroll-stage code with readable compact markup and remove unused loop/listener imports.
2. Replace repeated infinite lower logos with a curated static wall using existing asset definitions; preserve breadth in a short supporting sentence and keep accessible labels unique.
3. Reorder only the public content components in app/page.tsx; leave modal/query/auth effects intact.
4. Remove positional/mount delay from ServicesSection results that reappear after keyboard search; preserve filtering behavior.
5. Wire pricing actions to existing honest navigation, provide visible focus and 160ms pointer press feedback. Keep the mobile/dark card system and avoid animations on numeric stats.

## Boundaries

- Own these marketing files and new marketing CSS modules only. Do not edit app/landing.css, globals, hero modules, shared ProfileCard or authentication.
- Do not invent counts, ratings, institutions, endorsements, bookings or backend filters.
- Do not install entire React Bits/Magic UI/Aceternity registries. No smooth-scroll library or more WebGL sections.

## Verification

- Typecheck and targeted ESLint. Compare desktop/mobile screenshots in both themes.
- Verify all three counts are visible on initial section render, no requestAnimationFrame remains for floating stats, and no duplicate marquee copy is exposed to screen readers.
- Type/clear a service query and confirm results appear immediately; click a pricing link and verify its real destination.
- Done when the hero owns the visual emphasis, real mentors appear earlier, and the homepage has no sticky empty distance or competing autonomous logo loops.

All source changes must be reviewed against `/Users/prativ/.agents/skills/review-animations/SKILL.md`. Current official Motion documentation supports independent x/scale acceleration: do not mechanically rewrite shorthand props based on the older audit catalog. No frame-rate claim may be called measured without a trace. A live backend is not required for mechanical checks; report fixture-only verification clearly.
