"use client";

import { useMemo, useRef, useState } from "react";
import { buildTicks, formatYm } from "./chartUtils";
import { ChartTooltip } from "./ChartTooltip";
import { formatYearMonth, formatSigned } from "@/lib/format";

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

export function DivergingBarChart({
  data,
  positiveColor,
  negativeColor,
  seriesLabel,
}: {
  data: BarPoint[];
  positiveColor: string;
  negativeColor: string;
  seriesLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  const values = data.map((d) => d.value).filter((v): v is number => v !== null);
  const hasData = values.length > 0;
  const maxAbs = hasData ? Math.max(...values.map((v) => Math.abs(v)), 1) : 1;
  const ticks = useMemo(() => buildTicks(maxAbs, 2), [maxAbs]);
  const scaleMax = ticks[ticks.length - 1] || 1;

  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const zeroY = PAD_TOP + plotH / 2;

  const bandWidth = data.length > 0 ? plotW / data.length : plotW;
  const barWidth = Math.min(24, Math.max(4, bandWidth - GAP * 2));

  const yFor = (v: number) => zeroY - (v / scaleMax) * (plotH / 2);

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
        {ticks.map((t) =>
          t === 0 ? null : (
            <g key={t}>
              <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={yFor(t)} y2={yFor(t)} stroke="var(--gridline)" strokeWidth={1} />
              <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={yFor(-t)} y2={yFor(-t)} stroke="var(--gridline)" strokeWidth={1} />
            </g>
          )
        )}
        <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={zeroY} y2={zeroY} stroke="var(--baseline)" strokeWidth={1} />

        {data.map((d, i) => {
          if (d.value === null) return null;
          const cx = PAD_LEFT + bandWidth * i + bandWidth / 2;
          const y = yFor(d.value);
          const isPositive = d.value >= 0;
          const barY = isPositive ? y : zeroY;
          const barH = Math.abs(zeroY - y);
          const color = isPositive ? positiveColor : negativeColor;
          const isHovered = hoverIndex === i;
          return (
            <g key={d.yearMonth}>
              <rect
                x={cx - barWidth / 2}
                y={barY}
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
              value: hovered.value === null ? "—" : formatSigned(hovered.value),
              color: (hovered.value ?? 0) >= 0 ? positiveColor : negativeColor,
            },
          ]}
          containerWidth={containerRef.current?.getBoundingClientRect().width ?? W}
        />
      )}
    </div>
  );
}
