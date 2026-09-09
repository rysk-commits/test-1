"use client";

import type { MonthlyMetric } from "@/lib/types";
import { formatNumber, formatPercent, formatSigned, formatYearMonth } from "@/lib/format";
import { cardStyle, cardClassName } from "./ui";

const COLUMNS: { key: keyof MonthlyMetric; label: string; format: (m: MonthlyMetric) => string }[] = [
  { key: "followerCount", label: "フォロワー数", format: (m) => formatNumber(m.followerCount) },
  { key: "followerNetIncrease", label: "純増", format: (m) => formatSigned(m.followerNetIncrease) },
  { key: "reach", label: "リーチ", format: (m) => formatNumber(m.reach) },
  { key: "pv", label: "PV", format: (m) => formatNumber(m.pv) },
  { key: "followerPercent", label: "フォロワー%", format: (m) => formatPercent(m.followerPercent) },
  { key: "nonFollowerPercent", label: "非フォロワー%", format: (m) => formatPercent(m.nonFollowerPercent) },
  { key: "influencerCount", label: "インフルエンサー人数", format: (m) => formatNumber(m.influencerCount) },
  { key: "influencerEstimatedPv", label: "想定PV", format: (m) => formatNumber(m.influencerEstimatedPv) },
];

export function MetricsTable({
  metrics,
  onEdit,
  onDelete,
}: {
  metrics: MonthlyMetric[];
  onEdit: (metric: MonthlyMetric) => void;
  onDelete: (yearMonth: string) => void;
}) {
  if (metrics.length === 0) {
    return (
      <div
        className={`${cardClassName} p-8 text-center text-sm`}
        style={{ ...cardStyle, color: "var(--text-muted)" }}
      >
        まだデータがありません。上のフォームから追加してください。
      </div>
    );
  }

  const sorted = [...metrics].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));

  return (
    <div className={`${cardClassName} overflow-x-auto`} style={cardStyle}>
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-hairline)" }}>
            <th
              className="text-left font-semibold px-4 py-3 whitespace-nowrap text-xs uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              年月
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className="text-right font-semibold px-4 py-3 whitespace-nowrap text-xs uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((metric) => (
            <tr
              key={metric.yearMonth}
              style={{ borderBottom: "1px solid var(--border-hairline)" }}
              className="hover:[background:var(--page-plane)]"
            >
              <td className="px-4 py-3 whitespace-nowrap font-semibold" style={{ color: "var(--text-primary)" }}>
                {formatYearMonth(metric.yearMonth)}
              </td>
              {COLUMNS.map((col) => (
                <td key={col.key} className="px-4 py-3 text-right whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                  {col.format(metric)}
                </td>
              ))}
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <button
                  onClick={() => onEdit(metric)}
                  className="text-xs px-2.5 py-1 rounded-md mr-1 font-semibold"
                  style={{ color: "var(--brand)", background: "var(--brand-soft)" }}
                >
                  編集
                </button>
                <button
                  onClick={() => onDelete(metric.yearMonth)}
                  className="text-xs px-2.5 py-1 rounded-md font-semibold"
                  style={{ color: "var(--status-critical)" }}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
