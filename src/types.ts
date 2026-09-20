/**
 * Model for the interactive o9 Guided Tours prototype.
 *
 * Everything is authored in the Figma artboard coordinate space (1920x1108),
 * measured from screen 8921:16650. The <Stage> scales that space to the
 * viewport, so positions below are raw Figma pixels.
 */

export const STAGE_W = 1920;
export const STAGE_H = 1108;

/** The Guided Tours panel (coded drawer), from Figma node 8921:16725. */
export const PANEL = { left: 1534, top: 95, width: 320, height: 1013 } as const;

/**
 * The reserved dock the panel lives in. When the panel is closed we cover this
 * region so the design's baked-in panel screenshot doesn't show through.
 */
export const DOCK = { left: 1520, top: 94, width: 340, height: 1014 } as const;

/** The launch-rail "Guided Tours" toggle button (Figma node 8921:16721). */
export const RAIL_BTN = { left: 1860, top: 246, width: 60, height: 55 } as const;

export type PanelView = "empty" | "create" | "saved" | "outline" | "page";

/** Canvas overlay geometry for the page-1 authoring view (Figma node 8921:20045). */
export const SPOTLIGHT = { left: 51, top: 140, width: 1477, height: 169 } as const;
export const TOOLTIP = { left: 389, top: 326, width: 506, pointerX: 663 } as const;
export const CIRCLE = { left: 1189, top: 136, width: 64, height: 64 } as const;

/** The 7 pages of the Material Shortage tour (Figma outline). */
export const PAGES = [
  "Supportability - Material Short",
  "Demand Supportability Analysis",
  "Constraint Summary View",
  "Material Constraint View",
  "Res1: Enable AltSupplier",
  "Res3: Expedite PO",
  "Scenario Comparision",
] as const;

/** Step-title options for the annotation dropdown. */
export const STEP_TITLES = [
  "Review important KPIs",
  "Check inventory alerts",
  "Inspect the demand plan",
  "Review exceptions",
] as const;

export type PointerDir = "Left" | "Right" | "Up" | "Down";

/** Sentinel page index for an annotation that has no workflow page chosen yet. */
export const UNASSIGNED_PAGE = -1;

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

/** One annotation authored on a page. Positions are draggable (artboard px). */
export interface Annotation {
  id: string;
  page: number; // index into PAGES — the workflow page this annotation is on
  textBox: boolean;
  pointer: PointerDir;
  title: string;
  summary: string;
  action: string;
  rectangle: boolean;
  circle: boolean;
  tooltipPos: Point;
  rectPos: Point;
  circlePos: Point;
  tooltipWidth: number; // draggable text-box width (artboard px)
  rectSize: Size; // draggable spotlight rectangle size
  circleSize: number; // draggable circle-pointer diameter
  saved: boolean;
}

export const newAnnotation = (id: string, page = 0): Annotation => ({
  id,
  page,
  textBox: false,
  pointer: "Up",
  title: "",
  summary: "",
  action: "",
  rectangle: false,
  circle: false,
  tooltipPos: { x: TOOLTIP.left, y: TOOLTIP.top },
  rectPos: { x: SPOTLIGHT.left, y: SPOTLIGHT.top },
  circlePos: { x: CIRCLE.left, y: CIRCLE.top },
  tooltipWidth: TOOLTIP.width,
  rectSize: { w: SPOTLIGHT.width, h: SPOTLIGHT.height },
  circleSize: CIRCLE.width,
  saved: false,
});

/** An attached file — name plus a local object URL so it can be opened. */
export interface FileRef {
  name: string;
  url: string;
}

/** A guided tour the user creates in-session. */
export interface Tour {
  id: string;
  name: string;
  workflow: string;
  summary: string;
  details: string;
  files: FileRef[];
  published: boolean;
  annotations: Annotation[];
}

/** The editable create-tour form. */
export interface DraftForm {
  name: string;
  workflow: string;
  summary: string;
  details: string;
  files: FileRef[];
}

export const EMPTY_FORM: DraftForm = { name: "", workflow: "", summary: "", details: "", files: [] };

/** Authoring mode for an opened tour. */
export type TourMode = "edit" | "preview";

/** Backdrop image for a given page index, or null when no screenshot exists. */
export function pageBackdrop(index: number, page1Url: string): string | null {
  return index === 0 ? page1Url : null;
}

/** Workflow options in the Select Workflow dropdown (from Figma screen 22). */
export const WORKFLOWS = [
  "Planning Master Data",
  "Material Shortage",
  "SP-SupplierCollab",
  "Deployment |1| DILOP",
  "SP-SupplierCollab ||4| Demand",
] as const;
