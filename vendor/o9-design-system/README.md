# o9 Design System (Arvo Foundation)

Design tokens extracted from Figma file **Simulator-UX** (`GIlXHDQch46RLQRqg33tw7`),
sourced from the **Arvo Foundation Library – Design System**.

## Files

| File | Use it for |
|------|-----------|
| `tokens.css` | Drop-in CSS custom properties (`--arvo-*`) + typography utility classes. Import once, reference `var(--arvo-...)` anywhere. Contains **resolved real values**. |
| `design-tokens.json` | Machine-readable tokens with **resolved real values**. Feed into a Tailwind/Style Dictionary build, or import in JS/TS. |
| `semantic-tokens.json` | The **full semantic color structure** (positive/negative/info + util green/blue families) discovered from the library. Values are `null` where not resolvable — a completion map, not values to ship as-is. |
| `tokens.ts` | Typed token exports (`as const`) for JS/TS projects: `import { color, spacing, textStyles } from "@o9/design-tokens"`. |
| `tailwind-preset.js` | Tailwind preset mapping o9 tokens to theme keys (colors, spacing, fontSize, radius, shadow). |
| `package.json` | Makes the folder installable as `@o9/design-tokens` with subpath exports. |

## Reuse across projects (install)

This folder is a self-contained package (`@o9/design-tokens`). Three ways to reuse it everywhere:

**A. Private npm package (best for many projects)**
Publish to o9's private registry (Azure Artifacts / GitHub Packages), then in each project:
```bash
npm install @o9/design-tokens
```

**B. Local path / workspace (monorepo or quick start)**
```bash
npm install /path/to/o9-design-system      # or: "@o9/design-tokens": "file:../o9-design-system"
```

**C. Copy the folder in** — zero setup, manual updates.

### Consume it

CSS (any framework, or none):
```js
import "@o9/design-tokens/css";        // registers all --arvo-* variables
```

TypeScript / JS:
```ts
import { color, spacing, radius, textStyles } from "@o9/design-tokens";
const style = { background: color.surface.layer01, padding: spacing[16], borderRadius: radius[16] };
```

Tailwind:
```js
// tailwind.config.js
module.exports = {
  presets: [require("@o9/design-tokens/tailwind-preset")],
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
};
// -> bg-surface-layer-01  text-text-primary  border-border-divider  p-16  rounded-16  text-h16-m
```

Raw JSON (build pipelines / Style Dictionary):
```js
import tokens from "@o9/design-tokens/json";
```

> **Font:** the `o9 Sans` family must be provided by the consuming app (self-host the webfont or
> load it from o9's font source); these tokens reference it by name but don't bundle the font files.

## Design system libraries connected to the file

- **Arvo Foundation Library – Design System** — tokens/variables (this export)
- **Arvo Components Library [NEW]** — current component library
- **Arvo Assets Library** — icons & illustrations
- o9ds Components Library *(deprecated)*, o9 Brand Book

## Prefix note

The system was renamed **o9ds → arvo**. Both prefixes resolve to the same values.
Canonical variables use `--arvo-*`; `--o9ds-*` aliases are included for older markup.

## Token groups

- **Typography** — family `o9 Sans`, sizes 10/12/14/16/18, weights Regular(400)/Medium(500), named styles (`h16-m`, `p12-r`, …)
- **Spacing** — 1, 2, 4, 6, 8, 10, 12, 16, 24 (px)
- **Radius** — none (0), 16
- **Border width** — thin/1, 2, thickest (4)
- **Color** — semantic scales: `text` (t), `icon` (i), `surface` (s), `border` (b), plus content/theme
- **Effects** — `shadow-down`
- **Layout** — button min width, action-menu / popover / scrollbar constants

## Usage (CSS)

```html
<link rel="stylesheet" href="o9-design-system/tokens.css" />
```

```css
.card {
  background: var(--arvo-color-s-layer-01);
  border: var(--arvo-border-1) solid var(--arvo-color-b-divider);
  border-radius: var(--arvo-radius-16);
  padding: var(--arvo-space-16);
  color: var(--arvo-color-t-primary);
}
```

```html
<h2 class="arvo-h16-m">Title</h2>
<p class="arvo-p12-r">Body copy</p>
```

## How complete is this? (fuller-pull results)

Two extraction paths were used against the Arvo Foundation Library:

1. **`get_variable_defs`** — resolves **real values**, but only for tokens *actually used* by a
   given node. This produced everything in `tokens.css` / `design-tokens.json`.
2. **`search_design_system`** — enumerates token **names/structure** across the whole library,
   but **does not return resolved values**, and is rate-capped (1 query, ~3–13 results per call).
   This produced `semantic-tokens.json` (structure with `null` values).

**The ceiling:** a byte-complete export *with values* is not achievable through the MCP tools from
this consumer file. The authoritative complete export must come from the **Arvo Foundation source
file** itself, via one of:
- Figma's built-in **variable export** (Figma variables REST API / "Export variables"), or
- the **Tokens Studio** plugin (exports all collections + modes to JSON), or
- opening the Arvo Foundation file directly and pulling `get_variable_defs` on nodes that exercise
  every token.

Ask the o9 design-system team for the Foundation file link or an official token export to fill the
`null`s in `semantic-tokens.json`.

## Caveats

- Values are the **resolved light-theme** values. Semantic color tokens are theme-adaptive
  in Figma; the same names remap for dark theme.
- No **warning** color family exists in the Arvo Theme collection.
- Values in `tokens.css` / `design-tokens.json` are **real**. `semantic-tokens.json` `null`s are
  **unresolved, not zero** — do not ship them as guessed colors.
