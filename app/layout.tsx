import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instagram Analytics Dashboard",
  description: "Instagramの運用数値を月次で管理・分析するダッシュボード",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen flex flex-col">
          <header
            className="border-b sticky top-0 z-10"
            style={{
              background: "var(--surface-1)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
              <Link href="/" className="font-semibold tracking-tight text-[15px]">
                IG Analytics
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/data"
                  className="px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  データ管理
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
          <footer
            className="text-xs px-4 sm:px-6 py-6 max-w-6xl w-full mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            Instagram Analytics Dashboard
          </footer>
        </div>
      </body>
    </html>
  );
}
