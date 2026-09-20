/**
 * o9 Design System (Arvo) — Tailwind preset.
 * Usage in a consuming project's tailwind.config.js:
 *
 *   module.exports = {
 *     presets: [require("@o9/design-tokens/tailwind-preset")],
 *     content: ["./src/**\/*.{js,ts,jsx,tsx,html}"],
 *   };
 *
 * Then use classes like: bg-surface-layer01, text-text-primary,
 * border-border-divider, p-4, rounded-16, text-h16-m.
 *
 * Resolved light-theme values. Semantic colors are theme-adaptive in Figma;
 * for dark theme, wire a CSS-variable strategy instead of these static hexes.
 */

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"o9 Sans"', "system-ui", "-apple-system", "sans-serif"],
        o9: ['"o9 Sans"', "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        // [size, lineHeight] — Figma line-height is 100% for these styles
        "h18-r": ["18px", { lineHeight: "100%", fontWeight: "400" }],
        "h16-m": ["16px", { lineHeight: "100%", fontWeight: "500" }],
        "h14-m": ["14px", { lineHeight: "100%", fontWeight: "500" }],
        "h12-r": ["12px", { lineHeight: "100%", fontWeight: "400" }],
        "l14-r": ["14px", { lineHeight: "100%", fontWeight: "400" }],
        "l12-r": ["12px", { lineHeight: "100%", fontWeight: "400" }],
        "l10-r": ["10px", { lineHeight: "100%", fontWeight: "400" }],
        "p12-r": ["12px", { lineHeight: "100%", fontWeight: "400" }],
        "p10-r": ["10px", { lineHeight: "100%", fontWeight: "400" }],
        // raw sizes
        10: "10px",
        12: "12px",
        14: "14px",
        16: "16px",
        18: "18px",
      },
      spacing: {
        1: "1px",
        2: "2px",
        4: "4px",
        6: "6px",
        8: "8px",
        10: "10px",
        12: "12px",
        16: "16px",
        24: "24px",
      },
      borderRadius: {
        none: "0px",
        16: "16px",
      },
      borderWidth: {
        1: "1px",
        2: "2px",
        thin: "1px",
        thickest: "4px",
      },
      boxShadow: {
        down: "0 10px 20px 0 #4c4c4c33",
      },
      colors: {
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
          "info-dark": "#002ed2",
          "form-label": "#303030",
          "form-value": "#202020",
          active: "#ffffff",
          "active-inverse": "#010101",
          "white-static": "#ffffff",
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
          "info-dark": "#002ed2",
          "white-static": "#ffffff",
        },
        surface: {
          theme: "#010101",
          brand: "#f2f2f2",
          base: "#f2f2f2",
          inverse: "#010101",
          neutral: "#010101",
          readonly: "#f2f2f2",
          "layer-01": "#ffffff",
          "layer-02": "#202020",
          "layer-03": "#ffffff",
          "layer-04": "#f2f2f2",
          "layer-05": "#f2f2f2",
          "layer-07": "#cccccc",
          "theme-active-2": "#e5e5e5",
          "theme-hover-4": "#e5e5e5",
          "placeholder-2": "#4c4c4c",
        },
        border: {
          divider: "#e5e5e5",
          theme: "#010101",
          "theme-active": "#010101",
          form: "#949494",
          "active-static": "#808080",
          base: "#f2f2f2",
          subtle: "#f2f2f2",
          inverse: "#f2f2f2",
          "focus-inverse": "#ffffff",
        },
        content: {
          "theme-dark": "#004696",
        },
      },
    },
  },
};
