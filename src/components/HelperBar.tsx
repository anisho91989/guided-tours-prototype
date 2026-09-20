/**
 * Small reviewer nudge pinned to the viewport (outside the scaled stage),
 * shown only while the Guided Tours panel is closed.
 */
export function HelperBar({ panelOpen }: { panelOpen: boolean }) {
  if (panelOpen) return null;
  return (
    <div
      className="fixed left-1/2 bottom-16 z-50 flex -translate-x-1/2 items-center gap-12 rounded-16 px-16 py-8"
      style={{
        background: "var(--arvo-color-s-layer-02)",
        color: "var(--arvo-color-t-inverse)",
        boxShadow: "var(--arvo-shadow-down)",
      }}
    >
      <span className="text-l10-r" style={{ opacity: 0.85 }}>
        Click the ▷ Guided Tours button on the right rail to open →
      </span>
    </div>
  );
}
