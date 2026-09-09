import { redirect } from "next/navigation";
import { listAccounts } from "@/lib/db";
import { CreateAccountForm } from "@/components/CreateAccountForm";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const accounts = await listAccounts();
  if (accounts.length > 0) {
    redirect(`/a/${accounts[0].id}`);
  }

  return (
    <div className="max-w-md mx-auto py-20 flex flex-col gap-6 text-center">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          はじめに、アカウントを登録してください
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          Instagramアカウントごとにフォロワー・リーチ・PV・フォロワー内訳・インフルエンサー実績を管理できます。
        </p>
      </div>
      <div className="text-left">
        <CreateAccountForm />
      </div>
    </div>
  );
}
