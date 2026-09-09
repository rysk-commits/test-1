import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
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
        <div className="min-h-screen flex flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
