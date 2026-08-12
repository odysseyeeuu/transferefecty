import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { SendForm } from "./send-form";

export const metadata: Metadata = { title: "Enviar" };

export default async function WalletSendPage({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string }>;
}) {
  const user = await requireUser();
  if (!user.allowSend) redirect("/app/wallets?error=send_disabled");

  const { currency } = await searchParams;

  return (
    <div className="flex max-w-md flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Enviar Crypto</h1>
      <SendForm defaultCurrency={(currency ?? "BTC").toUpperCase()} />
    </div>
  );
}
