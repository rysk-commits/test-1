export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 hover:-translate-y-0.5"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-hairline)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="mb-4">
        <h3 className="text-[13.5px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
