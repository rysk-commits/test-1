import type { CSSProperties } from "react";

export const cardStyle: CSSProperties = {
  background: "var(--card-bg)",
  border: "1px solid var(--border-hairline)",
  boxShadow: "var(--shadow-sm)",
};

export const cardClassName = "rounded-2xl";

export const inputStyle: CSSProperties = {
  background: "var(--surface-1)",
  border: "1px solid var(--border-hairline)",
  color: "var(--text-primary)",
};

export const inputClassName = "rounded-lg px-3 py-2 text-sm";

export const primaryButtonStyle: CSSProperties = {
  background: "var(--brand)",
  boxShadow: "var(--shadow-xs)",
};

export const primaryButtonClassName =
  "px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 hover:brightness-110";

export const secondaryButtonStyle: CSSProperties = {
  background: "var(--card-bg)",
  border: "1px solid var(--border-hairline)",
  color: "var(--text-primary)",
  boxShadow: "var(--shadow-xs)",
};

export const secondaryButtonClassName = "px-3.5 py-2 rounded-lg text-sm font-semibold";
