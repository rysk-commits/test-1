"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { Account } from "@/lib/types";
import { DashboardIcon, TableIcon, UsersIcon, ChevronDownIcon, InstagramMark } from "./icons";

function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium whitespace-nowrap shrink-0"
      style={{
        color: active ? "var(--brand)" : "var(--text-secondary)",
        background: active ? "var(--brand-soft)" : "transparent",
      }}
    >
      <span style={{ opacity: active ? 1 : 0.75 }}>{icon}</span>
      {children}
    </Link>
  );
}

export function Sidebar() {
  const params = useParams<{ accountId?: string | string[] }>();
  const router = useRouter();
  const pathname = usePathname();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const currentAccountId =
    typeof params.accountId === "string" ? params.accountId : undefined;
  const isDataPage = pathname?.endsWith("/data") ?? false;
  const isDashboardPage = Boolean(currentAccountId) && !isDataPage;
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
    <aside
      className="w-full md:w-64 shrink-0 flex flex-col md:sticky md:top-0 md:h-screen z-20"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border-hairline)",
        borderBottom: "1px solid var(--border-hairline)",
      }}
    >
      <div className="h-16 flex items-center px-5 shrink-0">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[15px] tracking-tight">
          <span
            className="flex items-center justify-center rounded-lg text-white shrink-0"
            style={{
              width: 30,
              height: 30,
              background: "linear-gradient(135deg, var(--series-5), var(--series-2) 55%, var(--series-4))",
            }}
          >
            <InstagramMark width={17} height={17} strokeWidth={2} />
          </span>
          <span style={{ color: "var(--text-primary)" }}>IG Analytics</span>
        </Link>
      </div>

      <div className="px-4 pb-3 shrink-0">
        <label
          className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5 px-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          アカウント
        </label>
        {loading ? (
          <div className="h-10 rounded-lg animate-pulse" style={{ background: "var(--page-plane)" }} />
        ) : accounts.length > 0 ? (
          <div className="relative">
            <select
              value={currentAccountId ?? ""}
              onChange={handleChange}
              className="w-full appearance-none rounded-lg pl-3 pr-8 py-2.5 text-[13.5px] font-medium"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border-hairline)",
                boxShadow: "var(--shadow-xs)",
                color: "var(--text-primary)",
              }}
            >
              {!currentAccountId && (
                <option value="" disabled>
                  選択してください
                </option>
              )}
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        ) : (
          <p className="text-xs px-0.5" style={{ color: "var(--text-muted)" }}>
            アカウント未登録
          </p>
        )}
      </div>

      <nav className="flex-1 px-3 pb-3 md:pb-0 flex flex-row md:flex-col gap-0.5 overflow-x-auto md:overflow-y-auto">
        {currentAccountId && (
          <>
            <NavLink href={`/a/${currentAccountId}`} active={isDashboardPage} icon={<DashboardIcon />}>
              ダッシュボード
            </NavLink>
            <NavLink href={`/a/${currentAccountId}/data`} active={isDataPage} icon={<TableIcon />}>
              データ管理
            </NavLink>
          </>
        )}
        <NavLink href="/accounts" active={isAccountsPage} icon={<UsersIcon />}>
          アカウント管理
        </NavLink>
      </nav>

      <div className="px-5 py-4 text-[11px] shrink-0" style={{ color: "var(--text-muted)" }}>
        Instagram Analytics Dashboard
      </div>
    </aside>
  );
}
