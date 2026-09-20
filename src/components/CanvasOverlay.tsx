import { useContext, type MouseEvent as ReactMouseEvent } from "react";
import { StageScaleContext } from "./Stage";
import { type Annotation, type Point, type Size } from "../types";

/** Sequential-player controls handed to the active step's tooltip in preview. */
export interface PreviewPlayer {
  activeId: string;
  index: number; // 1-based position of the current step
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}

/**
 * On-canvas guided-tour overlays. Each annotation can contribute a draggable
 * spotlight rectangle, a draggable step tooltip, and a draggable circle pointer
 * (artboard px). In preview a `player` drives a single-step sequential walk.
 */
export function CanvasOverlay({
  annotations,
  activeId,
  onMove,
  readOnly = false,
  player,
}: {
  annotations: Annotation[];
  activeId: string | null;
  onMove: (id: string, patch: Partial<Annotation>) => void;
  readOnly?: boolean;
  player?: PreviewPlayer;
}) {
  // In preview the player shows one step at a time; while authoring, show all.
  const visible = player ? annotations.filter((a) => a.id === player.activeId) : annotations;
  return (
    <>
      {visible.map((a) => (
        <AnnotationOverlays
          key={a.id}
          ann={a}
          active={player ? true : a.id === activeId}
          onMove={onMove}
          readOnly={readOnly}
          player={player && a.id === player.activeId ? player : undefined}
        />
      ))}
    </>
  );
}

function AnnotationOverlays({
  ann,
  active,
  onMove,
  readOnly,
  player,
}: {
  ann: Annotation;
  active: boolean;
  onMove: (id: string, patch: Partial<Annotation>) => void;
  readOnly: boolean;
  player?: PreviewPlayer;
}) {
  const dragRect = useDrag(ann.rectPos, (p) => onMove(ann.id, { rectPos: p }));
  const dragCircle = useDrag(ann.circlePos, (p) => onMove(ann.id, { circlePos: p }));
  const dragTip = useDrag(ann.tooltipPos, (p) => onMove(ann.id, { tooltipPos: p }));
  const resizeRect = useResize(() => ({ w: ann.rectSize.w, h: ann.rectSize.h }), (sz) => onMove(ann.id, { rectSize: sz }), { minW: 40, minH: 32 });
  const resizeCircle = useResize(() => ({ w: ann.circleSize, h: ann.circleSize }), (sz) => onMove(ann.id, { circleSize: Math.max(sz.w, sz.h) }), { minW: 24, minH: 24, square: true });
  const z = active ? 30 : 20;
  const cursor = readOnly ? "default" : "move";
  // Resize grips only while authoring the active annotation.
  const showGrips = active && !readOnly;

  return (
    <>
      {ann.rectangle && (
        <div
          onMouseDown={readOnly ? undefined : dragRect}
          className="absolute"
          style={{
            left: ann.rectPos.x,
            top: ann.rectPos.y,
            width: ann.rectSize.w,
            height: ann.rectSize.h,
            border: `2px solid ${active ? "var(--arvo-content-theme-dark)" : "var(--arvo-color-s-theme)"}`,
            borderRadius: 4,
            cursor,
            zIndex: z,
          }}
        >
          {showGrips && <ResizeGrip onMouseDown={resizeRect} />}
        </div>
      )}

      {ann.circle && (
        <div
          onMouseDown={readOnly ? undefined : dragCircle}
          className="absolute"
          style={{
            left: ann.circlePos.x,
            top: ann.circlePos.y,
            width: ann.circleSize,
            height: ann.circleSize,
            border: "3px solid var(--arvo-color-t-info-dark)",
            borderRadius: 999,
            boxShadow: "0 0 0 4px rgba(0,46,210,0.15)",
            cursor,
            zIndex: z + 1,
          }}
        >
          {showGrips && <ResizeGrip onMouseDown={resizeCircle} />}
        </div>
      )}

      {ann.textBox && (
        <Tooltip ann={ann} active={active} onDragStart={readOnly ? undefined : dragTip} onResize={readOnly ? undefined : onMove} zIndex={z + 2} player={player} showGrip={showGrips} />
      )}
    </>
  );
}

/** Small bottom-right handle that drives a resize drag. */
function ResizeGrip({ onMouseDown }: { onMouseDown: (e: ReactMouseEvent) => void }) {
  return (
    <span
      onMouseDown={onMouseDown}
      className="absolute"
      style={{
        right: -7,
        bottom: -7,
        width: 14,
        height: 14,
        background: "var(--arvo-color-s-layer-01)",
        border: "2px solid var(--arvo-content-theme-dark)",
        borderRadius: 3,
        cursor: "nwse-resize",
        zIndex: 40,
      }}
    />
  );
}

