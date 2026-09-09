"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { Account } from "@/lib/types";

export function AccountNav() {
  const params = useParams<{ accountId?: string | string[] }>();
  const router = useRouter();
  const pathname = usePathname();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const currentAccountId =
    typeof params.accountId === "string" ? params.accountId : undefined;
  const isDataPage = pathname?.endsWith("/data") ?? false;
  const isAccountsPage = pathname === "/accounts";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setAccounts(json.accounts ?? []);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentAccountId]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`/a/${e.target.value}`);
  }

  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap">
      {!loading && accounts.length > 0 && (
        <select
          value={currentAccountId ?? ""}
          onChange={handleChange}
          className="text-sm rounded-md px-2 py-1.5 mr-1"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-hairline)",
            color: "var(--text-primary)",
          }}
        >
          {!currentAccountId && (
            <option value="" disabled>
              アカウントを選択
            </option>
          )}
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}
      {currentAccountId && (
        <>
          <Link
            href={`/a/${currentAccountId}`}
            className="px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity"
            style={{
              color: isDataPage ? "var(--text-secondary)" : "var(--text-primary)",
              fontWeight: isDataPage ? 400 : 600,
            }}
          >
            ダッシュボード
          </Link>
          <Link
            href={`/a/${currentAccountId}/data`}
            className="px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity"
            style={{
              color: isDataPage ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: isDataPage ? 600 : 400,
            }}
          >
            データ管理
          </Link>
        </>
      )}
      <Link
        href="/accounts"
        className="px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity"
        style={{
          color: isAccountsPage ? "var(--text-primary)" : "var(--text-secondary)",
          fontWeight: isAccountsPage ? 600 : 400,
        }}
      >
        アカウント管理
      </Link>
    </nav>
  );
}
