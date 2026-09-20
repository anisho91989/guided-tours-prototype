/**
 * Shown in the left workspace pane when a selected workflow page has no captured
 * Figma backdrop in this prototype. It confirms the page selection took effect
 * and still lets annotations be placed and dragged on top.
 */
export function PagePlaceholder({ name }: { name: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: "var(--arvo-color-s-base)", fontFamily: "var(--arvo-font-family)" }}
    >
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: 520,
          padding: 40,
          background: "var(--arvo-color-s-layer-01)",
          border: "1px solid var(--arvo-color-b-divider)",
          borderRadius: 16,
          textAlign: "center",
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{ width: 64, height: 64, borderRadius: 999, background: "var(--arvo-color-s-layer-04)", color: "var(--arvo-color-t-tertiary)", marginBottom: 20 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M3 9h18M8 18v2M16 18v2M6 22h12" />
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 500, color: "var(--arvo-color-t-primary)", marginBottom: 8 }}>{name}</div>
        <div style={{ fontSize: 13, color: "var(--arvo-color-t-tertiary)", maxWidth: 360, lineHeight: "20px" }}>
          Workflow page selected. A captured screenshot for this page isn’t included in this
          prototype — annotations you place here will still save and can be dragged into position.
        </div>
      </div>
    </div>
  );
}
