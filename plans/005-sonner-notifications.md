# 005 — Replace the fragile toast stack with a compatible Sonner adapter

- **Status**: IMPLEMENTED — see VERIFICATION.md for coverage and limits
- **Commit**: 49997ba
- **Working tree**: includes the existing uncommitted homepage/dark-mode work; preserve it.
- **Severity**: MEDIUM
- **Category**: Feedback / lifecycle / accessibility
- **Estimated scope**: package.json+package-lock.json, components/Toast.tsx, optional Toast.module.css

## Problem

The shared toast has no live-region semantics or accessible dismiss name, a fixed timer that ignores hover/focus/visibility, and stack reflow after deletion. A mature toast component is a bounded improvement across existing consumers.

Current code from `/Users/prativ/dev/helpmeman-platform/frontend/components/Toast.tsx:46`:

```tsx
46: }
47: 
48: function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: (id: number) => void }) {
49:   const [visible, setVisible] = useState(false);
50:   const [exiting, setExiting] = useState(false);
51: 
52:   useEffect(() => {
53:     // Trigger entrance
54:     requestAnimationFrame(() => setVisible(true));
55: 
56:     const timer = setTimeout(() => {
57:       setExiting(true);
58:       setTimeout(() => onDismiss(data.id), 300);
59:     }, 3500);
60: 
61:     return () => clearTimeout(timer);
62:   }, [data.id, onDismiss]);
63: 
64:   const icons = {
```

## Target

Install stable Sonner (official upstream currently 2.0.8; confirm npm published version before pinning). Preserve the existing public API exactly: `<ToastProvider>{children}</ToastProvider>` and `useToast().toast(message, type?)`, type union success/error/info and default success. Route through Sonner's corresponding methods. Mount one themed Toaster, bottom-right, max three visible, close button, 4500ms duration, accessible status semantics, pause when page hidden and normal library hover/focus behavior. Keep placement above app content but below unrelated external browser UI; use existing palette tokens rather than default neon colors. Honor reduced-motion stylesheet behavior and keep readable text at mobile widths.

## Repo conventions to follow

Next.js 16.2.4 / React 19 / Tailwind 4. Read `/Users/prativ/dev/helpmeman-platform/frontend/AGENTS.md` and relevant local Next documentation before edits. Motion 12.38, Three 0.184 and Base UI 1.8 are installed. Keep the existing MSaans font, white/light and blue-charcoal/lavender dark palette, current routing and real mentor data. CSS modules sit beside their components. `components/landing/HeroSection.module.css` uses the intended strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; extend the shared tokens from plan 001. For Motion numeric easing use `[0.23, 1, 0.32, 1]`. Pointer press budget: 160ms, scale .97. Reduced motion keeps brief 150ms opacity feedback and drops positional movement.

## Steps

1. Root installs the single runtime dependency and updates only npm package metadata/lockfile; no lockfile churn from another package manager.
2. Read installed Sonner types and the ask-sonner skill. Implement a small context-compatible adapter so no consumer needs migration.
3. Use useTheme for Toaster theme without changing theme persistence. Add named close control/toaster label via supported props; do not assume inaccessible undocumented APIs.
4. Verify stack behavior and API compatibility. Do not add a production-only demo page or expose toast internals globally just for testing.

## Boundaries

- No change to existing toast call sites or application business flow.
- No second notification provider, parallel hand-written timer stack, or new state library.
- Do not upgrade unrelated dependencies, mutate bun.lock or auto-run npm audit fix.

## Verification

- `npx tsc --noEmit` catches all call-site compatibility. Targeted ESLint.
- Verify the installed package exposes React 19-compatible peer types and only one Toaster exists.
- Where an existing harmless UI flow produces feedback, inspect live semantics/dismiss/stack behavior; otherwise document code/package-contract checks instead of claiming an unperformed browser interaction.
- Done when every current useToast consumer works with the unchanged API and lifecycle/timer work is delegated to Sonner.

All source changes must be reviewed against `/Users/prativ/.agents/skills/review-animations/SKILL.md`. Current official Motion documentation supports independent x/scale acceleration: do not mechanically rewrite shorthand props based on the older audit catalog. No frame-rate claim may be called measured without a trace. A live backend is not required for mechanical checks; report fixture-only verification clearly.
