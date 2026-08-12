import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { ensureWallet } from "@/lib/wallet";
import { CRYPTO_CURRENCIES } from "@/lib/config/currencies";

export const metadata: Metadata = { title: "Recibir" };

export default async function WalletReceivePage({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string }>;
}) {
  const user = await requireUser();
  const { currency: rawCurrency } = await searchParams;
  const currency = (rawCurrency ?? "BTC").toUpperCase();

  if (!CRYPTO_CURRENCIES.some((c) => c.code === currency)) {
    redirect("/app/wallets?error=currency");
  }

  await ensureWallet(db, user.id, currency);
  const wallet = await db.wallet.findUnique({
    where: { userId_currency: { userId: user.id, currency } },
  });
  if (!wallet) redirect("/app/wallets");

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(wallet.address)}`;

  return (
    <div className="flex max-w-md flex-col items-center gap-6 text-center">
      <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
        Recibir {currency}
      </h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrSrc} alt={`QR ${wallet.address}`} width={220} height={220} className="rounded-[var(--ge-radius)]" />
      <div className="ge-card w-full break-all px-4 py-3 font-mono text-sm text-[var(--ge-text-primary)]">
        {wallet.address}
      </div>
      <p className="text-xs text-[var(--ge-text-muted)]">
        Envía sólo {currency} a esta dirección. Enviar otra moneda puede resultar en pérdida
        de fondos.
      </p>
    </div>
  );
}
