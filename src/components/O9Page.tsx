/**
 * Native, editable reconstruction of the o9 (Arvo) workspace pages that back
 * the guided tour — rendered from DOM + design tokens instead of a flat
 * screenshot, so annotations sit on real UI. Three templates form a 3-step
 * workflow: KPI Dashboard → Demand Supportability Analysis → Constraint Summary.
 *
 * Everything lays out inside the 1920×1108 artboard so the annotation overlay
 * coordinates line up with the reconstructed regions.
 */
import type { CSSProperties, ReactNode, SVGProps } from "react";

const t = {
  primary: "var(--arvo-color-t-primary)",
  secondary: "var(--arvo-color-t-secondary)",
  tertiary: "var(--arvo-color-t-tertiary)",
  placeholder: "var(--arvo-color-t-placeholder)",
  inverse: "var(--arvo-color-t-inverse)",
  info: "var(--arvo-color-t-info-dark)",
  negative: "var(--arvo-color-t-negative)",
};
const s = {
  base: "var(--arvo-color-s-base)",
  layer01: "var(--arvo-color-s-layer-01)",
  layer04: "var(--arvo-color-s-layer-04)",
  theme: "var(--arvo-color-s-theme)",
};
const b = {
  divider: "var(--arvo-color-b-divider)",
  form: "var(--arvo-color-b-form)",
};

/** Data-viz palette (not part of the semantic token set). */
const viz = {
  green: "#3f7d63",
  greenSoft: "#7ba894",
  late: "#e3b53e",
  short: "#c0392b",
  purple: "#8e7cc3",
  brown: "#b08d57",
};

const RAIL = 52;
const APPBAR = 46;
const SUBBAR = 40;
/** Right gutter kept clear for the coded Guided Tours panel / dock. */
const RIGHT_GUTTER = 412;

const font = "var(--arvo-font-family)";

/* ---------------------------------------------------------- tiny glyphs */

const g = (p: SVGProps<SVGSVGElement>) => ({
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});
const Hamburger = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
  </svg>
);
const PanelIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
    <path d="M6.5 3v10" />
  </svg>
);
const Funnel = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <path d="M2.5 3.5h11l-4.2 5v4l-2.6 1.3v-5.3L2.5 3.5Z" />
  </svg>
);
const Star = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <path d="M8 2.2l1.8 3.6 4 .6-2.9 2.8.7 4L8 11.9 4.4 13.2l.7-4L2.2 6.4l4-.6L8 2.2Z" />
  </svg>
);
const Share = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <circle cx="12" cy="3.6" r="1.8" />
    <circle cx="4" cy="8" r="1.8" />
    <circle cx="12" cy="12.4" r="1.8" />
    <path d="M10.4 4.6 5.6 7M5.6 9l4.8 2.4" />
  </svg>
);
const Kebab = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g({ fill: "currentColor", stroke: "none", ...p })}>
    <circle cx="8" cy="3" r="1.2" />
    <circle cx="8" cy="8" r="1.2" />
    <circle cx="8" cy="13" r="1.2" />
  </svg>
);
const Back = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <path d="M10 3 5 8l5 5" />
  </svg>
);
const Chevron = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <path d="m6 4 4 4-4 4" />
  </svg>
);
const RailGrid = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
  </svg>
);
const RailMonitor = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <rect x="2" y="3" width="12" height="8" rx="1.5" />
    <path d="M6 14h4M8 11v3" />
  </svg>
);
const RailPeople = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <circle cx="6" cy="6" r="2.2" />
    <path d="M2.5 13c.4-2 1.9-3 3.5-3s3.1 1 3.5 3" />
    <path d="M11 5.2a2 2 0 0 1 0 3.6M11.5 10c1.3.2 2.3 1.1 2.6 2.6" />
  </svg>
);
const RailList = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" />
  </svg>
);

/* --------------------------------------------------------- shared chrome */

/** On-page workflow navigation across the three native o9 pages. */
export interface PageNav {
  index: number;
  onSelect: (i: number) => void;
  locked?: boolean;
}

