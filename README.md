# o9 Guided Tours — Feedback Prototype

A clickable, screenshot-backed prototype of the o9 **Guided Tours** feature, built to
share with an audience for feedback. The dense dashboard is a pixel-accurate Figma
screenshot backdrop; the **Guided Tours side panel** and clickable hotspots are real code
styled with the **`@o9/design-tokens`** (Arvo) package.

Source design: Figma `Simulator-UX` (`GIlXHDQch46RLQRqg33tw7`), section `8921:16649`.

## Status — full flow, interactive

The whole flow is built as a genuinely interactive app (not a fixed click-through).

**Tour creation funnel**
1. The dashboard loads with the Guided Tours panel **closed**.
2. Click the **▷ Guided Tours button** on the right launch rail to open the panel.
3. Empty state → **＋ Create guided tour**.
4. **Step 1 — name the tour** (required) → **Next**.
5. **Step 2** — pick a **workflow** (working dropdown), **type** a summary and details,
   optionally **Enhance Summary**, and **Select Files** (real file picker; removable list).
6. **Add** creates the tour → it appears under **Your Guided Tours** with your data.

Tour cards follow state-based actions:
- **Draft (unpublished):** only **Edit Tour**.
- **Published:** **Preview Tour** + **Edit Tour**, plus a **PUBLISHED** badge.

**N file(s) attached** expands to the filenames (each opens in a new tab). The home is
always reachable and its **search** filters your tours. While creating or editing a tour,
the header **＋** is hidden to prevent duplicate creation.

**Tour authoring** (Edit Tour) — editing **resumes from the last saved step**.
6. **Outline** — the tour's 7 pages (any page is openable).
7. Open a page → the left workspace pane renders that page (page 1 has a captured backdrop;
   others show a labelled placeholder). Each annotation also has a **Workflow page**
   selector that re-renders the left pane on change.
8. **＋ Add annotation**, then build it live on the canvas:
   - **Add text box** → a step **tooltip** appears on the dashboard.
   - **Direction of pointer** (Left/Right/Up/Down) → moves the tooltip's pointer.
   - **Add step title** (free text) + **step summary** (type or Enhance) → fills the tooltip.
   - **Rectangle** → a **spotlight** around the Metrics row.
   - **Circle pointer** → a **ring** on the Projected Lost Sales KPI.
   - **Drag** the tooltip, rectangle, and circle anywhere on the page to position them.
9. **Save annotation** → it collapses; **＋ Add annotation** for the next one; **Edit** any
   saved annotation to reopen it.
10. Once every annotation is saved, **Publish guided tour** → returns to the home where the
    tour is marked PUBLISHED, and you can create another.

Reviewer aids (bottom bar): **Show hints** highlights the next action; **Reset** clears
session state.

> **Scope note:** page 1 has the full annotation editor (it's the flow the Figma
> demonstrates). Pages 2–7 appear in the outline but their editors/backdrops aren't built
> yet — export those page backdrops from Figma to extend them the same way.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build & deploy (for the shareable link)

```bash
npm run build    # outputs static files to dist/
npm run preview  # preview the production build locally
```

`dist/` is a static bundle — drop it on any static host:

- **Netlify:** drag `dist/` into the Netlify dashboard, or `netlify deploy --prod --dir=dist`
- **Vercel:** `vercel --prod` (framework preset: Vite)
- **Internal/S3/Azure Static Web Apps:** upload the contents of `dist/`

## How it's structured

| File | Purpose |
|------|---------|
| `src/App.tsx` | App state machine: panel open/closed, current view, form data, created tours. |
| `src/types.ts` | `Tour` / `DraftForm` / `PanelView` model + artboard/panel/dock geometry constants (from Figma). |
| `src/components/GuidedToursPanel.tsx` | The real, coded o9 panel — create form, dropdown, file picker, saved list, tour outline, and the page-1 annotation editor. |
| `src/components/CanvasOverlay.tsx` | On-canvas guided-tour overlays: tooltip, spotlight rectangle, circle pointer. |
| `src/components/RightRailToggle.tsx` | The launch-rail ▷ button that opens/closes the panel. |
| `src/components/Stage.tsx` | Scales the 1920×1108 artboard to fit any viewport. |
| `src/components/HelperBar.tsx` | Reviewer controls (hints / reset). |
| `src/assets/` | Figma screenshot backdrop(s). |

All positions are authored in **raw Figma pixels** (1920×1108), so they map 1:1 to the design.

## Adding the remaining 13 screens

The next slices move into the tour **outline** and **annotation-authoring** states
(spotlights + on-canvas tooltips). To add a screen:

1. Export its backdrop from Figma into `src/assets/`.
2. Add a `PanelState` variant in `src/types.ts` and render it in `GuidedToursPanel.tsx`
   (or add a canvas-overlay component for spotlight/tooltip screens).
3. Append the screen to `SCREENS` in `src/flow.ts` with its hotspots.

Reconstructed full order (Figma node ids):
`16650 → 16744 → 16901 → 17090 → 17247 → 17361 → 17507 → 17657 → 17831 → 18075 →
18318 → 18565 → 18812 → 19061 → 19310 → 19586 → 19817 → 20045`

## Notes

- **Font:** `o9 Sans` is referenced by the tokens but not bundled; a system fallback is
  used. Drop the real webfont in via `@font-face` in `src/index.css` when available.
- Desktop-only (matches the 1920-wide artboards). Static demo data, as designed.
