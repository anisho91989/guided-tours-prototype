/**
 * o9 Design System (Arvo Foundation) — typed design tokens.
 * Resolved light-theme values. Source: Figma GIlXHDQch46RLQRqg33tw7 (Simulator-UX).
 *
 * Import what you need:
 *   import { color, spacing, radius, textStyles } from "@o9/design-tokens";
 *   <div style={{ background: color.surface.layer01, padding: spacing[16] }} />
 */

export const fontFamily = '"o9 Sans", system-ui, -apple-system, sans-serif' as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
} as const;

export const fontSize = {
  10: "10px",
  12: "12px",
  14: "14px",
  16: "16px",
  18: "18px",
} as const;

export const lineHeight = {
  14: "14px",
  16: "16px",
  20: "20px",
  24: "24px",
} as const;

export const textStyles = {
  "h18-r": { fontFamily, fontWeight: 400, fontSize: "18px", lineHeight: "100%" },
  "h16-m": { fontFamily, fontWeight: 500, fontSize: "16px", lineHeight: "100%" },
  "h14-m": { fontFamily, fontWeight: 500, fontSize: "14px", lineHeight: "100%" },
  "h12-r": { fontFamily, fontWeight: 400, fontSize: "12px", lineHeight: "100%" },
  "l14-r": { fontFamily, fontWeight: 400, fontSize: "14px", lineHeight: "100%" },
  "l12-r": { fontFamily, fontWeight: 400, fontSize: "12px", lineHeight: "100%" },
  "l10-r": { fontFamily, fontWeight: 400, fontSize: "10px", lineHeight: "100%" },
  "p12-r": { fontFamily, fontWeight: 400, fontSize: "12px", lineHeight: "100%" },
  "p10-r": { fontFamily, fontWeight: 400, fontSize: "10px", lineHeight: "100%" },
} as const;

export const spacing = {
  1: "1px",
  2: "2px",
  4: "4px",
  6: "6px",
  8: "8px",
  10: "10px",
  12: "12px",
  16: "16px",
  24: "24px",
} as const;

export const radius = {
  none: "0px",
  16: "16px",
} as const;

export const borderWidth = {
  thin: "1px",
  1: "1px",
  2: "2px",
  thickest: "4px",
} as const;

export const iconSize = {
  14: "14px",
  16: "16px",
  20: "20px",
  32: "32px",
} as const;

export const color = {
  text: {
    primary: "#010101",
    secondary: "#303030",
    tertiary: "#4c4c4c",
    neutral: "#010101",
    theme: "#010101",
    hover: "#010101",
    inverse: "#ffffff",
    disabled: "#b2b2b2",
    placeholder: "#666666",
    negative: "#bc1227",
    infoDark: "#002ed2",
    formLabel: "#303030",
    formValue: "#202020",
    active: "#ffffff",
    activeInverse: "#010101",
    whiteStatic: "#ffffff",
  },
  icon: {
    primary: "#010101",
    secondary: "#303030",
    tertiary: "#4c4c4c",
    neutral: "#010101",
    theme: "#010101",
    active: "#010101",
    inverse: "#ffffff",
    disabled: "#b2b2b2",
    infoDark: "#002ed2",
    whiteStatic: "#ffffff",
  },
  surface: {
    theme: "#010101",
    brand: "#f2f2f2",
    base: "#f2f2f2",
    inverse: "#010101",
    neutral: "#010101",
    readonly: "#f2f2f2",
    layer01: "#ffffff",
    layer02: "#202020",
    layer03: "#ffffff",
    layer04: "#f2f2f2",
    layer05: "#f2f2f2",
    layer07: "#cccccc",
    themeActive2: "#e5e5e5",
    themeHover4: "#e5e5e5",
    placeholder2: "#4c4c4c",
    shadowStatic1: "#4c4c4c33",
  },
  border: {
    divider: "#e5e5e5",
    theme: "#010101",
    themeActive: "#010101",
    form: "#949494",
    activeStatic: "#808080",
    base: "#f2f2f2",
    subtle: "#f2f2f2",
    inverse: "#f2f2f2",
    focusInverse: "#ffffff",
  },
  content: {
    themeDark: "#004696",
  },
} as const;

export const effects = {
  shadowDown: "0 10px 20px 0 #4c4c4c33",
} as const;

export const layout = {
  containerBtnMin: "112px",
  actionmenuWmin: "160px",
  actionmenuWmax: "400px",
  popoverHmax: "900px",
  scrollWidth: "8px",
} as const;

export const tokens = {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  textStyles,
  spacing,
  radius,
  borderWidth,
  iconSize,
  color,
  effects,
  layout,
} as const;

export default tokens;
