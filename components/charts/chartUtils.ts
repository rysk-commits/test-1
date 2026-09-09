export interface Point {
  x: string; // category label (year-month)
  y: number | null;
}

export function niceMax(max: number): number {
  if (max <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const normalized = max / magnitude;
  let niceNormalized: number;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;
  return niceNormalized * magnitude;
}

export function buildTicks(max: number, count = 4): number[] {
  const step = niceMax(max) / count;
  const ticks: number[] = [];
  for (let i = 0; i <= count; i++) {
    ticks.push(Math.round(step * i));
  }
  return ticks;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("ja-JP").format(value);
}

export function formatYm(ym: string): string {
  const [, m] = ym.split("-");
  return `${Number(m)}月`;
}
