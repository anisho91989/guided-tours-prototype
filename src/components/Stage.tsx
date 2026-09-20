import { createContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { STAGE_W, STAGE_H } from "../types";

/** Current scale factor of the artboard, so children can convert drag deltas. */
export const StageScaleContext = createContext(1);

/**
 * Renders a fixed 1920x1108 artboard and scales it (letterboxed, centered) to
 * fit the available viewport. Children position themselves in raw artboard
 * pixels, matching the Figma design 1:1.
 */
export function Stage({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const compute = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: "var(--arvo-color-s-base)" }}
    >
      <div
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          position: "relative",
          flex: "0 0 auto",
          boxShadow: "var(--arvo-shadow-down)",
          background: "var(--arvo-color-s-layer-01)",
        }}
      >
        <StageScaleContext.Provider value={scale}>{children}</StageScaleContext.Provider>
      </div>
    </div>
  );
}