function Chrome({ title, nav, children }: { title: string; nav?: PageNav; children: ReactNode }) {
  return (
    <div className="absolute inset-0" style={{ background: s.base, fontFamily: font, color: t.primary, overflow: "hidden" }}>
      {/* app bar */}
      <div className="flex items-center" style={{ height: APPBAR, background: s.layer01, borderBottom: `1px solid ${b.divider}` }}>
        <div className="flex items-center justify-center" style={{ width: APPBAR, height: APPBAR, background: s.theme, color: t.inverse, fontWeight: 700, fontSize: 18, flex: "0 0 auto" }}>
          o9
        </div>
        <button type="button" className="flex items-center justify-center" style={{ width: 40, height: APPBAR, color: t.secondary }}>
          <Back width={18} height={18} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 500 }}>{title}</span>
        <div className="flex items-center gap-16" style={{ marginLeft: "auto", paddingRight: 16, color: t.secondary }}>
          <BellGlyph />
          <RefreshGlyph />
          <GridGlyph />
          <GearGlyph />
          <div className="flex items-center gap-6 px-10" style={{ height: 28, border: `1px solid ${b.divider}`, borderRadius: 6, fontSize: 12, color: t.secondary }}>
            Apex - Next…
            <Chevron width={12} height={12} style={{ transform: "rotate(90deg)" }} />
          </div>
          <span className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 999, background: s.theme, color: t.inverse, fontSize: 11, fontWeight: 600 }}>
            AM
          </span>
        </div>
      </div>

      {/* sub toolbar */}
      <div className="flex items-center gap-16 px-12" style={{ height: SUBBAR, background: s.layer01, borderBottom: `1px solid ${b.divider}`, color: t.secondary }}>
        <Hamburger width={16} height={16} />
        <PanelIcon width={16} height={16} />
        <Funnel width={16} height={16} />
        <FilterChip label="Item" pill="(All)" count="334" />
        <FilterChip label="Location" pill="(All)" count="104" />
        <div className="flex items-center gap-8 px-8" style={{ height: 26, fontSize: 12 }}>
          <span style={{ color: t.tertiary }}>Version Name</span>
          <span style={{ color: t.primary, fontWeight: 500 }}>CurrentWorkingView</span>
          <Chevron width={12} height={12} />
        </div>
        <div className="flex items-center gap-16" style={{ marginLeft: "auto" }}>
          <Star width={16} height={16} />
          <Share width={16} height={16} />
          <Kebab width={16} height={16} />
          <Funnel width={16} height={16} />
        </div>
      </div>

      {/* rail + content */}
      <div className="flex" style={{ height: `calc(100% - ${APPBAR + SUBBAR}px)` }}>
        <div className="flex flex-col items-center" style={{ width: RAIL, background: s.layer01, borderRight: `1px solid ${b.divider}`, paddingTop: 16, color: t.secondary, flex: "0 0 auto" }}>
          <RailBtn active><RailGrid width={20} height={20} /></RailBtn>
          <RailBtn><RailMonitor width={20} height={20} /></RailBtn>
          <RailBtn><RailPeople width={20} height={20} /></RailBtn>
          <div style={{ marginTop: "auto", paddingBottom: 16 }}>
            <RailBtn><RailList width={20} height={20} /></RailBtn>
          </div>
        </div>
        <div className="arvo-scroll" style={{ flex: 1, minWidth: 0, marginRight: RIGHT_GUTTER, padding: "24px 28px", overflow: "hidden" }}>
          {nav && <PageTabs nav={nav} />}
          {children}
        </div>
      </div>
    </div>
  );
}

