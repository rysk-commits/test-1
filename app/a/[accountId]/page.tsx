import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccount, listMetrics } from "@/lib/db";
import { ChartCard } from "@/components/ChartCard";
import { StatTile } from "@/components/StatTile";
import { LineChart } from "@/components/charts/LineChart";
import { DivergingBarChart } from "@/components/charts/DivergingBarChart";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { StackedBarChart } from "@/components/charts/StackedBarChart";
import { formatNumber, formatSigned, formatYearMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountDashboardPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const account = await getAccount(accountId);
  if (!account) notFound();

  const metrics = await listMetrics(accountId);

  if (metrics.length === 0) {
    return (
      <div
        className="text-center py-24 rounded-2xl"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border-hairline)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h2 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {account.name}: まだデータがありません
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          「データ管理」から月次の実績を入力すると、ここにダッシュボードが表示されます。
        </p>
        <Link
          href={`/a/${accountId}/data`}
          className="inline-block mt-6 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--brand)", boxShadow: "var(--shadow-sm)" }}
        >
          データを入力する
        </Link>
      </div>
    );
  }

  const latest = metrics[metrics.length - 1];
  const prev = metrics.length > 1 ? metrics[metrics.length - 2] : null;

  function delta(curr: number | null, before: number | null | undefined) {
    if (curr === null || before === null || before === undefined) return null;
    return curr - before;
  }

  const followerDelta = delta(latest.followerCount, prev?.followerCount);
  const reachDelta = delta(latest.reach, prev?.reach);
  const pvDelta = delta(latest.pv, prev?.pv);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {account.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            最新: {formatYearMonth(latest.yearMonth)} 時点 ・ 全{metrics.length}ヶ月分のデータ
          </p>
        </div>
        <Link
          href={`/a/${accountId}/data`}
          className="px-3.5 py-2 rounded-lg text-sm font-semibold"
          style={{
            border: "1px solid var(--border-hairline)",
            color: "var(--text-primary)",
            background: "var(--card-bg)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          テーブルで見る / データを編集
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatTile
          label="フォロワー数"
          value={formatNumber(latest.followerCount)}
          delta={followerDelta === null ? null : formatSigned(followerDelta)}
          deltaGood={(followerDelta ?? 0) >= 0}
        />
        <StatTile
          label="純増"
          value={formatSigned(latest.followerNetIncrease)}
          delta={null}
        />
        <StatTile
          label="リーチ"
          value={formatNumber(latest.reach)}
          delta={reachDelta === null ? null : formatSigned(reachDelta)}
          deltaGood={(reachDelta ?? 0) >= 0}
        />
        <StatTile
          label="PV"
          value={formatNumber(latest.pv)}
          delta={pvDelta === null ? null : formatSigned(pvDelta)}
          deltaGood={(pvDelta ?? 0) >= 0}
        />
        <StatTile
          label="インフルエンサー想定PV"
          value={formatNumber(latest.influencerEstimatedPv)}
          delta={null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="フォロワー数" subtitle="月末時点の累計フォロワー数の推移">
          <LineChart
            data={metrics.map((m) => ({ yearMonth: m.yearMonth, value: m.followerCount }))}
            color="var(--series-1)"
            seriesLabel="フォロワー数"
          />
        </ChartCard>

        <ChartCard title="フォロワー純増" subtitle="当月のフォロワー純増減数(前月比)">
          <DivergingBarChart
            data={metrics.map((m) => ({ yearMonth: m.yearMonth, value: m.followerNetIncrease }))}
            positiveColor="var(--series-1)"
            negativeColor="var(--status-critical)"
            seriesLabel="純増"
          />
        </ChartCard>

        <ChartCard title="リーチ" subtitle="月間リーチ数の推移">
          <LineChart
            data={metrics.map((m) => ({ yearMonth: m.yearMonth, value: m.reach }))}
            color="var(--series-2)"
            seriesLabel="リーチ"
          />
        </ChartCard>

        <ChartCard title="PV" subtitle="月間PV数の推移">
          <LineChart
            data={metrics.map((m) => ({ yearMonth: m.yearMonth, value: m.pv }))}
            color="var(--series-3)"
            seriesLabel="PV"
          />
        </ChartCard>

        <ChartCard title="フォロワー内訳" subtitle="リーチしたユーザーのうちフォロワー/非フォロワーの比率">
          <StackedBarChart
            data={metrics.map((m) => ({
              yearMonth: m.yearMonth,
              followerPercent: m.followerPercent,
              nonFollowerPercent: m.nonFollowerPercent,
            }))}
            followerColor="var(--series-4)"
            nonFollowerColor="var(--series-5)"
          />
        </ChartCard>

        <ChartCard title="インフルエンサー起用人数" subtitle="当月起用したインフルエンサーの人数">
          <SimpleBarChart
            data={metrics.map((m) => ({ yearMonth: m.yearMonth, value: m.influencerCount }))}
            color="var(--series-6)"
            seriesLabel="人数"
          />
        </ChartCard>

        <ChartCard title="インフルエンサー想定PV" subtitle="起用インフルエンサー経由の想定PV">
          <LineChart
            data={metrics.map((m) => ({ yearMonth: m.yearMonth, value: m.influencerEstimatedPv }))}
            color="var(--series-7)"
            seriesLabel="想定PV"
          />
        </ChartCard>
      </div>
    </div>
  );
}
