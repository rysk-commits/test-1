"use client";

import { useEffect, useState } from "react";
import type { MonthlyMetric } from "@/lib/types";

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

const FIELDS: { key: keyof Omit<MetricFormValues, "yearMonth">; label: string; suffix?: string }[] = [
  { key: "followerCount", label: "フォロワー数" },
  { key: "followerNetIncrease", label: "純増" },
  { key: "reach", label: "リーチ数" },
  { key: "pv", label: "PV数" },
  { key: "followerPercent", label: "フォロワー%", suffix: "%" },
  { key: "nonFollowerPercent", label: "非フォロワー%", suffix: "%" },
  { key: "influencerCount", label: "インフルエンサー人数" },
  { key: "influencerEstimatedPv", label: "想定PV" },
];

const inputStyle = {
  background: "var(--surface-1)",
  border: "1px solid var(--border-hairline)",
  color: "var(--text-primary)",
};

export function MetricForm({
  editingMetric,
  onSaved,
  onCancelEdit,
  existingYearMonths,
}: {
  editingMetric: MonthlyMetric | null;
  onSaved: (metric: MonthlyMetric) => void;
  onCancelEdit: () => void;
  existingYearMonths: string[];
}) {
  const [values, setValues] = useState<MetricFormValues>(() =>
    metricToFormValues(editingMetric, currentYearMonth())
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(metricToFormValues(editingMetric, currentYearMonth()));
    setError(null);
  }, [editingMetric]);

  const isEditing = editingMetric !== null;
  const isDuplicate = !isEditing && existingYearMonths.includes(values.yearMonth);

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
      const res = await fetch("/api/metrics", {
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
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border-hairline)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {isEditing ? `${editingMetric.yearMonth} を編集` : "月次データを追加"}
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs px-2 py-1 rounded"
            style={{ color: "var(--text-muted)" }}
          >
            キャンセル
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          年月
          <input
            type="month"
            required
            disabled={isEditing}
            value={values.yearMonth}
            onChange={(e) => setValues((v) => ({ ...v, yearMonth: e.target.value }))}
            className="rounded-md px-2 py-1.5 text-sm disabled:opacity-60"
            style={inputStyle}
          />
        </label>
        {FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            {field.label}
            <input
              type="number"
              step="any"
              value={values[field.key]}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              className="rounded-md px-2 py-1.5 text-sm"
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
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-60"
          style={{ background: "var(--series-1)" }}
        >
          {saving ? "保存中…" : isEditing ? "更新する" : "追加する"}
        </button>
      </div>
    </form>
  );
}
