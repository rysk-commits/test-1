"use client";

export interface TooltipRow {
  label: string;
  value: string;
  color: string;
}

export function ChartTooltip({
  x,
  y,
  title,
  rows,
  containerWidth,
}: {
  x: number;
  y: number;
  title: string;
  rows: TooltipRow[];
  containerWidth: number;
}) {
  const flip = x > containerWidth * 0.62;
  return (
    <div
      className="absolute pointer-events-none z-20 rounded-md shadow-lg px-3 py-2 text-xs min-w-[140px]"
      style={{
        left: flip ? undefined : x + 12,
        right: flip ? containerWidth - x + 12 : undefined,
        top: Math.max(0, y - 8),
        background: "var(--card-bg)",
        border: "1px solid var(--border-hairline)",
        color: "var(--text-primary)",
      }}
    >
      <div className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
        {title}
      </div>
      <div className="flex flex-col gap-0.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <span
                className="inline-block w-2.5 h-0.5 rounded-full"
                style={{ background: row.color }}
              />
              {row.label}
            </span>
            <span className="font-semibold tabular-nums">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
