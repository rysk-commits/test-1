"use client";

import { useMemo, useRef, useState } from "react";
import { buildTicks, formatCompact, formatYm } from "./chartUtils";
import { ChartTooltip } from "./ChartTooltip";
import { formatYearMonth } from "@/lib/format";

export interface LineSeriesPoint {
  yearMonth: string;
  value: number | null;
}

const W = 720;
const H = 260;
const PAD_LEFT = 62;
const PAD_RIGHT = 64;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;

export function LineChart({
  data,
  color,
  seriesLabel,
  valueFormatter = formatCompact,
  emptyMessage = "データがありません",
}: {
  data: LineSeriesPoint[];
  color: string;
  seriesLabel: string;
  valueFormatter?: (value: number) => string;
  emptyMessage?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  const values = data.map((d) => d.value).filter((v): v is number => v !== null);
  const hasData = values.length > 0;
  const maxVal = hasData ? Math.max(...values, 0) : 0;
  const minVal = hasData ? Math.min(...values, 0) : 0;
  const ticks = useMemo(() => buildTicks(Math.max(maxVal, 1), 4), [maxVal]);
  const scaleMax = ticks[ticks.length - 1] || 1;
  const scaleMin = Math.min(0, minVal);

  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;

  const xFor = (i: number) =>
    data.length <= 1 ? PAD_LEFT + plotW / 2 : PAD_LEFT + (plotW * i) / (data.length - 1);
  const yFor = (v: number) =>
    PAD_TOP + plotH - ((v - scaleMin) / (scaleMax - scaleMin || 1)) * plotH;

  const points = data.map((d, i) => ({
    ...d,
    cx: xFor(i),
    cy: d.value === null ? null : yFor(d.value),
  }));

  const validPoints = points.filter((p) => p.cy !== null) as (LineSeriesPoint & {
    cx: number;
    cy: number;
  })[];

  const linePath = validPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.cx} ${p.cy}`).join(" ");
  const areaPath = hasData
    ? `${linePath} L ${validPoints[validPoints.length - 1].cx} ${PAD_TOP + plotH} L ${
        validPoints[0].cx
      } ${PAD_TOP + plotH} Z`
    : "";

  const lastPoint = validPoints[validPoints.length - 1];

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const svg = e.currentTarget.ownerSVGElement;
    const container = containerRef.current;
    if (!svg || !container) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const localX = (e.clientX - rect.left) * scaleX;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.cx - localX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
    const containerRect = container.getBoundingClientRect();
    setMouse({ x: e.clientX - containerRect.left, y: e.clientY - containerRect.top });
  }

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center text-sm h-[220px]"
        style={{ color: "var(--text-muted)" }}
      >
        {emptyMessage}
      </div>
    );
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div ref={containerRef} className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={seriesLabel}>
        {ticks.map((t) => {
          const y = yFor(t);
          return (
            <g key={t}>
              <line
                x1={PAD_LEFT}
                x2={W - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="var(--gridline)"
                strokeWidth={1}
              />
              <text
                x={PAD_LEFT - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fill="var(--text-muted)"
              >
                {formatCompact(t)}
              </text>
            </g>
          );
        })}

        <line
          x1={PAD_LEFT}
          x2={W - PAD_RIGHT}
          y1={PAD_TOP + plotH}
          y2={PAD_TOP + plotH}
          stroke="var(--baseline)"
          strokeWidth={1}
        />

        {points.map((p, i) =>
          i % Math.ceil(data.length / 6 || 1) === 0 || i === data.length - 1 ? (
            <text
              key={p.yearMonth}
              x={p.cx}
              y={H - 8}
              textAnchor="middle"
              fontSize={11}
              fill="var(--text-muted)"
            >
              {formatYm(p.yearMonth)}
            </text>
          ) : null
        )}

        <path d={areaPath} fill={color} opacity={0.1} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {lastPoint && (
          <>
            <circle cx={lastPoint.cx} cy={lastPoint.cy} r={5} fill={color} stroke="var(--surface-1)" strokeWidth={2} />
            <text
              x={lastPoint.cx + 8}
              y={lastPoint.cy - 10}
              textAnchor="start"
              fontSize={12}
              fontWeight={600}
              fill="var(--text-primary)"
            >
              {valueFormatter(lastPoint.value as number)}
            </text>
          </>
        )}

        {hovered && (
          <line
            x1={hovered.cx}
            x2={hovered.cx}
            y1={PAD_TOP}
            y2={PAD_TOP + plotH}
            stroke="var(--text-muted)"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        )}
        {hovered && hovered.cy !== null && (
          <circle cx={hovered.cx} cy={hovered.cy} r={5} fill={color} stroke="var(--surface-1)" strokeWidth={2} />
        )}

        <rect
          x={PAD_LEFT}
          y={PAD_TOP}
          width={plotW}
          height={plotH}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            setHoverIndex(null);
            setMouse(null);
          }}
        />
      </svg>
      {hovered && mouse && (
        <ChartTooltip
          x={mouse.x}
          y={mouse.y}
          title={formatYearMonth(hovered.yearMonth)}
          rows={[
            {
              label: seriesLabel,
              value: hovered.value === null ? "—" : valueFormatter(hovered.value),
              color,
            },
          ]}
          containerWidth={containerRef.current?.getBoundingClientRect().width ?? W}
        />
      )}
    </div>
  );
}
