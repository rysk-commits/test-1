"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputStyle, inputClassName, primaryButtonStyle, primaryButtonClassName } from "./ui";

export function CreateAccountForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "作成に失敗しました");
        return;
      }
      router.push(`/a/${json.account.id}`);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="アカウント名(例: @brand_official)"
        className={inputClassName}
        style={inputStyle}
        autoFocus
      />
      {error && (
        <p className="text-xs" style={{ color: "var(--status-critical)" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving || name.trim().length === 0}
        className={primaryButtonClassName}
        style={primaryButtonStyle}
      >
        {saving ? "作成中…" : "アカウントを作成"}
      </button>
    </form>
  );
}
