"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Account } from "@/lib/types";

const inputStyle = {
  background: "var(--surface-1)",
  border: "1px solid var(--border-hairline)",
  color: "var(--text-primary)",
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<{ created: number; skipped: number } | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/accounts");
    const json = await res.json();
    setAccounts(json.accounts ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCreateError(json.error ?? "作成に失敗しました");
        return;
      }
      setNewName("");
      setAccounts((prev) => [...prev, json.account]);
    } catch {
      setCreateError("通信エラーが発生しました");
    } finally {
      setCreating(false);
    }
  }

  async function handleBulkCreate(e: React.FormEvent) {
    e.preventDefault();
    const names = bulkText
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    if (names.length === 0) return;
    setBulkSubmitting(true);
    setBulkError(null);
    setBulkResult(null);
    try {
      const res = await fetch("/api/accounts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBulkError(json.error ?? "追加に失敗しました");
        return;
      }
      setAccounts((prev) => [...prev, ...json.created]);
      setBulkResult({ created: json.created.length, skipped: json.skipped.length });
      setBulkText("");
    } catch {
      setBulkError("通信エラーが発生しました");
    } finally {
      setBulkSubmitting(false);
    }
  }

  async function handleRename(id: string) {
    const name = editingName.trim();
    if (!name) return;
    setRenameError(null);
    const res = await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!res.ok) {
      setRenameError(json.error ?? "変更に失敗しました");
      return;
    }
    setAccounts((prev) => prev.map((a) => (a.id === id ? json.account : a)));
    setEditingId(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`「${name}」を削除しますか?\nこのアカウントの月次データもすべて削除され、元に戻せません。`)) {
      return;
    }
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          アカウント管理
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Instagramアカウントごとに実績を管理できます。
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-xl p-5 flex flex-col gap-3"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border-hairline)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          新しいアカウントを追加
        </h3>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="例: @brand_official"
            className="flex-1 rounded-md px-3 py-2 text-sm"
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={creating || newName.trim().length === 0}
            className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "var(--series-1)" }}
          >
            {creating ? "追加中…" : "追加"}
          </button>
        </div>
        {createError && (
          <p className="text-xs" style={{ color: "var(--status-critical)" }}>
            {createError}
          </p>
        )}
      </form>

      <form
        onSubmit={handleBulkCreate}
        className="rounded-xl p-5 flex flex-col gap-3"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border-hairline)" }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            複数アカウントをまとめて追加
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            1行に1つ、アカウント名を貼り付けてください。空行は無視されます。既に同じ名前のアカウントがある場合はスキップされます。
          </p>
        </div>
        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={"江並店\n神戸本多聞店\n松原店\n…"}
          rows={8}
          className="rounded-md px-3 py-2 text-sm font-mono"
          style={inputStyle}
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={bulkSubmitting || bulkText.trim().length === 0}
            className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "var(--series-1)" }}
          >
            {bulkSubmitting ? "追加中…" : "まとめて追加"}
          </button>
          {bulkResult && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {bulkResult.created}件追加しました
              {bulkResult.skipped > 0 && `(${bulkResult.skipped}件は既存のためスキップ)`}
            </span>
          )}
        </div>
        {bulkError && (
          <p className="text-xs" style={{ color: "var(--status-critical)" }}>
            {bulkError}
          </p>
        )}
      </form>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          読み込み中…
        </p>
      ) : accounts.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          まだアカウントがありません。上のフォームから追加してください。
        </p>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-hairline)" }}
        >
          {accounts.map((a, i) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{
                borderBottom: i === accounts.length - 1 ? "none" : "1px solid var(--border-hairline)",
              }}
            >
              {editingId === a.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 rounded-md px-2 py-1.5 text-sm"
                    style={inputStyle}
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(a.id)}
                    className="text-xs px-2 py-1 font-medium"
                    style={{ color: "var(--series-1)" }}
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs px-2 py-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href={`/a/${a.id}`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {a.name}
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(a.id);
                        setEditingName(a.name);
                        setRenameError(null);
                      }}
                      className="text-xs px-2 py-1"
                      style={{ color: "var(--series-1)" }}
                    >
                      名前変更
                    </button>
                    <button
                      onClick={() => handleDelete(a.id, a.name)}
                      className="text-xs px-2 py-1"
                      style={{ color: "var(--status-critical)" }}
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {renameError && (
        <p className="text-xs" style={{ color: "var(--status-critical)" }}>
          {renameError}
        </p>
      )}
    </div>
  );
}
