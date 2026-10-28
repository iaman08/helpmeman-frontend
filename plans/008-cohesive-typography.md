# 008 — A cohesive, legible public typography system

Status: DONE.

## Research and scope

Use Emil design engineering, Apple typography principles and the newly installed Impeccable typeset guidance. Preserve the existing MSaans identity and restored phone graphic while correcting font delivery, weights and repeated type roles across the homepage, services, cards and footer. No extra UI or animation library is needed.

Primary sources:
- https://impeccable.style/docs/typeset/ — hierarchy, reading measure, consistent roles, zoom and delivery.
- https://github.com/pbakaus/impeccable — installed official skill at `/Users/prativ/.codex/skills/impeccable` using the skill-installer helper.
- https://rsms.me/inter/ — reviewed optical size and UI readability principles; no second family added because the established font can be corrected.
- https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html — layouts must tolerate text spacing and remain readable.
- Local Next16.2.4 font documentation — one self-hosted variable asset, swap and automatic fallback metrics.

## Confirmed findings and decisions

| Before | After | Why |
| --- | --- | --- |
| Static Bold file is internally M Saans Heavy, weight900; registered as700/800 beside overlapping variable ranges | Single variable face with real300–900 axis | Eliminates misleading weight mapping and redundant preloads |
| Tailwind font variable references itself | Separate Next font source `--font-ui`, public alias `--font-sans` | Clear source-to-consumer mapping without a circular declaration |
| Global negative tracking and forced character variants | Normal body tracking and default OpenType features | Keeps small text open and coherent |
| Section headings vary44–56px,600–700weight and1.05–1.1leading | One responsive30–44px section role,600weight,1.18leading,-.025emtracking | Repeated sections now share the same hierarchy |
| Display tracking-.055em | -.035em and1.1leading | Preserves presence without collisions |
| Card skills/location10px, stat captions9px | Metadata12px, roles15px, names20px, actions14px | Makes decision-making details readable |
| Pricing descriptions12px, features12px | Descriptions15px, features14px, tier names16px | Dense cards retain hierarchy without tiny information |
| Comparison descriptions medium/semibold throughout | Normal/medium15px body and consistent heading roles | Reduces visual shouting and improves scanning |
| Footer body14px and legal12px | Body15px, legal13px, restrained600weight headings | Extends the same typographic care to the bottom of the page |

Miniature product-preview typography and logo artwork remain intentionally scaled inside the phone/banner graphic; they are not the controls users must operate to use the real product. Actual directory CTA and phase controls remain available.

## Skill/tool outcome

Installed Impeccable4.8.0 and read typeset/craft-floor references. Direct context launcher failed executable permission; read the existing implementation and saved design references directly, per its documented fallback. The typography detector ran through `sh` against the public section source and returned zero findings. No hooks or browser extensions were installed.

## Checks

TypeScript and targeted ESLint pass (three existing Next image warnings). Production build passed, including TypeScript and all72 pages. Typography detector returned zero findings on public section sources, ProfileCard CSS and global/landing CSS. Browser checks covered desktop light and dark,390px and320px with no horizontal overflow, mentor card metadata, comparison headings, pricing, institutions, footer and services. Computed section titles match44px/600/1.18 desktop and30px/600/1.18 narrow. Body descriptions16px, footer15px. Viewport override reset. Physical-device testing and user text-spacing/zoom overrides were not simulated; no exhaustive WCAG certification is claimed. Dark pricing screenshot: `/tmp/helpmeman-revamp/typography-pricing-dark.png`. Live development preview remains http://localhost:3000/.