function Tooltip({
  ann,
  active,
  onDragStart,
  onResize,
  zIndex,
  player,
  showGrip,
}: {
  ann: Annotation;
  active: boolean;
  onDragStart?: (e: ReactMouseEvent) => void;
  onResize?: (id: string, patch: Partial<Annotation>) => void;
  zIndex: number;
  player?: PreviewPlayer;
  showGrip?: boolean;
}) {
  const hasTitle = ann.title.trim() !== "";
  const hasSummary = ann.summary.trim() !== "";
  const hasAction = ann.action.trim() !== "";
  const resizeTip = useResize(
    () => ({ w: ann.tooltipWidth, h: ann.tooltipWidth }),
    (sz) => onResize?.(ann.id, { tooltipWidth: sz.w }),
    { minW: 260, minH: 0, widthOnly: true }
  );
  return (
    <div
      className="absolute"
      style={{
        left: ann.tooltipPos.x,
        top: ann.tooltipPos.y,
        width: ann.tooltipWidth,
        background: "var(--arvo-color-s-layer-02)",
        color: "var(--arvo-color-t-inverse)",
        borderRadius: 8,
        padding: 20,
        boxShadow: active ? "0 0 0 2px var(--arvo-content-theme-dark), var(--arvo-shadow-down)" : "var(--arvo-shadow-down)",
        fontFamily: "var(--arvo-font-family)",
        zIndex,
      }}
    >
      <span aria-hidden className="absolute" style={{ width: 16, height: 16, background: "var(--arvo-color-s-layer-02)", transform: "rotate(45deg)", ...pointerPosition(ann.pointer, ann.tooltipWidth) }} />

      {/* drag handle = title row; title updates live from the editor */}
      <div style={{ cursor: onDragStart ? "move" : "default", marginBottom: 6 }} onMouseDown={onDragStart}>
        <span style={{ fontSize: 15, fontWeight: 500, color: hasTitle ? "var(--arvo-color-t-inverse)" : "rgba(255,255,255,0.5)" }}>
          {hasTitle ? ann.title : "Step title"}
        </span>
      </div>

      <p style={{ fontSize: 12, lineHeight: "18px", color: hasSummary ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)", margin: 0, marginBottom: hasAction ? 12 : 16 }}>
        {hasSummary ? ann.summary : "Step summary"}
      </p>

      {hasAction && (
        <div className="flex items-center gap-6" style={{ fontSize: 12, fontWeight: 500, color: "var(--arvo-color-t-inverse)", marginBottom: 16 }}>
          <span aria-hidden style={{ display: "inline-flex", width: 6, height: 6, borderRadius: 999, background: "var(--arvo-color-s-theme)", boxShadow: "0 0 0 3px rgba(255,255,255,0.9)" }} />
          {ann.action}
        </div>
      )}

      {player && (
        <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: 12 }}>
          <span style={{ fontSize: 11, opacity: 0.6 }}>
            {player.index}/{player.total}
          </span>
          <div className="flex items-center gap-12" style={{ fontSize: 12 }}>
            <button type="button" onClick={player.onExit} style={{ color: "rgba(255,255,255,0.7)" }}>
              Exit tour
            </button>
            <button
              type="button"
              onClick={player.index > 1 ? player.onPrev : undefined}
              disabled={player.index <= 1}
              style={{ color: "rgba(255,255,255,0.7)", opacity: player.index <= 1 ? 0.35 : 1, cursor: player.index <= 1 ? "default" : "pointer" }}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={player.onNext}
              className="px-12 py-4"
              style={{ background: "var(--arvo-color-s-layer-01)", color: "var(--arvo-color-t-primary)", borderRadius: 4 }}
            >
              {player.index >= player.total ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}

      {showGrip && <ResizeGrip onMouseDown={resizeTip} />}
    </div>
  );
}

/** Places the diamond pointer on the correct edge of the tooltip. */
function pointerPosition(pointer: Annotation["pointer"], width: number) {
  switch (pointer) {
    case "Up":
      return { top: -8, left: width / 2 - 8 };
    case "Down":
      return { bottom: -8, left: width / 2 - 8 };
    case "Left":
      return { left: -8, top: 40 };
    case "Right":
    default:
      return { right: -8, top: 40 };
  }
}

/** Drag handler that converts screen-pixel motion into artboard pixels. */
function useDrag(pos: Point, onChange: (p: Point) => void) {
  const scale = useContext(StageScaleContext);
  return (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const ox = pos.x;
    const oy = pos.y;
    const s = scale || 1;
    const move = (ev: globalThis.MouseEvent) =>
      onChange({ x: Math.round(ox + (ev.clientX - startX) / s), y: Math.round(oy + (ev.clientY - startY) / s) });
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
}

/** Resize handler: converts screen-pixel motion into an artboard-px size. */
function useResize(
  getStart: () => Size,
  onChange: (s: Size) => void,
  opts: { minW: number; minH: number; square?: boolean; widthOnly?: boolean }
) {
  const scale = useContext(StageScaleContext);
  return (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const { w, h } = getStart();
    const s = scale || 1;
    const move = (ev: globalThis.MouseEvent) => {
      const dw = (ev.clientX - startX) / s;
      const dh = (ev.clientY - startY) / s;
      let nw = Math.max(opts.minW, Math.round(w + dw));
      let nh = opts.widthOnly ? h : Math.max(opts.minH, Math.round(h + dh));
      if (opts.square) {
        const d = Math.max(nw, nh);
        nw = d;
        nh = d;
      }
      onChange({ w: nw, h: nh });
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
}
