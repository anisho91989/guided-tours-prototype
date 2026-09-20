import { useState } from "react";
import { Stage } from "./components/Stage";
import { RightRailToggle } from "./components/RightRailToggle";
import { GuidedToursPanel, ConfirmDialog, type AnnotationHandlers } from "./components/GuidedToursPanel";
import { CanvasOverlay } from "./components/CanvasOverlay";
import { O9Page, hasO9Page } from "./components/O9Page";
import { PagePlaceholder } from "./components/PagePlaceholder";
import { HelperBar } from "./components/HelperBar";
import {
  DOCK,
  EMPTY_FORM,
  PAGES,
  UNASSIGNED_PAGE,
  newAnnotation,
  type Annotation,
  type DraftForm,
  type PanelView,
  type Tour,
  type TourMode,
} from "./types";

export default function App() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState<PanelView>("empty");
  const [form, setForm] = useState<DraftForm>(EMPTY_FORM);
  const [tours, setTours] = useState<Tour[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHints] = useState(false);

  // Tour editing
  const [mode, setMode] = useState<TourMode>("edit");
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [openPage, setOpenPage] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnn, setActiveAnn] = useState<string | null>(null);

  // Preview player — 0-based index of the step currently being walked through.
  const [previewStep, setPreviewStep] = useState(0);

  // Pending guided-tour deletion awaiting the second (modal) confirmation.
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Page navigation is locked while an unsaved annotation is being authored.
  const lockNav = activeAnn !== null && annotations.some((a) => a.id === activeAnn && !a.saved);

  const togglePanel = () => setPanelOpen((o) => !o);

  const persist = (anns: Annotation[]) => {
    if (activeTourId) setTours((prev) => prev.map((t) => (t.id === activeTourId ? { ...t, annotations: anns } : t)));
  };

  // ---- funnel
  const startCreate = () => setView("create");
  const cancelCreate = () => {
    setForm(EMPTY_FORM);
    setView(tours.length > 0 ? "saved" : "empty");
  };
  const addTour = () => {
    const tour: Tour = { id: String(Date.now()), ...form, published: false, annotations: [] };
    setTours((prev) => [tour, ...prev]);
    setForm(EMPTY_FORM);
    setView("saved");
  };

  // ---- open a tour (resume from last saved step when editing)
  const openTour = (id: string, m: TourMode) => {
    const tour = tours.find((t) => t.id === id);
    const anns = tour?.annotations ?? [];
    setActiveTourId(id);
    setAnnotations(anns);
    setMode(m);
    if (m === "edit") {
      const last = anns[anns.length - 1];
      setOpenPage(last && last.page >= 0 ? last.page : 0);
      setActiveAnn(last ? last.id : null);
    } else {
      const first = anns[0];
      setPreviewStep(0);
      setOpenPage(first && first.page >= 0 ? first.page : 0);
      setActiveAnn(first ? first.id : null);
    }
    setView("outline");
  };

  const backToSaved = () => {
    persist(annotations);
    setView("saved");
    setOpenPage(null);
    setActiveAnn(null);
  };
  const togglePage = (i: number) => {
    if (lockNav) return;
    setOpenPage((cur) => (cur === i ? null : i));
  };
  // On-page workflow switch across the native o9 pages.
  const goToPage = (i: number) => {
    if (lockNav) return;
    setActiveAnn(null);
    setOpenPage(i);
  };

  const annHandlers: AnnotationHandlers = {
    add: () => {
      // First annotation adopts the open page; every subsequent one resets the
      // page selection so the previously used page isn't pinned/auto-selected.
      const page = annotations.length === 0 ? openPage ?? 0 : UNASSIGNED_PAGE;
      const a = newAnnotation(String(Date.now()), page);
      setAnnotations((prev) => {
        const next = [...prev, a];
        persist(next);
        return next;
      });
      setActiveAnn(a.id);
    },
    remove: (id) => {
      setAnnotations((prev) => {
        const next = prev.filter((a) => a.id !== id);
        persist(next);
        return next;
      });
      setActiveAnn((cur) => (cur === id ? null : cur));
    },
    update: (id, patch) => {
      setAnnotations((prev) => {
        const next = prev.map((a) => (a.id === id ? { ...a, ...patch } : a));
        persist(next);
        return next;
      });
    },
  };

  const editAnnotation = (id: string) => setActiveAnn(id);
  const saveAnnotation = (id: string) => {
    setAnnotations((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, saved: true } : a));
      persist(next);
      return next;
    });
    setActiveAnn(null);
  };
  // Reassign an annotation to a different workflow page and render that page.
  const setAnnotationPage = (id: string, page: number) => {
    annHandlers.update(id, { page });
    setOpenPage(page);
  };

  // ---- preview player: sequential navigation across the ordered steps
  const goToStep = (i: number) => {
    const clamped = Math.max(0, Math.min(annotations.length - 1, i));
    const a = annotations[clamped];
    if (!a) return;
    setPreviewStep(clamped);
    setOpenPage(a.page >= 0 ? a.page : 0);
    setActiveAnn(a.id);
  };
  const exitPreview = () => backToSaved();
  const previewNext = () => {
    if (previewStep >= annotations.length - 1) exitPreview();
    else goToStep(previewStep + 1);
  };
  const previewPrev = () => goToStep(previewStep - 1);
  const previewJump = (id: string) => {
    const idx = annotations.findIndex((a) => a.id === id);
    if (idx >= 0) goToStep(idx);
  };

  const publish = () => {
    if (activeTourId) setTours((prev) => prev.map((t) => (t.id === activeTourId ? { ...t, annotations, published: true } : t)));
    setView("saved");
    setOpenPage(null);
    setActiveAnn(null);
  };

  // ---- delete a guided tour (two-step: trash icon -> modal confirm)
  const requestDeleteTour = (id: string) => setDeleteTargetId(id);
  const cancelDeleteTour = () => setDeleteTargetId(null);
  const confirmDeleteTour = () => {
    const id = deleteTargetId;
    if (!id) return;
    const remaining = tours.filter((t) => t.id !== id);
    setTours(remaining);
    if (id === activeTourId) {
      setActiveTourId(null);
      setAnnotations([]);
      setOpenPage(null);
      setActiveAnn(null);
    }
    setView(remaining.length > 0 ? "saved" : "empty");
    setDeleteTargetId(null);
  };

  // ---- current page / backdrop
  const inPage = view === "outline" && openPage !== null;
  const activeTour = tours.find((t) => t.id === activeTourId);
  const pageAnns = inPage ? annotations.filter((a) => a.page === openPage || a.page === UNASSIGNED_PAGE) : [];
  const deleteTarget = tours.find((t) => t.id === deleteTargetId);

  return (
    <div className="h-full w-full">
      <Stage>
        {inPage && !hasO9Page(openPage!) ? (
          <PagePlaceholder name={PAGES[openPage!]} />
        ) : (
          // Native o9 page everywhere — index 0 acts as the ambient home screen.
          <O9Page
            index={inPage ? openPage! : 0}
            nav={
              inPage && hasO9Page(openPage!) && mode === "edit"
                ? { index: openPage!, onSelect: goToPage, locked: lockNav }
                : undefined
            }
          />
        )}

        {/* Draggable on-canvas guided-tour overlays for the current page */}
        {panelOpen && inPage && (
          <CanvasOverlay
            annotations={pageAnns}
            activeId={activeAnn}
            onMove={annHandlers.update}
            readOnly={mode === "preview"}
            player={
              mode === "preview" && activeAnn
                ? {
                    activeId: activeAnn,
                    index: previewStep + 1,
                    total: annotations.length,
                    onPrev: previewPrev,
                    onNext: previewNext,
                    onExit: exitPreview,
                  }
                : undefined
            }
          />
        )}

        {/* Cover the design's baked-in panel so the dock reads as "closed". */}
        <div
          className="absolute"
          style={{ left: DOCK.left, top: DOCK.top, width: DOCK.width, height: DOCK.height, background: "var(--arvo-color-s-base)" }}
        />

        {panelOpen && (
          <GuidedToursPanel
            view={view}
            mode={mode}
            showHints={showHints}
            onClose={() => setPanelOpen(false)}
            form={form}
            setForm={setForm}
            tours={tours}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onStartCreate={startCreate}
            onCancel={cancelCreate}
            onAdd={addTour}
            onOpenTour={(id) => openTour(id, "edit")}
            onPreviewTour={(id) => openTour(id, "preview")}
            activeTourId={activeTourId}
            onRequestDeleteTour={requestDeleteTour}
            tourName={activeTour?.name ?? "Guided tour"}
            onBackToSaved={backToSaved}
            openPage={openPage}
            onTogglePage={togglePage}
            annotations={annotations}
            annHandlers={annHandlers}
            activeAnn={activeAnn}
            onEditAnnotation={editAnnotation}
            onSaveAnnotation={saveAnnotation}
            onSetAnnotationPage={setAnnotationPage}
            onPreviewJump={previewJump}
            navLocked={lockNav}
            onPublish={publish}
          />
        )}

        <RightRailToggle active={panelOpen} showHints={showHints} onClick={togglePanel} />
      </Stage>

      <HelperBar panelOpen={panelOpen} />

      <ConfirmDialog
        open={deleteTargetId !== null}
        tourName={deleteTarget?.name || deleteTarget?.workflow || "this guided tour"}
        onConfirm={confirmDeleteTour}
        onCancel={cancelDeleteTour}
      />
    </div>
  );
}