/** Segmented page switcher shown at the top of each o9 workflow page. */
function PageTabs({ nav }: { nav: PageNav }) {
  return (
    <div className="flex items-center gap-8" style={{ marginBottom: 20 }}>
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", color: t.tertiary, marginRight: 4 }}>WORKFLOW</span>
      <div className="flex items-center" style={{ background: s.layer01, border: `1px solid ${b.divider}`, borderRadius: 8, padding: 3, gap: 2 }}>
        {TITLES.map((title, i) => {
          const on = i === nav.index;
          const disabled = !!nav.locked && !on;
          return (
            <button
              key={title}
              type="button"
              onClick={() => (disabled ? undefined : nav.onSelect(i))}
              disabled={disabled}
              className="flex items-center gap-6 px-10"
              style={{
                height: 28,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: on ? 500 : 400,
                background: on ? s.theme : "transparent",
                color: on ? t.inverse : disabled ? t.placeholder : t.secondary,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.55 : 1,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 10, opacity: on ? 0.8 : 0.6 }}>{i + 1}</span>
              {title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const BellGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <path d="M4.5 7a3.5 3.5 0 0 1 7 0c0 3 1 4 1 4h-9s1-1 1-4Z" />
    <path d="M6.8 13a1.4 1.4 0 0 0 2.4 0" />
  </svg>
);
const RefreshGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <path d="M13 5a5 5 0 1 0 .6 5" />
    <path d="M13 2.5V5h-2.5" />
  </svg>
);
const GridGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g({ fill: "currentColor", stroke: "none", ...p })}>
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
);
const GearGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M12.5 3.5l-1.1 1.1M4.6 11.4l-1.1 1.1" />
  </svg>
);

function RailBtn({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: 36, height: 36, borderRadius: 8, marginBottom: 8, color: active ? t.primary : t.tertiary, background: active ? s.layer04 : "transparent" }}
    >
      {children}
    </div>
  );
}

function FilterChip({ label, pill, count }: { label: string; pill: string; count: string }) {
  return (
    <div className="flex items-center gap-6" style={{ height: 26, fontSize: 12 }}>
      <span style={{ color: t.tertiary }}>{label}</span>
      <span className="px-6" style={{ height: 20, lineHeight: "20px", background: s.layer04, borderRadius: 4, color: t.secondary, fontSize: 11 }}>{pill}</span>
      <span style={{ color: t.primary, fontWeight: 500 }}>{count}</span>
    </div>
  );
}

function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ fontSize: 18, fontWeight: 500, color: t.primary, margin: "0 0 14px", ...style }}>{children}</div>;
}

function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: s.layer01, border: `1px solid ${b.divider}`, borderRadius: 8, ...style }}>{children}</div>
  );
}

