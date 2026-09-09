import { redirect } from "next/navigation";
import { listAccounts } from "@/lib/db";
import { CreateAccountForm } from "@/components/CreateAccountForm";
import { InstagramMark } from "@/components/icons";
import { cardStyle, cardClassName } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const accounts = await listAccounts();
  if (accounts.length > 0) {
    redirect(`/a/${accounts[0].id}`);
  }

  return (
    <div className="max-w-md mx-auto py-20 flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-3">
        <span
          className="flex items-center justify-center rounded-2xl text-white"
          style={{
            width: 48,
            height: 48,
            background: "linear-gradient(135deg, var(--series-5), var(--series-2) 55%, var(--series-4))",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <InstagramMark width={26} height={26} strokeWidth={1.9} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            はじめに、アカウントを登録してください
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Instagramアカウントごとにフォロワー・リーチ・PV・フォロワー内訳・インフルエンサー実績を管理できます。
          </p>
        </div>
      </div>
      <div className={`${cardClassName} p-5`} style={cardStyle}>
        <CreateAccountForm />
      </div>
    </div>
  );
}
