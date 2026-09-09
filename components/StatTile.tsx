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
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-hairline)",
      }}
    >
      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      {delta !== undefined && delta !== null && (
        <div
          className="mt-1 text-xs font-medium"
          style={{ color: deltaGood ? "var(--delta-good)" : "var(--status-critical)" }}
        >
          {delta}
          <span style={{ color: "var(--text-muted)" }}> (前月比)</span>
        </div>
      )}
    </div>
  );
}
