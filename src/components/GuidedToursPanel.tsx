import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  PAGES,
  PANEL,
  UNASSIGNED_PAGE,
  WORKFLOWS,
  type Annotation,
  type DraftForm,
  type FileRef,
  type PanelView,
  type PointerDir,
  type Tour,
  type TourMode,
} from "../types";
import {
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconInfo,
  IconMoreV,
  IconPlay,
  IconPlus,
  IconSearch,
  IconSparkle,
  IconTrash,
  IconUpload,
} from "./icons";

const c = {
  layer01: "var(--arvo-color-s-layer-01)",
  layer04: "var(--arvo-color-s-layer-04)",
  theme: "var(--arvo-color-s-theme)",
  tPrimary: "var(--arvo-color-t-primary)",
  tSecondary: "var(--arvo-color-t-secondary)",
  tTertiary: "var(--arvo-color-t-tertiary)",
  tPlaceholder: "var(--arvo-color-t-placeholder)",
  tInverse: "var(--arvo-color-t-inverse)",
  info: "var(--arvo-color-t-info-dark)",
  divider: "var(--arvo-color-b-divider)",
  form: "var(--arvo-color-b-form)",
  negative: "var(--arvo-color-t-negative)",
  hover: "var(--arvo-color-s-theme-hover-4)",
};

const R = 4;

// Uniformly enlarges the panel (text + spacing). The root box is divided by
// this factor and zoomed back so it still anchors at the same artboard rect.
const FONT_SCALE = 1.18;

const ENHANCED_SUMMARY =
  "Identify material constraints across the supply network, quantify their impact on demand " +
  "fulfillment, and evaluate resolution scenarios — alternate sourcing, expedites, and rebalancing — " +
  "to protect service levels and margin.";

const pulse = (on: boolean): CSSProperties =>
  on
    ? { boxShadow: "0 0 0 2px var(--arvo-content-theme-dark)", animation: "arvoPulse 1.6s ease-in-out infinite", borderRadius: R }
    : {};

export interface AnnotationHandlers {
  add: () => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<Annotation>) => void;
}

