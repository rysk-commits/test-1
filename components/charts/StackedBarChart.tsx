"use client";

import { useRef, useState } from "react";
import { formatYm } from "./chartUtils";
import { ChartTooltip } from "./ChartTooltip";
import { formatYearMonth, formatPercent } from "@/lib/format";

export interface BreakdownPoint {
  yearMonth: string;
  followerPercent: number | null;
  nonFollowerPercent: number | null;
}

const W = 720;
const H = 240;
const PAD_LEFT = 12;
const PAD_RIGHT = 12;
const PAD_TOP = 20;
const PAD_BOTTOM = 26;
const GAP = 2;
const SEGMENT_GAP = 2;

export function StackedBarChart({
  data,
  followerColor,
  nonFollowerColor,
}: {
  data: BreakdownPoint[];
  followerColor: string;
  nonFollowerColor: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  const hasData = data.some((d) => d.followerPercent !== null || d.nonFollowerPercent !== null);

  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;

  const bandWidth = data.length > 0 ? plotW / data.length : plotW;
  const barWidth = Math.min(32, Math.max(6, bandWidth - GAP * 2));

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
        className="flex items-center justify-center text-sm h-[200px]"
        style={{ color: "var(--text-muted)" }}
      >
        データがありません
      </div>
    );
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-4 text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: followerColor }} />
          フォロワー
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: nonFollowerColor }} />
          非フォロワー
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label="フォロワー内訳">
        <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={PAD_TOP + plotH} y2={PAD_TOP + plotH} stroke="var(--baseline)" strokeWidth={1} />
        <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={PAD_TOP} y2={PAD_TOP} stroke="var(--gridline)" strokeWidth={1} />

        {data.map((d, i) => {
          const cx = PAD_LEFT + bandWidth * i + bandWidth / 2;
          const fp = d.followerPercent ?? 0;
          const nfp = d.nonFollowerPercent ?? 0;
          const total = fp + nfp || 100;
          const followerH = (fp / total) * (plotH - SEGMENT_GAP);
          const nonFollowerH = (nfp / total) * (plotH - SEGMENT_GAP);
          const isHovered = hoverIndex === i;
          const hasValues = d.followerPercent !== null || d.nonFollowerPercent !== null;

          return (
            <g key={d.yearMonth} opacity={isHovered ? 0.85 : 1}>
              {hasValues && (
                <>
                  <rect
                    x={cx - barWidth / 2}
                    y={PAD_TOP}
                    width={barWidth}
                    height={Math.max(followerH, 1)}
                    rx={4}
                    fill={followerColor}
                  />
                  <rect
                    x={cx - barWidth / 2}
                    y={PAD_TOP + followerH + SEGMENT_GAP}
                    width={barWidth}
                    height={Math.max(nonFollowerH, 1)}
                    rx={4}
                    fill={nonFollowerColor}
                  />
                </>
              )}
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
            { label: "フォロワー", value: formatPercent(hovered.followerPercent), color: followerColor },
            { label: "非フォロワー", value: formatPercent(hovered.nonFollowerPercent), color: nonFollowerColor },
          ]}
          containerWidth={containerRef.current?.getBoundingClientRect().width ?? W}
        />
      )}
    </div>
  );
}
