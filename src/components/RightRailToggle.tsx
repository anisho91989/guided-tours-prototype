import { RAIL_BTN } from "../types";
import { IconPlay } from "./icons";
import type { SVGProps } from "react";

const railGlyph = (p: SVGProps<SVGSVGElement>) => ({
  width: 18,
  height: 18,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});
// Decorative, non-interactive launch-rail glyphs shown above the toggle.
const RAIL_ICONS = [
  (p: SVGProps<SVGSVGElement>) => (
    <svg {...railGlyph(p)}>
      <circle cx="7" cy="7" r="4.5" />
      <path d="m14 14-3.2-3.2" />
    </svg>
  ),
  (p: SVGProps<SVGSVGElement>) => (
    <svg {...railGlyph(p)}>
      <path d="M4.5 7a3.5 3.5 0 0 1 7 0c0 3 1 4 1 4h-9s1-1 1-4Z" />
      <path d="M6.8 13a1.4 1.4 0 0 0 2.4 0" />
    </svg>
  ),
  (p: SVGProps<SVGSVGElement>) => (
    <svg {...railGlyph({ fill: "currentColor", stroke: "none", ...p })}>
      <circle cx="4" cy="4" r="1.1" />
      <circle cx="8" cy="4" r="1.1" />
      <circle cx="12" cy="4" r="1.1" />
      <circle cx="4" cy="8" r="1.1" />
      <circle cx="8" cy="8" r="1.1" />
      <circle cx="12" cy="8" r="1.1" />
      <circle cx="4" cy="12" r="1.1" />
      <circle cx="8" cy="12" r="1.1" />
      <circle cx="12" cy="12" r="1.1" />
    </svg>
  ),
  (p: SVGProps<SVGSVGElement>) => (
    <svg {...railGlyph(p)}>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M12.5 3.5l-1.1 1.1M4.6 11.4l-1.1 1.1" />
    </svg>
  ),
];

/**
 * Coded overlay of the launch-rail "Guided Tours" toggle button. It sits on top
 * of the design's baked-in rail button so it can show the correct active/closed
 * state and actually respond to clicks. This is the control the reviewer uses to
 * open the panel.
 */
export function RightRailToggle({
  active,
  showHints,
  onClick,
}: {
  active: boolean;
  showHints: boolean;
  onClick: () => void;
}) {
  return (
    <>
      {/* decorative rail icons above the toggle — clicks intentionally do nothing */}
      <div
        aria-hidden
        className="absolute flex flex-col items-center"
        style={{
          left: RAIL_BTN.left,
          top: 88,
          width: RAIL_BTN.width,
          height: RAIL_BTN.top - 88,
          background: "var(--arvo-color-s-layer-01)",
          borderLeft: "1px solid var(--arvo-color-b-divider)",
          paddingTop: 14,
          gap: 18,
          color: "var(--arvo-color-i-tertiary)",
        }}
      >
        {RAIL_ICONS.map((Glyph, i) => (
          <span
            key={i}
            className="flex items-center justify-center"
            style={{ width: 36, height: 36, borderRadius: 8, cursor: "default" }}
          >
            <Glyph />
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onClick}
        title="Guided Tours"
        className="absolute flex items-center justify-center"
        style={{
          left: RAIL_BTN.left,
          top: RAIL_BTN.top,
          width: RAIL_BTN.width,
          height: RAIL_BTN.height,
          background: "var(--arvo-color-s-layer-01)", // matches the white rail
          borderLeft: "1px solid var(--arvo-color-b-divider)",
        }}
      >
        {/* selection accent when open */}
        <span
          aria-hidden
          className="absolute"
          style={{
            left: 0,
            top: 8,
            bottom: 8,
            width: 3,
            background: active ? "var(--arvo-color-s-theme)" : "transparent",
            borderRadius: 2,
          }}
        />
        <span
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: active ? "var(--arvo-color-s-theme-active-2)" : "transparent",
            color: "var(--arvo-color-i-primary)",
            boxShadow: showHints && !active ? "0 0 0 2px var(--arvo-content-theme-dark)" : "none",
            animation: showHints && !active ? "arvoPulse 1.6s ease-in-out infinite" : "none",
          }}
        >
          <span
            className="flex items-center justify-center"
            style={{ width: 24, height: 24, border: "1.4px solid currentColor", borderRadius: 999 }}
          >
            <IconPlay width={11} height={11} />
          </span>
        </span>
      </button>
    </>
  );
}