function PanelHead({ title, tabs, right }: { title: ReactNode; tabs?: string[]; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-16 px-16" style={{ height: 44, borderBottom: `1px solid ${b.divider}` }}>
      <span className="flex items-center gap-8" style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
      {tabs && (
        <div className="flex items-center gap-14" style={{ fontSize: 12, color: t.tertiary }}>
          {tabs.map((tab, i) => (
            <span key={tab} style={{ color: i === 0 ? t.primary : t.tertiary, fontWeight: i === 0 ? 500 : 400, borderBottom: i === 0 ? `2px solid ${s.theme}` : "none", paddingBottom: 2 }}>
              {tab}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-12" style={{ marginLeft: "auto", color: t.tertiary }}>{right}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ kpis */

function Kpi({ label, value, sub }: { label: string; value: string; sub?: ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: s.layer01, border: `1px solid ${b.divider}`, borderRadius: 8, padding: "16px 18px", height: 132 }}>
      <div style={{ fontSize: 13, color: t.tertiary, marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 500, color: t.primary, letterSpacing: "-0.01em" }}>{value}</div>
      {sub && <div style={{ marginTop: 14 }}>{sub}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- charts */

function BarChart({ data, height = 210 }: { data: { met: number; late?: number; short?: number; label: string }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.met + (d.late ?? 0) + (d.short ?? 0)));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, padding: "0 4px" }}>
      {data.map((d, i) => {
        const total = d.met + (d.late ?? 0) + (d.short ?? 0);
        const h = (total / max) * (height - 26);
        return (
          <div key={i} className="flex flex-col items-center" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ width: "70%", maxWidth: 22, height: h, display: "flex", flexDirection: "column", justifyContent: "flex-end", borderRadius: "2px 2px 0 0", overflow: "hidden" }}>
              {d.short ? <div style={{ height: (d.short / total) * h, background: viz.short }} /> : null}
              {d.late ? <div style={{ height: (d.late / total) * h, background: viz.late }} /> : null}
              <div style={{ height: (d.met / total) * h, background: viz.green }} />
            </div>
            <span style={{ fontSize: 8, color: t.tertiary, marginTop: 6, transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-16" style={{ fontSize: 11, color: t.tertiary }}>
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-6">
          <span style={{ width: 10, height: 10, borderRadius: 2, background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function Donut({ total, segments }: { total: number; segments: { value: number; color: string; label: string }[] }) {
  const sum = segments.reduce((a, x) => a + x.value, 0) || 1;
  const R = 15.915;
  let offset = 25; // start at top
  return (
    <div className="flex items-center" style={{ gap: 24 }}>
      <svg viewBox="0 0 42 42" width={200} height={200}>
        <circle cx="21" cy="21" r={R} fill="none" stroke={s.layer04} strokeWidth="6" />
        {segments.map((seg, i) => {
          const pct = (seg.value / sum) * 100;
          const el = (
            <circle
              key={i}
              cx="21"
              cy="21"
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="6"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={offset}
            />
          );
          offset -= pct;
          return el;
        })}
        <text x="21" y="20" textAnchor="middle" style={{ fontSize: 3.2, fill: t.tertiary }}>Total</text>
        <text x="21" y="25" textAnchor="middle" style={{ fontSize: 6, fontWeight: 600, fill: t.primary }}>{total}</text>
      </svg>
      <div className="flex flex-col gap-10">
        {segments.map((seg) => (
          <span key={seg.label} className="flex items-center gap-8" style={{ fontSize: 12, color: t.secondary }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: seg.color }} />
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- table */

function Table({ columns, rows, empty }: { columns: string[]; rows?: (ReactNode)[][]; empty?: string }) {
  return (
    <div>
      <div className="flex" style={{ borderBottom: `1px solid ${b.divider}`, background: s.layer04 }}>
        {columns.map((col, i) => (
          <div key={col} style={{ flex: i === 0 ? "0 0 44px" : 1, minWidth: 0, padding: "10px 12px", fontSize: 11, fontWeight: 600, color: t.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {i === 0 ? <span style={{ display: "inline-block", width: 14, height: 14, border: `1px solid ${b.form}`, borderRadius: 3 }} /> : col}
          </div>
        ))}
      </div>
      {empty ? (
        <div className="flex items-center gap-8 px-12" style={{ height: 44, fontSize: 12, color: t.negative }}>
          <span style={{ fontSize: 13 }}>⚠</span>
          {empty}
        </div>
      ) : (
        rows?.map((row, r) => (
          <div key={r} className="flex" style={{ borderBottom: `1px solid ${b.divider}` }}>
            {row.map((cell, i) => (
              <div key={i} style={{ flex: i === 0 ? "0 0 44px" : 1, minWidth: 0, padding: "12px", fontSize: 12, color: t.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {i === 0 ? <span style={{ display: "inline-block", width: 14, height: 14, border: `1px solid ${b.form}`, borderRadius: 3 }} /> : cell}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------- page 1/0 */

const barData = [
  { label: "M07-26", met: 3.4, short: 1.1 },
  { label: "M08-26", met: 6.9 },
  { label: "M09-26", met: 7.1 },
  { label: "M10-26", met: 4.2 },
  { label: "M11-26", met: 3.6 },
  { label: "M12-26", met: 3.5 },
  { label: "M01-27", met: 4.0 },
  { label: "M02-27", met: 3.4 },
  { label: "M03-27", met: 4.3 },
  { label: "M04-27", met: 3.4 },
  { label: "M05-27", met: 5.4 },
  { label: "M06-27", met: 5.9 },
  { label: "M07-27", met: 6.0 },
  { label: "M08-27", met: 7.0 },
  { label: "M09-27", met: 4.6 },
  { label: "M10-27", met: 4.2 },
  { label: "M11-27", met: 3.3 },
  { label: "M12-27", met: 4.1 },
];

function KpiDashboard() {
  return (
    <>
      <SectionLabel>Metrics</SectionLabel>
      <div className="flex gap-12" style={{ marginBottom: 24 }}>
        <Kpi label="Demand Supportability" value="98.77%" />
        <Kpi label="Total Production Volume" value="63 K" />
        <Kpi label="Total Production Orders" value="6" sub={<span style={{ fontSize: 11, color: t.tertiary }}>Pending Approval</span>} />
        <Kpi label="Total Purchase Orders" value="404" sub={<span style={{ fontSize: 11, color: t.tertiary }}>Pending Approval</span>} />
        <Kpi label="Projected Lost Sales" value="$ 18.4 K" />
        <Kpi
          label="Current Period Days of Su…"
          value="10"
          sub={<div style={{ height: 4, background: s.layer04, borderRadius: 999 }}><div style={{ width: "62%", height: 4, background: s.theme, borderRadius: 999 }} /></div>}
        />
      </div>

      <SectionLabel>Plan Summary</SectionLabel>
      <div className="flex gap-16" style={{ marginBottom: 24 }}>
        <Panel style={{ flex: "1.35 1 0", minWidth: 0 }}>
          <PanelHead
            title={<><ChartMark /> Demand Supportability</>}
            right={<><span style={{ fontSize: 12, color: t.tertiary }}>Cumulative</span><span style={{ fontSize: 12 }}>Time: <b style={{ color: t.primary }}>PM</b></span></>}
          />
          <div style={{ padding: 16 }}>
            <BarChart data={barData} />
            <div style={{ marginTop: 12 }}>
              <Legend items={[{ color: viz.green, label: "Met On Time Quantity" }, { color: viz.late, label: "Late Quantity" }, { color: viz.short, label: "Short Quantity" }]} />
            </div>
          </div>
        </Panel>
        <Panel style={{ flex: "1 1 0", minWidth: 0 }}>
          <PanelHead title={<>Current Inventory</>} tabs={["Current Inventory", "Current Inventory Alert"]} />
          <div className="flex flex-col items-center justify-center" style={{ padding: "24px 16px" }}>
            <Donut total={3} segments={[{ value: 1, color: viz.purple, label: "On Target" }, { value: 2, color: viz.brown, label: "Excess Stock" }]} />
          </div>
        </Panel>
      </div>

      <SectionLabel>Exceptions</SectionLabel>
      <div className="flex gap-16">
        <Panel style={{ flex: 1, minWidth: 0 }}>
          <PanelHead title="Top 5 Capacity Exceptions" right={<><DownloadMark /> Filters</>} />
          <Table
            columns={["", "Actions", "Constraint Resource", "Constraint Location", "Capacity Short"]}
            rows={[
              ["", <Kebab width={14} height={14} />, "Extruder Line 2", "Italy Plant", <span style={{ color: t.negative }}>512</span>],
              ["", <Kebab width={14} height={14} />, "Molding Cell 4", "Spain DC", <span style={{ color: t.negative }}>318</span>],
              ["", <Kebab width={14} height={14} />, "Assembly Line 1", "France DC", <span style={{ color: "#8a6510" }}>205</span>],
              ["", <Kebab width={14} height={14} />, "Packaging Unit 3", "Germany Plant", <span style={{ color: "#8a6510" }}>134</span>],
              ["", <Kebab width={14} height={14} />, "Curing Oven 2", "Poland DC", "72"],
            ]}
          />
        </Panel>
        <Panel style={{ flex: 1, minWidth: 0 }}>
          <PanelHead title="Top 5 Material Exceptions" right={<><DownloadMark /> Filters</>} />
          <Table
            columns={["", "Actions", "Constraint Item", "Constraint Location", "Material Constraint Qty", "Demand Late Short Qty"]}
            rows={[["", <Kebab width={14} height={14} />, "PACK Bag 6.5 …", "Italy Plant", "838", "838"]]}
          />
        </Panel>
      </div>
    </>
  );
}

const ChartMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...g(p)} width={14} height={14}>
    <path d="M2 13V3M2 13h11M4.5 11V7M7.5 11V5M10.5 11V8" />
  </svg>
);
const DownloadMark = () => (
  <span className="flex items-center gap-4" style={{ fontSize: 12, color: t.tertiary }}>
    <svg {...g({})} width={14} height={14}><path d="M8 10V3M5 6l3 3 3-3M3 12h10" /></svg>
    Download
  </span>
);

/* ----------------------------------------------- page 2: demand analysis */

const analysisData = [
  { label: "M07-26", met: 4.1, late: 0.8, short: 1.2 },
  { label: "M08-26", met: 6.4, late: 0.6 },
  { label: "M09-26", met: 6.9, late: 0.4 },
  { label: "M10-26", met: 5.2, late: 0.9, short: 0.4 },
  { label: "M11-26", met: 4.6, late: 0.5 },
  { label: "M12-26", met: 4.9 },
  { label: "M01-27", met: 5.3, late: 0.7 },
  { label: "M02-27", met: 4.4, short: 0.6 },
  { label: "M03-27", met: 5.1, late: 0.5 },
  { label: "M04-27", met: 4.8 },
  { label: "M05-27", met: 6.0, late: 0.8 },
  { label: "M06-27", met: 6.3 },
];

function DemandAnalysis() {
  return (
    <>
      <SectionLabel>Demand Supportability Analysis</SectionLabel>
      <div className="flex gap-12" style={{ marginBottom: 24 }}>
        <Kpi label="Demand Supported" value="98.77%" sub={<span style={{ fontSize: 11, color: viz.green }}>▲ 1.2% vs plan</span>} />
        <Kpi label="Late Quantity" value="12.4 K" sub={<span style={{ fontSize: 11, color: viz.late }}>Within tolerance</span>} />
        <Kpi label="Short Quantity" value="3.1 K" sub={<span style={{ fontSize: 11, color: t.negative }}>▼ Needs action</span>} />
        <Kpi label="At-Risk Revenue" value="$ 18.4 K" />
      </div>

      <div className="flex gap-16" style={{ marginBottom: 24 }}>
        <Panel style={{ flex: "1.4 1 0", minWidth: 0 }}>
          <PanelHead title={<><ChartMark /> Supportability by Period</>} right={<><span style={{ fontSize: 12, color: t.tertiary }}>Time: <b style={{ color: t.primary }}>PM</b></span></>} />
          <div style={{ padding: 16 }}>
            <BarChart data={analysisData} height={230} />
            <div style={{ marginTop: 12 }}>
              <Legend items={[{ color: viz.green, label: "Met On Time" }, { color: viz.late, label: "Late" }, { color: viz.short, label: "Short" }]} />
            </div>
          </div>
        </Panel>
        <Panel style={{ flex: "1 1 0", minWidth: 0 }}>
          <PanelHead title="Fulfillment Split" />
          <div className="flex flex-col items-center justify-center" style={{ padding: "24px 16px" }}>
            <Donut total={100} segments={[{ value: 88, color: viz.green, label: "On Time (88%)" }, { value: 9, color: viz.late, label: "Late (9%)" }, { value: 3, color: viz.short, label: "Short (3%)" }]} />
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHead title="Supportability by Item" right={<><DownloadMark /> Filters</>} />
        <Table
          columns={["", "Item", "Location", "Demand Qty", "Supported Qty", "Gap %"]}
          rows={[
            ["", "PACK Bag 6.5 in", "Italy Plant", "4,210", "3,372", <span style={{ color: t.negative }}>19.9%</span>],
            ["", "Resin Compound A", "Spain DC", "2,980", "2,980", <span style={{ color: viz.green }}>0.0%</span>],
            ["", "Cap Assembly 12", "Italy Plant", "1,640", "1,522", <span style={{ color: viz.late }}>7.2%</span>],
            ["", "Label Roll STD", "France DC", "980", "980", <span style={{ color: viz.green }}>0.0%</span>],
          ]}
        />
      </Panel>
    </>
  );
}

/* ---------------------------------------------- page 3: constraint summary */

function ConstraintSummary() {
  return (
    <>
      <SectionLabel>Constraint Summary View</SectionLabel>
      <div className="flex gap-12" style={{ marginBottom: 24 }}>
        <Kpi label="Total Constraints" value="14" />
        <Kpi label="Critical" value="3" sub={<span style={{ fontSize: 11, color: t.negative }}>Immediate review</span>} />
        <Kpi label="Resolved" value="8" sub={<span style={{ fontSize: 11, color: viz.green }}>On track</span>} />
        <Kpi label="Revenue at Risk" value="$ 18.4 K" />
      </div>

      <div className="flex gap-16" style={{ marginBottom: 24 }}>
        <Panel style={{ flex: "1 1 0", minWidth: 0 }}>
          <PanelHead title="Constraints by Type" />
          <div className="flex flex-col items-center justify-center" style={{ padding: "24px 16px" }}>
            <Donut total={14} segments={[{ value: 6, color: viz.purple, label: "Material (6)" }, { value: 5, color: viz.brown, label: "Capacity (5)" }, { value: 3, color: viz.short, label: "Logistics (3)" }]} />
          </div>
        </Panel>
        <Panel style={{ flex: "1.4 1 0", minWidth: 0 }}>
          <PanelHead title="Impact by Location" right={<><ChartMark /> By revenue</>} />
          <div style={{ padding: 16 }}>
            <BarChart
              height={230}
              data={[
                { label: "Italy", met: 6.4, short: 1.8 },
                { label: "Spain", met: 4.2 },
                { label: "France", met: 3.1, late: 0.6 },
                { label: "Germany", met: 2.4 },
                { label: "Poland", met: 1.5, short: 0.4 },
              ]}
            />
            <div style={{ marginTop: 12 }}>
              <Legend items={[{ color: viz.green, label: "Resolved impact" }, { color: viz.late, label: "In progress" }, { color: viz.short, label: "Open impact" }]} />
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHead title="Constraint Detail" right={<><DownloadMark /> Filters</>} />
        <Table
          columns={["", "Constraint Resource", "Location", "Constraint Qty", "Revenue Impact", "Status"]}
          rows={[
            ["", "PACK Bag 6.5 in", "Italy Plant", "838", "$ 18,431", <StatusPill tone="crit" label="Critical" />],
            ["", "Extruder Line 2", "Spain DC", "512", "$ 9,120", <StatusPill tone="warn" label="In Progress" />],
            ["", "Inbound Resin", "France DC", "0", "$ 0", <StatusPill tone="ok" label="Resolved" />],
            ["", "Cap Molding 4", "Italy Plant", "264", "$ 4,050", <StatusPill tone="warn" label="In Progress" />],
          ]}
        />
      </Panel>
    </>
  );
}

function StatusPill({ tone, label }: { tone: "crit" | "warn" | "ok"; label: string }) {
  const map = {
    crit: { bg: "#fbe7e9", fg: t.negative },
    warn: { bg: "#fbf1dc", fg: "#8a6510" },
    ok: { bg: "#e7f2ec", fg: viz.green },
  }[tone];
  return (
    <span className="px-8" style={{ height: 20, lineHeight: "20px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: map.bg, color: map.fg }}>
      {label}
    </span>
  );
}

/* --------------------------------------------------------------- export */

const TITLES = ["KPI Dashboard", "Demand Supportability Analysis", "Constraint Summary View"];

/** Renders the editable o9 page for a given workflow index (0, 1, or 2). */
export function O9Page({ index, nav }: { index: number; nav?: PageNav }) {
  const body = index === 1 ? <DemandAnalysis /> : index === 2 ? <ConstraintSummary /> : <KpiDashboard />;
  return (
    <Chrome title={TITLES[index] ?? TITLES[0]} nav={nav}>
      {body}
    </Chrome>
  );
}

/** True when a native editable page exists for this workflow index. */
export function hasO9Page(index: number) {
  return index >= 0 && index <= 2;
}
