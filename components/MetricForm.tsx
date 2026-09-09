"use client";

import { useEffect, useState } from "react";
import type { MonthlyMetric } from "@/lib/types";
import { formatYearMonth, formatNumber, formatSigned } from "@/lib/format";
import { cardStyle, cardClassName, inputStyle, inputClassName, primaryButtonStyle, primaryButtonClassName } from "./ui";

export interface MetricFormValues {
  yearMonth: string;
  followerCount: string;
  followerNetIncrease: string;
  reach: string;
  pv: string;
  followerPercent: string;
  nonFollowerPercent: string;
  influencerCount: string;
  influencerEstimatedPv: string;
}

function metricToFormValues(metric: MonthlyMetric | null, defaultYearMonth: string): MetricFormValues {
  const toStr = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));
  return {
    yearMonth: metric?.yearMonth ?? defaultYearMonth,
    followerCount: toStr(metric?.followerCount),
    followerNetIncrease: toStr(metric?.followerNetIncrease),
    reach: toStr(metric?.reach),
    pv: toStr(metric?.pv),
    followerPercent: toStr(metric?.followerPercent),
    nonFollowerPercent: toStr(metric?.nonFollowerPercent),
    influencerCount: toStr(metric?.influencerCount),
    influencerEstimatedPv: toStr(metric?.influencerEstimatedPv),
  };
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function findPreviousMetric(
  yearMonth: string,
  metrics: MonthlyMetric[]
): MonthlyMetric | undefined {
  return metrics
    .filter((m) => m.yearMonth < yearMonth)
    .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))[0];
}

const OTHER_FIELDS: { key: keyof Omit<MetricFormValues, "yearMonth" | "followerNetIncrease" | "followerCount">; label: string }[] = [
  { key: "reach", label: "リーチ数" },
  { key: "pv", label: "PV数" },
  { key: "followerPercent", label: "フォロワー%" },
  { key: "nonFollowerPercent", label: "非フォロワー%" },
  { key: "influencerCount", label: "インフルエンサー人数" },
  { key: "influencerEstimatedPv", label: "想定PV" },
];

export function MetricForm({
  accountId,
  editingMetric,
  allMetrics,
  onSaved,
  onCancelEdit,
  existingYearMonths,
}: {
  accountId: string;
  editingMetric: MonthlyMetric | null;
  allMetrics: MonthlyMetric[];
  onSaved: (metric: MonthlyMetric) => void;
  onCancelEdit: () => void;
  existingYearMonths: string[];
}) {
  const [values, setValues] = useState<MetricFormValues>(() =>
    metricToFormValues(editingMetric, currentYearMonth())
  );
  const [lastAutoNet, setLastAutoNet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(metricToFormValues(editingMetric, currentYearMonth()));
    setLastAutoNet(null);
    setError(null);
  }, [editingMetric]);

  const isEditing = editingMetric !== null;
  const isDuplicate = !isEditing && existingYearMonths.includes(values.yearMonth);

  const previousMetric = findPreviousMetric(values.yearMonth, allMetrics);
  const followerCountNum = values.followerCount === "" ? null : Number(values.followerCount);
  const autoNet =
    followerCountNum !== null &&
    !Number.isNaN(followerCountNum) &&
    previousMetric?.followerCount !== null &&
    previousMetric?.followerCount !== undefined
      ? followerCountNum - previousMetric.followerCount
      : null;

  // Auto-fill the net-increase field from the previous month's follower count,
  // but only while the field is empty or still holds our own last auto value —
  // once the user types something else, their value is left alone.
  useEffect(() => {
    if (autoNet === null) {
      setLastAutoNet(null);
      return;
    }
    const autoStr = String(autoNet);
    setValues((v) =>
      v.followerNetIncrease === "" || v.followerNetIncrease === lastAutoNet
        ? { ...v, followerNetIncrease: autoStr }
        : v
    );
    setLastAutoNet(autoStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoNet]);

  const isNetDiverged = autoNet !== null && values.followerNetIncrease !== String(autoNet);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(values.yearMonth)) {
      setError("年月を YYYY-MM 形式で入力してください");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        yearMonth: values.yearMonth,
        followerCount: values.followerCount === "" ? null : Number(values.followerCount),
        followerNetIncrease: values.followerNetIncrease === "" ? null : Number(values.followerNetIncrease),
        reach: values.reach === "" ? null : Number(values.reach),
        pv: values.pv === "" ? null : Number(values.pv),
        followerPercent: values.followerPercent === "" ? null : Number(values.followerPercent),
        nonFollowerPercent: values.nonFollowerPercent === "" ? null : Number(values.nonFollowerPercent),
        influencerCount: values.influencerCount === "" ? null : Number(values.influencerCount),
        influencerEstimatedPv: values.influencerEstimatedPv === "" ? null : Number(values.influencerEstimatedPv),
      };
      const res = await fetch(`/api/accounts/${accountId}/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "保存に失敗しました");
        return;
      }
      onSaved(json.metric);
      if (!isEditing) {
        setValues(metricToFormValues(null, currentYearMonth()));
        setLastAutoNet(null);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${cardClassName} p-5 flex flex-col gap-4`}
      style={cardStyle}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[13.5px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {isEditing ? `${editingMetric.yearMonth} を編集` : "月次データを追加"}
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs px-2 py-1 rounded-md font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            キャンセル
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          年月
          <input
            type="month"
            required
            disabled={isEditing}
            value={values.yearMonth}
            onChange={(e) => setValues((v) => ({ ...v, yearMonth: e.target.value }))}
            className={`${inputClassName} disabled:opacity-60`}
            style={inputStyle}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          フォロワー数
          <input
            type="number"
            step="any"
            value={values.followerCount}
            onChange={(e) => setValues((v) => ({ ...v, followerCount: e.target.value }))}
            className={inputClassName}
            style={inputStyle}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          純増(前月比)
          <input
            type="number"
            step="any"
            value={values.followerNetIncrease}
            onChange={(e) => setValues((v) => ({ ...v, followerNetIncrease: e.target.value }))}
            className={inputClassName}
            style={inputStyle}
          />
          {previousMetric && autoNet !== null ? (
            <span style={{ color: "var(--text-muted)" }}>
              前月({formatYearMonth(previousMetric.yearMonth)}): {formatNumber(previousMetric.followerCount)} →
              自動計算 {formatSigned(autoNet)}
              {isNetDiverged && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={() =>
                      setValues((v) => ({ ...v, followerNetIncrease: String(autoNet) }))
                    }
                    className="underline"
                    style={{ color: "var(--brand)" }}
                  >
                    自動計算値を使う
                  </button>
                </>
              )}
            </span>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>
              前月のフォロワー数があれば自動計算されます(手動入力も可)
            </span>
          )}
        </label>

        {OTHER_FIELDS.map((field) => (
          <label
            key={field.key}
            className="flex flex-col gap-1 text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {field.label}
            <input
              type="number"
              step="any"
              value={values[field.key]}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              className={inputClassName}
              style={inputStyle}
            />
          </label>
        ))}
      </div>

      {isDuplicate && (
        <p className="text-xs" style={{ color: "var(--status-warning)" }}>
          その年月は既に登録されています。保存すると上書きされます。
        </p>
      )}
      {error && (
        <p className="text-xs" style={{ color: "var(--status-critical)" }}>
          {error}
        </p>
      )}

      <div>
        <button type="submit" disabled={saving} className={primaryButtonClassName} style={primaryButtonStyle}>
          {saving ? "保存中…" : isEditing ? "更新する" : "追加する"}
        </button>
      </div>
    </form>
  );
}