export interface PanelProps {
  view: PanelView;
  mode: TourMode;
  showHints: boolean;
  onClose: () => void;
  // funnel
  form: DraftForm;
  setForm: (updater: (f: DraftForm) => DraftForm) => void;
  tours: Tour[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onStartCreate: () => void;
  onCancel: () => void;
  onAdd: () => void;
  onOpenTour: (id: string) => void;
  onPreviewTour: (id: string) => void;
  activeTourId: string | null;
  onRequestDeleteTour: (id: string) => void;
  // outline / page editor
  tourName: string;
  onBackToSaved: () => void;
  openPage: number | null;
  onTogglePage: (index: number) => void;
  annotations: Annotation[];
  annHandlers: AnnotationHandlers;
  activeAnn: string | null;
  onEditAnnotation: (id: string) => void;
  onSaveAnnotation: (id: string) => void;
  onSetAnnotationPage: (id: string, page: number) => void;
  onPreviewJump: (id: string) => void;
  navLocked: boolean;
  onPublish: () => void;
}

export function GuidedToursPanel(props: PanelProps) {
  const { view, onClose, onStartCreate } = props;
  const inTour = view === "outline";
  // Hide the "+" while actively creating or editing/previewing a tour.
  const showAdd = view === "empty" || view === "saved";

  return (
    <div
      className="arvo-scroll absolute flex flex-col overflow-y-auto"
      style={{
        left: PANEL.left / FONT_SCALE,
        top: PANEL.top / FONT_SCALE,
        width: PANEL.width / FONT_SCALE,
        height: PANEL.height / FONT_SCALE,
        zoom: FONT_SCALE,
        background: c.layer01,
        borderLeft: `1px solid ${c.divider}`,
        fontFamily: "var(--arvo-font-family)",
        color: c.tPrimary,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-16"
        style={{ height: 48, borderBottom: `1px solid ${c.divider}`, flex: "0 0 auto" }}
      >
        {inTour ? (
          <button type="button" onClick={props.onBackToSaved} className="flex items-center gap-8" style={{ color: c.tPrimary, overflow: "hidden" }}>
            <span style={{ transform: "rotate(180deg)", display: "inline-flex", flex: "0 0 auto" }}>
              <IconChevronRight width={16} height={16} />
            </span>
            <span style={{ fontSize: 15, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{props.tourName}</span>
            {props.mode === "preview" && (
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.04em", color: c.tInverse, background: c.info, borderRadius: 999, padding: "2px 6px", flex: "0 0 auto" }}>
                PREVIEW
              </span>
            )}
          </button>
        ) : (
          <span style={{ fontSize: 16, fontWeight: 500 }}>Guided Tours</span>
        )}
        <div className="flex items-center gap-8" style={{ flex: "0 0 auto" }}>
          {showAdd && (
            <button
              type="button"
              onClick={onStartCreate}
              className="flex items-center justify-center"
              style={{ width: 24, height: 24, background: c.theme, color: c.tInverse, borderRadius: R }}
              title="Create guided tour"
            >
              <IconPlus width={14} height={14} />
            </button>
          )}
          {inTour ? (
            // Delete is tucked under a kebab menu so a tour can't be removed by
            // a single accidental click while it's open.
            props.activeTourId && (
              <KebabMenu
                title="Tour options"
                items={[{ label: "Delete tour", danger: true, onSelect: () => props.onRequestDeleteTour(props.activeTourId!) }]}
              />
            )
          ) : (
            <button type="button" onClick={onClose} style={{ color: c.tSecondary }} title="Close">
              <IconClose />
            </button>
          )}
        </div>
      </div>

      {/* Search (funnel only) */}
      {!inTour && (
        <div className="px-16" style={{ paddingTop: 12, paddingBottom: 12, flex: "0 0 auto" }}>
          <div
            className="flex items-center gap-8 px-10"
            style={{ height: 32, background: c.layer04, borderRadius: R, color: c.tPlaceholder }}
          >
            <IconSearch width={14} height={14} />
            <input
              className="w-full bg-transparent"
              style={{ fontSize: 12, color: c.tPrimary, outline: "none", border: "none" }}
              placeholder="Find a tour..."
              value={props.searchQuery}
              onChange={(e) => props.setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="px-16" style={{ paddingTop: inTour ? 16 : 0, paddingBottom: 16, flex: "1 1 auto" }}>
        {view === "empty" && <EmptyState onStartCreate={onStartCreate} showHints={props.showHints} />}
        {view === "create" && (
          <CreateForm form={props.form} setForm={props.setForm} onCancel={props.onCancel} onAdd={props.onAdd} showHints={props.showHints} />
        )}
        {view === "saved" && (
          <SavedList
            tours={props.tours}
            searchQuery={props.searchQuery}
            onStartCreate={onStartCreate}
            onOpenTour={props.onOpenTour}
            onPreviewTour={props.onPreviewTour}
            onDeleteTour={props.onRequestDeleteTour}
            showHints={props.showHints}
          />
        )}
        {view === "outline" && (
          <OutlineView
            mode={props.mode}
            openPage={props.openPage}
            onTogglePage={props.onTogglePage}
            annotations={props.annotations}
            annHandlers={props.annHandlers}
            activeAnn={props.activeAnn}
            onEditAnnotation={props.onEditAnnotation}
            onSaveAnnotation={props.onSaveAnnotation}
            onSetAnnotationPage={props.onSetAnnotationPage}
            onPreviewJump={props.onPreviewJump}
            navLocked={props.navLocked}
            onPublish={props.onPublish}
            showHints={props.showHints}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- empty */

function EmptyState({ onStartCreate, showHints }: { onStartCreate: () => void; showHints: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ paddingTop: 120 }}>
      <div
        className="flex items-center justify-center"
        style={{ width: 96, height: 96, borderRadius: 999, background: c.layer04, color: c.tTertiary, marginBottom: 24 }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="6" y="9" width="28" height="19" rx="2" />
          <path d="M14 33h12M20 28v5" />
          <path d="M11 22l5-5 4 3 6-7" />
        </svg>
      </div>
      <button
        type="button"
        onClick={onStartCreate}
        className="flex items-center gap-8 px-16"
        style={{ height: 36, background: c.theme, color: c.tInverse, borderRadius: R, fontSize: 13, ...pulse(showHints) }}
      >
        <IconPlus width={14} height={14} />
        Create guided tour
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- create */

function CreateForm({
  form,
  setForm,
  onCancel,
  onAdd,
  showHints,
}: {
  form: DraftForm;
  setForm: (updater: (f: DraftForm) => DraftForm) => void;
  onCancel: () => void;
  onAdd: () => void;
  showHints: boolean;
}) {
  const [step, setStep] = useState<"name" | "details">("name");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const canAdd = form.name.trim() !== "" && form.workflow.trim() !== "" && form.summary.trim() !== "";
  const canNext = form.name.trim() !== "";

  // Step 1 — name the tour before workflow selection / file upload.
  if (step === "name") {
    return (
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Create new Guided tour</span>
          <button type="button" onClick={onCancel} style={{ color: c.tSecondary }}>
            <IconClose />
          </button>
        </div>

        <p style={{ fontSize: 11, color: c.tTertiary, margin: "0 0 12px", lineHeight: "16px" }}>Step 1 of 2 — name your tour</p>

        <FieldLabel required>Guided tour name</FieldLabel>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Material Shortage walkthrough"
          className="w-full px-10"
          style={{ height: 32, border: `1px solid ${c.form}`, borderRadius: R, background: c.layer01, color: c.tPrimary, fontSize: 12, outline: "none", ...(!form.name ? pulse(showHints) : {}) }}
        />

        <div className="flex items-center justify-end gap-8" style={{ marginTop: 16 }}>
          <button type="button" onClick={onCancel} className="px-12" style={{ height: 32, fontSize: 12, color: c.tSecondary }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={canNext ? () => setStep("details") : undefined}
            disabled={!canNext}
            className="px-16"
            style={{ height: 32, fontSize: 12, background: c.theme, color: c.tInverse, borderRadius: R, minWidth: 64, opacity: canNext ? 1 : 0.4, cursor: canNext ? "pointer" : "not-allowed", ...(canNext ? pulse(showHints) : {}) }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Step 2 — workflow, summary, details, upload.
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Create new Guided tour</span>
        <button type="button" onClick={onCancel} style={{ color: c.tSecondary }}>
          <IconClose />
        </button>
      </div>
      <button type="button" onClick={() => setStep("name")} className="flex items-center gap-4" style={{ fontSize: 11, color: c.info, marginBottom: 12 }}>
        <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}>
          <IconChevronRight width={12} height={12} />
        </span>
        {form.name || "Untitled tour"}
      </button>

      <FieldLabel required>Select Workflow</FieldLabel>
      <button
        type="button"
        onClick={() => setDropdownOpen((o) => !o)}
        className="flex w-full items-center justify-between px-10"
        style={{
          height: 32,
          border: `1px solid ${c.form}`,
          borderRadius: R,
          background: c.layer01,
          color: form.workflow ? c.tPrimary : c.tPlaceholder,
          fontSize: 12,
          marginBottom: dropdownOpen ? 0 : 16,
          ...(!form.workflow ? pulse(showHints) : {}),
        }}
      >
        <span>{form.workflow || "Select option"}</span>
        <IconChevronDown width={14} height={14} style={{ color: c.tSecondary }} />
      </button>

      {dropdownOpen && (
        <div
          style={{
            border: `1px solid ${c.divider}`,
            borderTop: "none",
            borderRadius: `0 0 ${R}px ${R}px`,
            boxShadow: "var(--arvo-shadow-down)",
            marginBottom: 16,
            overflow: "hidden",
            background: c.layer01,
          }}
        >
          <div className="flex items-center gap-8 px-10" style={{ height: 32, borderBottom: `1px solid ${c.divider}`, color: c.tPlaceholder }}>
            <IconSearch width={14} height={14} />
            <span style={{ fontSize: 12 }}>Search</span>
          </div>
          {WORKFLOWS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                setForm((f) => ({ ...f, workflow: o }));
                setDropdownOpen(false);
              }}
              className="flex w-full items-center px-10"
              style={{ height: 32, fontSize: 12, textAlign: "left", background: form.workflow === o ? c.hover : c.layer01, color: c.tPrimary }}
              onMouseEnter={(e) => (e.currentTarget.style.background = c.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = form.workflow === o ? c.hover : c.layer01)}
            >
              {o}
            </button>
          ))}
        </div>
      )}

      <FieldLabel required info>
        Add summary
      </FieldLabel>
      <textarea
        value={form.summary}
        onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
        placeholder="Placeholder name"
        className="w-full px-10 py-8"
        style={{ height: 72, resize: "none", border: `1px solid ${c.form}`, borderRadius: R, fontSize: 12, lineHeight: "16px", color: c.tPrimary, outline: "none" }}
      />
      <EnhanceSummary onClick={() => setForm((f) => ({ ...f, summary: ENHANCED_SUMMARY }))} />

      <FieldLabel info style={{ marginTop: 12 }}>
        Add additional details
      </FieldLabel>
      <RichTextToolbar />
      <textarea
        value={form.details}
        onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
        placeholder="Add description..."
        className="w-full px-10 py-8"
        style={{ height: 72, resize: "none", border: `1px solid ${c.form}`, borderTop: "none", borderRadius: `0 0 ${R}px ${R}px`, fontSize: 12, color: c.tPrimary, outline: "none" }}
      />

      <FieldLabel required info style={{ marginTop: 12 }}>
        Upload Videos/Documents
      </FieldLabel>
      <input
        ref={fileInput}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const refs: FileRef[] = Array.from(e.target.files ?? []).map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
          }));
          if (refs.length) setForm((f) => ({ ...f, files: [...f.files, ...refs] }));
        }}
      />
      <div className="flex items-center justify-between gap-8 px-10 py-8" style={{ border: `1px dashed ${c.form}`, borderRadius: R }}>
        <span style={{ fontSize: 10, color: c.tTertiary, lineHeight: "14px" }}>
          Drop files here to upload
          <br />
          Max file size is 500mb. Only jpg files are supported.
        </span>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-4 px-10"
          style={{ height: 28, border: `1px solid ${c.form}`, borderRadius: R, fontSize: 12, whiteSpace: "nowrap" }}
        >
          <IconUpload width={14} height={14} />
          Select Files
        </button>
      </div>

      {form.files.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {form.files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center justify-between px-8" style={{ height: 26, background: c.layer04, borderRadius: R, marginTop: 4, fontSize: 11 }}>
              <a href={file.url} target="_blank" rel="noreferrer" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: c.info, textDecoration: "none" }}>
                {file.name}
              </a>
              <button type="button" onClick={() => setForm((f) => ({ ...f, files: f.files.filter((_, idx) => idx !== i) }))} style={{ color: c.tSecondary, flex: "0 0 auto" }}>
                <IconClose width={12} height={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-8" style={{ marginTop: 16 }}>
        <button type="button" onClick={onCancel} className="px-12" style={{ height: 32, fontSize: 12, color: c.tSecondary }}>
          Cancel
        </button>
        <button
          type="button"
          onClick={canAdd ? onAdd : undefined}
          disabled={!canAdd}
          className="px-16"
          style={{ height: 32, fontSize: 12, background: c.theme, color: c.tInverse, borderRadius: R, minWidth: 64, opacity: canAdd ? 1 : 0.4, cursor: canAdd ? "pointer" : "not-allowed", ...(canAdd ? pulse(showHints) : {}) }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function EnhanceSummary({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end" style={{ marginTop: 6 }}>
      <button type="button" onClick={onClick} className="flex items-center gap-4" style={{ color: c.info, fontSize: 11, fontWeight: 500 }}>
        <IconSparkle width={12} height={12} />
        Enhance Summary
      </button>
    </div>
  );
}

function RichTextToolbar() {
  const items = ["B", "I", "U", "S"];
  return (
    <div className="flex items-center gap-10 px-8" style={{ height: 28, border: `1px solid ${c.form}`, borderRadius: `${R}px ${R}px 0 0`, color: c.tSecondary }}>
      {items.map((t) => (
        <span key={t} style={{ fontSize: 12, fontWeight: t === "B" ? 700 : 400, fontStyle: t === "I" ? "italic" : "normal", textDecoration: t === "U" ? "underline" : t === "S" ? "line-through" : "none" }}>
          {t}
        </span>
      ))}
      <span style={{ width: 1, height: 14, background: c.divider }} />
      <span style={{ fontSize: 12 }}>≣</span>
      <span style={{ fontSize: 12 }}>⋮≡</span>
      <span style={{ marginLeft: "auto" }}>
        <IconMoreV width={14} height={14} />
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------- saved */

function SavedList({
  tours,
  searchQuery,
  onStartCreate,
  onOpenTour,
  onPreviewTour,
  onDeleteTour,
  showHints,
}: {
  tours: Tour[];
  searchQuery: string;
  onStartCreate: () => void;
  onOpenTour: (id: string) => void;
  onPreviewTour: (id: string) => void;
  onDeleteTour: (id: string) => void;
  showHints: boolean;
}) {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? tours.filter((t) => t.name.toLowerCase().includes(q) || t.workflow.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q))
    : tours;

  return (
    <div style={{ paddingTop: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", color: c.tTertiary, marginBottom: 12 }}>
        {tours.length === 0 ? "RECOMMENDED USER STORIES" : "YOUR GUIDED TOURS"}
      </div>

      {filtered.map((t) => (
        <TourCard key={t.id} tour={t} onOpenTour={() => onOpenTour(t.id)} onPreviewTour={() => onPreviewTour(t.id)} onDeleteTour={() => onDeleteTour(t.id)} showHints={showHints} />
      ))}

      {tours.length > 0 && filtered.length === 0 && (
        <p style={{ fontSize: 12, color: c.tTertiary, margin: "8px 0 12px" }}>No tours match “{searchQuery}”.</p>
      )}

      <button
        type="button"
        onClick={onStartCreate}
        className="flex w-full items-center justify-center gap-8"
        style={{ height: 34, border: `1px dashed ${c.form}`, borderRadius: R, fontSize: 12, color: c.tSecondary, marginTop: 4, ...pulse(showHints && tours.length === 0) }}
      >
        <IconPlus width={14} height={14} />
        Create guided tour
      </button>
    </div>
  );
}

function TourCard({
  tour,
  onOpenTour,
  onPreviewTour,
  onDeleteTour,
  showHints,
}: {
  tour: Tour;
  onOpenTour: () => void;
  onPreviewTour: () => void;
  onDeleteTour: () => void;
  showHints: boolean;
}) {
  const [showFiles, setShowFiles] = useState(false);
  return (
    <div style={{ border: `1px solid ${c.divider}`, borderRadius: 8, padding: 12, marginBottom: 8 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span className="flex items-center gap-8" style={{ fontSize: 13, fontWeight: 500 }}>
          {tour.name || tour.workflow}
          {tour.published && (
            <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.04em", color: c.tInverse, background: c.info, borderRadius: 999, padding: "2px 6px" }}>
              PUBLISHED
            </span>
          )}
        </span>
        <div className="flex items-center gap-6" style={{ color: c.tSecondary }}>
          <KebabMenu title="Tour options" items={[{ label: "Delete tour", danger: true, onSelect: onDeleteTour }]} />
        </div>
      </div>
      <p style={{ fontSize: 11, lineHeight: "16px", color: c.tTertiary, margin: 0, marginBottom: 10 }}>{tour.summary}</p>

      {tour.files.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setShowFiles((s) => !s)}
            className="flex items-center gap-4"
            style={{ fontSize: 11, color: c.info }}
          >
            <IconChevronRight width={12} height={12} style={{ transform: showFiles ? "rotate(90deg)" : "none" }} />
            {tour.files.length} file{tour.files.length > 1 ? "s" : ""} attached
          </button>
          {showFiles && (
            <div style={{ marginTop: 6 }}>
              {tour.files.map((f, i) => (
                <a
                  key={`${f.name}-${i}`}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-6 px-8"
                  style={{ height: 26, background: c.layer04, borderRadius: R, marginTop: 4, fontSize: 11, color: c.tPrimary, textDecoration: "none" }}
                >
                  <IconUpload width={12} height={12} style={{ color: c.tSecondary }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-8">
        {tour.published && (
          <button type="button" onClick={onPreviewTour} className="flex items-center gap-6 px-12" style={{ height: 30, background: c.theme, color: c.tInverse, borderRadius: R, fontSize: 12, ...pulse(showHints) }}>
            <IconPlay width={12} height={12} />
            Preview Tour
          </button>
        )}
        <button
          type="button"
          onClick={onOpenTour}
          className="px-12"
          style={{
            height: 30,
            fontSize: 12,
            borderRadius: R,
            ...(tour.published
              ? { border: `1px solid ${c.form}` }
              : { background: c.theme, color: c.tInverse, ...pulse(showHints) }),
          }}
        >
          Edit Tour
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- outline */

function OutlineView({
  mode,
  openPage,
  onTogglePage,
  annotations,
  annHandlers,
  activeAnn,
  onEditAnnotation,
  onSaveAnnotation,
  onSetAnnotationPage,
  onPreviewJump,
  navLocked,
  onPublish,
  showHints,
}: {
  mode: TourMode;
  openPage: number | null;
  onTogglePage: (i: number) => void;
  annotations: Annotation[];
  annHandlers: AnnotationHandlers;
  activeAnn: string | null;
  onEditAnnotation: (id: string) => void;
  onSaveAnnotation: (id: string) => void;
  onSetAnnotationPage: (id: string, page: number) => void;
  onPreviewJump: (id: string) => void;
  navLocked: boolean;
  onPublish: () => void;
  showHints: boolean;
}) {
  const preview = mode === "preview";
  const allSaved = annotations.length > 0 && annotations.every((a) => a.saved);
  const stepNumber = (id: string) => annotations.findIndex((a) => a.id === id) + 1;

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", color: c.tTertiary, marginBottom: 10 }}>PAGES</div>
      {navLocked && (
        <div style={{ fontSize: 11, color: c.info, background: c.layer04, borderRadius: R, padding: "8px 10px", marginBottom: 10, lineHeight: "15px" }}>
          Save the current annotation to move to another page.
        </div>
      )}
      {PAGES.map((name, i) => {
        const open = openPage === i;
        const locked = navLocked && !open;
        const pageAnns = annotations.filter((a) => a.page === i);
        // While a page is open it also hosts any annotation that has no page
        // chosen yet, so a freshly added step can be configured and assigned.
        const authoringAnns = open ? annotations.filter((a) => a.page === i || a.page === UNASSIGNED_PAGE) : pageAnns;
        return (
          <div key={name} style={{ marginBottom: 6 }}>
            <button
              type="button"
              onClick={() => (locked ? undefined : onTogglePage(i))}
              disabled={locked}
              className="flex w-full items-center gap-10 px-10"
              style={{
                height: 40,
                border: `1px solid ${open ? c.form : c.divider}`,
                borderRadius: R,
                background: open ? c.layer04 : c.layer01,
                cursor: locked ? "not-allowed" : "pointer",
                opacity: locked ? 0.5 : 1,
                ...(i === 0 && !open && annotations.length === 0 ? pulse(showHints) : {}),
              }}
            >
              <span style={{ fontSize: 12, color: c.tSecondary, width: 14 }}>{i + 1}</span>
              <span style={{ fontSize: 12, textAlign: "left", flex: 1 }}>{name}</span>
              {pageAnns.length > 0 && (
                <span style={{ fontSize: 10, color: c.tInverse, background: c.tTertiary, borderRadius: 999, padding: "1px 7px" }}>{pageAnns.length}</span>
              )}
              <span style={{ color: c.tSecondary, transform: open ? "rotate(180deg)" : "none", display: "inline-flex" }}>
                <IconChevronDown width={14} height={14} />
              </span>
            </button>

            {open && !preview && (
              <PageAuthoring
                annotations={authoringAnns}
                annHandlers={annHandlers}
                activeAnn={activeAnn}
                onEditAnnotation={onEditAnnotation}
                onSaveAnnotation={onSaveAnnotation}
                onSetAnnotationPage={onSetAnnotationPage}
                showHints={showHints}
              />
            )}
            {open && preview && (
              <PagePreview annotations={pageAnns} activeId={activeAnn} stepNumber={stepNumber} onJump={onPreviewJump} />
            )}
          </div>
        );
      })}

      {/* Publish — hidden in preview; enabled once every annotation is saved */}
      {!preview && (
        <button
          type="button"
          onClick={allSaved ? onPublish : undefined}
          disabled={!allSaved}
          className="flex w-full items-center justify-center gap-8"
          style={{
            height: 36,
            marginTop: 12,
            background: c.theme,
            color: c.tInverse,
            borderRadius: R,
            fontSize: 13,
            opacity: allSaved ? 1 : 0.4,
            cursor: allSaved ? "pointer" : "not-allowed",
            ...(allSaved ? pulse(showHints) : {}),
          }}
          title={allSaved ? "Publish guided tour" : "Save all annotations first"}
        >
          <IconPlay width={14} height={14} />
          Publish guided tour
        </button>
      )}
    </div>
  );
}

function PagePreview({
  annotations,
  activeId,
  stepNumber,
  onJump,
}: {
  annotations: Annotation[];
  activeId: string | null;
  stepNumber: (id: string) => number;
  onJump: (id: string) => void;
}) {
  if (annotations.length === 0) {
    return <p style={{ fontSize: 11, color: c.tTertiary, padding: "10px 4px" }}>No annotations on this page.</p>;
  }
  return (
    <div style={{ padding: "10px 4px 4px" }}>
      {annotations.map((a) => {
        const on = a.id === activeId;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onJump(a.id)}
            className="flex w-full flex-col"
            style={{
              textAlign: "left",
              border: `1px solid ${on ? c.theme : c.divider}`,
              background: on ? c.layer04 : c.layer01,
              borderRadius: 8,
              padding: 10,
              marginBottom: 8,
            }}
          >
            <span className="flex items-center gap-6" style={{ fontSize: 12, fontWeight: 500 }}>
              {on && <IconPlay width={11} height={11} />}
              {stepNumber(a.id)}. {a.title || "Untitled step"}
            </span>
            {a.summary && <span style={{ fontSize: 11, color: c.tTertiary, margin: "4px 0 0", lineHeight: "16px" }}>{a.summary}</span>}
            {a.action && (
              <span className="flex items-center gap-6" style={{ fontSize: 11, color: c.info, marginTop: 6 }}>
                <IconChevronRight width={11} height={11} />
                {a.action}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PageAuthoring({
  annotations,
  annHandlers,
  activeAnn,
  onEditAnnotation,
  onSaveAnnotation,
  onSetAnnotationPage,
  showHints,
}: {
  annotations: Annotation[];
  annHandlers: AnnotationHandlers;
  activeAnn: string | null;
  onEditAnnotation: (id: string) => void;
  onSaveAnnotation: (id: string) => void;
  onSetAnnotationPage: (id: string, page: number) => void;
  showHints: boolean;
}) {
  return (
    <div style={{ padding: "12px 4px 4px" }}>
      {annotations.map((a, i) =>
        a.id === activeAnn ? (
          <AnnotationEditor
            key={a.id}
            index={i}
            ann={a}
            onRemove={() => annHandlers.remove(a.id)}
            onUpdate={(patch) => annHandlers.update(a.id, patch)}
            onSave={() => onSaveAnnotation(a.id)}
            onSetPage={(p) => onSetAnnotationPage(a.id, p)}
            showHints={showHints}
          />
        ) : (
          <CollapsedAnnotation
            key={a.id}
            index={i}
            ann={a}
            onEdit={() => onEditAnnotation(a.id)}
            onRemove={() => annHandlers.remove(a.id)}
          />
        )
      )}
      <button
        type="button"
        onClick={annHandlers.add}
        className="flex items-center gap-6 px-10"
        style={{ height: 30, background: c.theme, color: c.tInverse, borderRadius: R, fontSize: 12, marginTop: 4, ...pulse(showHints && annotations.length === 0) }}
      >
        <IconPlus width={14} height={14} />
        Add annotation
      </button>
    </div>
  );
}

function CollapsedAnnotation({
  index,
  ann,
  onEdit,
  onRemove,
}: {
  index: number;
  ann: Annotation;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-12" style={{ height: 44, border: `1px solid ${c.divider}`, borderRadius: 8, marginBottom: 10 }}>
      <div className="flex flex-col" style={{ overflow: "hidden" }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Annotation {index + 1}</span>
        <span style={{ fontSize: 11, color: c.tTertiary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
          {ann.title || "Untitled step"}
        </span>
      </div>
      <div className="flex items-center gap-10">
        <button type="button" onClick={onEdit} style={{ fontSize: 12, color: c.info, fontWeight: 500 }}>
          Edit
        </button>
        <button type="button" onClick={onRemove} style={{ color: c.tSecondary }} title="Delete annotation">
          <IconClose width={14} height={14} />
        </button>
      </div>
    </div>
  );
}

function AnnotationEditor({
  index,
  ann,
  onRemove,
  onUpdate,
  onSave,
  onSetPage,
  showHints,
}: {
  index: number;
  ann: Annotation;
  onRemove: () => void;
  onUpdate: (patch: Partial<Annotation>) => void;
  onSave: () => void;
  onSetPage: (page: number) => void;
  showHints: boolean;
}) {
  const dirs: PointerDir[] = ["Left", "Right", "Up", "Down"];
  const [pageOpen, setPageOpen] = useState(false);
  const pageChosen = ann.page >= 0;
  const canSave = pageChosen && ann.textBox && ann.title.trim() !== "" && ann.summary.trim() !== "";

  return (
    <div style={{ border: `1px solid ${c.form}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
      {/* header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Annotation {index + 1}</span>
        <button type="button" onClick={onRemove} style={{ color: c.tSecondary }} title="Delete annotation">
          <IconClose width={14} height={14} />
        </button>
      </div>

      {/* workflow page selector */}
      <FieldLabel required>Workflow page</FieldLabel>
      <button
        type="button"
        onClick={() => setPageOpen((o) => !o)}
        className="flex w-full items-center justify-between px-10"
        style={{ height: 32, border: `1px solid ${c.form}`, borderRadius: R, background: c.layer01, color: pageChosen ? c.tPrimary : c.tPlaceholder, fontSize: 12, marginBottom: pageOpen ? 0 : 12, ...(!pageChosen ? pulse(showHints) : {}) }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {pageChosen ? `${ann.page + 1}. ${PAGES[ann.page]}` : "Select workflow page"}
        </span>
        <IconChevronDown width={14} height={14} style={{ color: c.tSecondary, flex: "0 0 auto" }} />
      </button>
      {pageOpen && (
        <div style={{ border: `1px solid ${c.divider}`, borderTop: "none", borderRadius: `0 0 ${R}px ${R}px`, boxShadow: "var(--arvo-shadow-down)", overflow: "hidden", marginBottom: 12 }}>
          {PAGES.map((p, pi) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                onSetPage(pi);
                setPageOpen(false);
              }}
              className="flex w-full items-center px-10"
              style={{ height: 30, fontSize: 12, textAlign: "left", background: ann.page === pi ? c.hover : c.layer01, color: c.tPrimary }}
              onMouseEnter={(e) => (e.currentTarget.style.background = c.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ann.page === pi ? c.hover : c.layer01)}
            >
              {pi + 1}. {p}
            </button>
          ))}
        </div>
      )}

      {/* text box */}
      {ann.textBox ? (
        <Chip label="Text Box Added" onRemove={() => onUpdate({ textBox: false })} />
      ) : (
        <AddButton label="Add text box" onClick={() => onUpdate({ textBox: true })} pulse={showHints} />
      )}

      {/* direction */}
      {ann.textBox && (
        <>
          <FieldLabel required style={{ marginTop: 12 }}>
            Select direction of pointer
          </FieldLabel>
          <div className="flex items-center gap-6">
            {dirs.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onUpdate({ pointer: d })}
                className="px-10"
                style={{
                  height: 26,
                  fontSize: 12,
                  borderRadius: R,
                  border: `1px solid ${ann.pointer === d ? c.theme : c.form}`,
                  background: ann.pointer === d ? c.theme : c.layer01,
                  color: ann.pointer === d ? c.tInverse : c.tPrimary,
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </>
      )}

      {/* step title (free text) */}
      <FieldLabel required style={{ marginTop: 12 }}>
        Add step title
      </FieldLabel>
      <input
        value={ann.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Enter step title"
        className="w-full px-10"
        style={{ height: 32, border: `1px solid ${c.form}`, borderRadius: R, background: c.layer01, color: c.tPrimary, fontSize: 12, outline: "none" }}
      />

      {/* step summary */}
      <FieldLabel required info style={{ marginTop: 12 }}>
        Add step summary
      </FieldLabel>
      <textarea
        value={ann.summary}
        onChange={(e) => onUpdate({ summary: e.target.value })}
        placeholder="Enter step description"
        className="w-full px-10 py-8"
        style={{ height: 64, resize: "none", border: `1px solid ${c.form}`, borderRadius: R, fontSize: 12, lineHeight: "16px", color: c.tPrimary, outline: "none" }}
      />
      <EnhanceSummary
        onClick={() =>
          onUpdate({ summary: "Review the KPI tabs at the top where each one is interactive and drills into a specific metric." })
        }
      />

      {/* step action (CTA shown on the live text box) */}
      <FieldLabel info style={{ marginTop: 12 }}>
        Add action
      </FieldLabel>
      <input
        value={ann.action}
        onChange={(e) => onUpdate({ action: e.target.value })}
        placeholder="e.g. Click ‘Constraint Summary’"
        className="w-full px-10"
        style={{ height: 32, border: `1px solid ${c.form}`, borderRadius: R, background: c.layer01, color: c.tPrimary, fontSize: 12, outline: "none" }}
      />

      {/* highlighters */}
      <FieldLabel required style={{ marginTop: 12 }}>
        Add highlighters
      </FieldLabel>
      {ann.rectangle ? (
        <Chip label="Rectangle Added" onRemove={() => onUpdate({ rectangle: false })} />
      ) : (
        <AddButton label="Rectangle" onClick={() => onUpdate({ rectangle: true })} pulse={false} />
      )}
      {ann.circle ? (
        <Chip label="Circle pointer 1 Added" onRemove={() => onUpdate({ circle: false })} />
      ) : (
        <AddButton label="Circle pointer" onClick={() => onUpdate({ circle: true })} pulse={false} />
      )}

      <p style={{ fontSize: 10, color: c.tTertiary, margin: "10px 0 0" }}>
        Tip: drag the tooltip, rectangle, and circle to position them — drag the corner handle to resize.
      </p>

      {/* save */}
      <button
        type="button"
        onClick={canSave ? onSave : undefined}
        disabled={!canSave}
        className="flex w-full items-center justify-center gap-6"
        style={{
          height: 32,
          marginTop: 12,
          background: c.theme,
          color: c.tInverse,
          borderRadius: R,
          fontSize: 12,
          opacity: canSave ? 1 : 0.4,
          cursor: canSave ? "pointer" : "not-allowed",
          ...(canSave ? pulse(showHints) : {}),
        }}
        title={canSave ? "Save annotation" : "Select a workflow page, then add a text box, title and summary"}
      >
        Save annotation
      </button>
    </div>
  );
}

/* -------------------------------------------------------------- helpers */

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between px-10" style={{ height: 28, border: `1px solid ${c.divider}`, borderRadius: R, marginTop: 6, fontSize: 12 }}>
      <span className="flex items-center gap-8">
        <span style={{ color: "var(--arvo-color-t-info-dark)" }}>✓</span>
        {label}
      </span>
      <button type="button" onClick={onRemove} style={{ color: c.tSecondary }}>
        <IconClose width={12} height={12} />
      </button>
    </div>
  );
}

function AddButton({ label, onClick, pulse: doPulse }: { label: string; onClick: () => void; pulse: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-6 px-10"
      style={{ height: 30, border: `1px dashed ${c.form}`, borderRadius: R, fontSize: 12, color: c.tSecondary, marginTop: 6, ...pulse2(doPulse) }}
    >
      <IconPlus width={12} height={12} />
      {label}
    </button>
  );
}
const pulse2 = (on: boolean): CSSProperties =>
  on ? { boxShadow: "0 0 0 2px var(--arvo-content-theme-dark)", animation: "arvoPulse 1.6s ease-in-out infinite" } : {};

interface MenuItem {
  label: string;
  danger?: boolean;
  onSelect: () => void;
}

/** Kebab (three-dot) overflow menu — keeps destructive actions tucked away. */
function KebabMenu({ items, title }: { items: MenuItem[]; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ color: c.tSecondary, display: "inline-flex" }} title={title ?? "More options"}>
        <IconMoreV width={16} height={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 40 }} onMouseDown={() => setOpen(false)} />
          <div
            className="absolute"
            style={{ top: 24, right: 0, minWidth: 160, background: c.layer01, border: `1px solid ${c.divider}`, borderRadius: R, boxShadow: "var(--arvo-shadow-down)", zIndex: 41, overflow: "hidden" }}
          >
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  it.onSelect();
                }}
                className="flex w-full items-center gap-8 px-12"
                style={{ height: 34, fontSize: 12, textAlign: "left", color: it.danger ? c.negative : c.tPrimary, background: c.layer01, whiteSpace: "nowrap" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = c.layer04)}
                onMouseLeave={(e) => (e.currentTarget.style.background = c.layer01)}
              >
                {it.danger && <IconTrash width={14} height={14} />}
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FieldLabel({
  children,
  required,
  info,
  style,
}: {
  children: ReactNode;
  required?: boolean;
  info?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className="flex items-center gap-4" style={{ marginBottom: 6, color: c.tSecondary, ...style }}>
      <span style={{ fontSize: 12 }}>{children}</span>
      {required && <span style={{ color: c.negative, fontSize: 12 }}>*</span>}
      {info && <IconInfo width={12} height={12} style={{ color: c.tTertiary }} />}
    </div>
  );
}

/* --------------------------------------------------------- confirm modal */

/**
 * Two-step delete safeguard: the trash icon is step one, this modal is the
 * second, explicit confirmation before a guided tour is actually removed.
 */
export function ConfirmDialog({
  open,
  tourName,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  tourName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", zIndex: 1000, fontFamily: "var(--arvo-font-family)" }}
      onMouseDown={onCancel}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: 360, background: c.layer01, borderRadius: 8, boxShadow: "var(--arvo-shadow-down)", padding: 20, color: c.tPrimary }}
      >
        <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
          <span className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 999, background: "var(--arvo-color-s-layer-04)", color: c.negative, flex: "0 0 auto" }}>
            <IconTrash width={16} height={16} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Delete guided tour?</span>
        </div>
        <p style={{ fontSize: 12, lineHeight: "18px", color: c.tTertiary, margin: "0 0 20px" }}>
          You’re about to permanently delete <strong style={{ color: c.tPrimary }}>{tourName}</strong>. This can’t be undone. Are you sure you want to continue?
        </p>
        <div className="flex items-center justify-end gap-8">
          <button type="button" onClick={onCancel} className="px-16" style={{ height: 32, fontSize: 12, color: c.tSecondary, border: `1px solid ${c.form}`, borderRadius: R }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex items-center gap-6 px-16" style={{ height: 32, fontSize: 12, background: c.negative, color: c.tInverse, borderRadius: R }}>
            <IconTrash width={14} height={14} />
            Delete tour
          </button>
        </div>
      </div>
    </div>
  );
}
