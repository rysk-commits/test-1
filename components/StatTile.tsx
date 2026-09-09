import { TrendUpIcon, TrendDownIcon } from "./icons";

export function StatTile({
  label,
  value,
  delta,
  deltaGood,
}: {
  label: string;
  value: string;
  delta?: string | null;
  deltaGood?: boolean;
}) {
  const deltaColor = deltaGood ? "var(--delta-good)" : "var(--status-critical)";
  return (
    <div
      className="rounded-2xl p-4 hover:-translate-y-0.5"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-hairline)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      {delta !== undefined && delta !== null && (
        <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold" style={{ color: deltaColor }}>
          {deltaGood ? <TrendUpIcon width={12} height={12} /> : <TrendDownIcon width={12} height={12} />}
          {delta}
          <span className="font-normal" style={{ color: "var(--text-muted)" }}>
            前月比
          </span>
        </div>
      )}
    </div>
  );
}
