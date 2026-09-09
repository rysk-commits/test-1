"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Account, MonthlyMetric } from "@/lib/types";
import { MetricForm } from "@/components/MetricForm";
import { MetricsTable } from "@/components/MetricsTable";

export default function AccountDataPage() {
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;

  const [account, setAccount] = useState<Account | null>(null);
  const [metrics, setMetrics] = useState<MonthlyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMetric, setEditingMetric] = useState<MonthlyMetric | null>(null);

  async function load() {
    setLoading(true);
    const [accountRes, metricsRes] = await Promise.all([
      fetch(`/api/accounts/${accountId}`),
      fetch(`/api/accounts/${accountId}/metrics`),
    ]);
    const accountJson = await accountRes.json();
    const metricsJson = await metricsRes.json();
    setAccount(accountJson.account ?? null);
    setMetrics(metricsJson.metrics ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (accountId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  function handleSaved(metric: MonthlyMetric) {
    setMetrics((prev) => {
      const rest = prev.filter((m) => m.yearMonth !== metric.yearMonth);
      return [...rest, metric];
    });
    setEditingMetric(null);
  }

  async function handleDelete(yearMonth: string) {
    if (!confirm(`${yearMonth} のデータを削除しますか?`)) return;
    const res = await fetch(`/api/accounts/${accountId}/metrics/${yearMonth}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMetrics((prev) => prev.filter((m) => m.yearMonth !== yearMonth));
      if (editingMetric?.yearMonth === yearMonth) setEditingMetric(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          データ管理{account ? `: ${account.name}` : ""}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          月ごとのフォロワー・リーチ・PV・フォロワー内訳・インフルエンサー実績を入力します。
        </p>
      </div>

      <MetricForm
        accountId={accountId}
        editingMetric={editingMetric}
        allMetrics={metrics}
        onSaved={handleSaved}
        onCancelEdit={() => setEditingMetric(null)}
        existingYearMonths={metrics.map((m) => m.yearMonth)}
      />

      {loading ? (
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          読み込み中…
        </div>
      ) : (
        <MetricsTable metrics={metrics} onEdit={setEditingMetric} onDelete={handleDelete} />
      )}
    </div>
  );
}
