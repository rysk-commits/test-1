"use client";

import { useMemo, useRef, useState } from "react";
import { buildTicks, formatCompact, formatYm } from "./chartUtils";
import { ChartTooltip } from "./ChartTooltip";
import { formatYearMonth, formatNumber } from "@/lib/format";

export interface BarPoint {
  yearMonth: string;
  value: number | null;
}

const W = 720;
const H = 220;
const PAD_LEFT = 46;
const PAD_RIGHT = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 26;
const GAP = 2;

export function SimpleBarChart({
  data,
  color,
  seriesLabel,
}: {
  data: BarPoint[];
  color: string;
  seriesLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  const values = data.map((d) => d.value).filter((v): v is number => v !== null);
  const hasData = values.length > 0;
  const maxVal = hasData ? Math.max(...values, 0) : 0;
  const ticks = useMemo(() => buildTicks(Math.max(maxVal, 1), 3), [maxVal]);
  const scaleMax = ticks[ticks.length - 1] || 1;

  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const baseY = PAD_TOP + plotH;

  const bandWidth = data.length > 0 ? plotW / data.length : plotW;
  const barWidth = Math.min(24, Math.max(4, bandWidth - GAP * 2));

  const yFor = (v: number) => baseY - (v / scaleMax) * plotH;

  function handlePointerMove(index: number, e: React.PointerEvent) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setHoverIndex(index);
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center text-sm h-[180px]"
        style={{ color: "var(--text-muted)" }}
      >
        データがありません
      </div>
    );
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div ref={containerRef} className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={seriesLabel}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={yFor(t)} y2={yFor(t)} stroke="var(--gridline)" strokeWidth={1} />
            <text x={PAD_LEFT - 10} y={yFor(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--text-muted)">
              {formatCompact(t)}
            </text>
          </g>
        ))}
        <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={baseY} y2={baseY} stroke="var(--baseline)" strokeWidth={1} />

        {data.map((d, i) => {
          if (d.value === null) return null;
          const cx = PAD_LEFT + bandWidth * i + bandWidth / 2;
          const y = yFor(d.value);
          const barH = baseY - y;
          const isHovered = hoverIndex === i;
          return (
            <g key={d.yearMonth}>
              <rect
                x={cx - barWidth / 2}
                y={y}
                width={barWidth}
                height={Math.max(barH, 1)}
                rx={4}
                fill={color}
                opacity={isHovered ? 0.85 : 1}
              />
              <rect
                x={cx - barWidth / 2 - 6}
                y={PAD_TOP}
                width={barWidth + 12}
                height={plotH}
                fill="transparent"
                onPointerMove={(e) => handlePointerMove(i, e)}
                onPointerLeave={() => {
                  setHoverIndex(null);
                  setMouse(null);
                }}
              />
              {(i % Math.ceil(data.length / 6 || 1) === 0 || i === data.length - 1) && (
                <text x={cx} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
                  {formatYm(d.yearMonth)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hovered && mouse && (
        <ChartTooltip
          x={mouse.x}
          y={mouse.y}
          title={formatYearMonth(hovered.yearMonth)}
          rows={[
            {
              label: seriesLabel,
              value: hovered.value === null ? "—" : formatNumber(hovered.value),
              color,
            },
          ]}
          containerWidth={containerRef.current?.getBoundingClientRect().width ?? W}
        />
      )}
    </div>
  );
}
