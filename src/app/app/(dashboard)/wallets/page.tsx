import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getMarketData } from "@/lib/market";
import { CRYPTO_CURRENCIES } from "@/lib/config/currencies";

export const metadata: Metadata = { title: "Wallets" };

export default async function WalletsPage() {
  const user = await requireUser();
  const [wallets, market, officeWallets] = await Promise.all([
    db.wallet.findMany({ where: { userId: user.id }, orderBy: { currency: "asc" } }),
    getMarketData(),
    user.officeId
      ? db.officeDepositWallet.findMany({
          where: { officeId: user.officeId, isActive: true },
          orderBy: [{ currency: "asc" }, { network: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  const priceByCode = new Map(market.map((m) => [m.code, m.price]));
  const totalUsd = wallets.reduce(
    (sum, w) => sum + Number(w.balance) * (priceByCode.get(w.currency) ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Wallets</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Valor total estimado:{" "}
          <span className="font-semibold text-[var(--ge-text-primary)]">
            ${totalUsd.toLocaleString("es-CO", { maximumFractionDigits: 2 })} USD
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => {
          const meta = CRYPTO_CURRENCIES.find((c) => c.code === wallet.currency);
          const price = priceByCode.get(wallet.currency) ?? 0;
          const usdValue = Number(wallet.balance) * price;
          return (
            <div key={wallet.id} className="ge-card flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--ge-text-primary)]">
                    {meta?.name ?? wallet.currency}
                  </p>
                  <p className="text-xs text-[var(--ge-text-muted)]">{wallet.currency}</p>
                </div>
                <span
                  className="flex size-9 items-center justify-center rounded-full text-xs font-bold text-[var(--ge-text-inverse)]"
                  style={{ background: meta?.color ?? "var(--ge-violet)" }}
                >
                  {wallet.currency.slice(0, 3)}
                </span>
              </div>
              <p className="text-lg font-semibold text-[var(--ge-text-primary)]">
                {Number(wallet.balance).toLocaleString("es-CO", { maximumFractionDigits: 8 })}
              </p>
              <p className="text-xs text-[var(--ge-text-muted)]">
                ≈ ${usdValue.toLocaleString("es-CO", { maximumFractionDigits: 2 })} USD
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/app/wallet/receive?currency=${wallet.currency}`}
                  className="flex-1 rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] py-1.5 text-center text-xs font-medium text-[var(--ge-text-primary)]"
                >
                  Recibir
                </Link>
                <Link
                  href={`/app/wallet/send?currency=${wallet.currency}`}
                  className="flex-1 rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] py-1.5 text-center text-xs font-medium text-[var(--ge-text-primary)]"
                >
                  Enviar
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {officeWallets.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
            Wallets de depósito de tu oficina
          </h2>
          <div className="ge-card divide-y divide-[var(--ge-border)]">
            {officeWallets.map((w) => (
              <div key={w.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-[var(--ge-text-primary)]">
                  {w.currency} · {w.network} {w.label ? `(${w.label})` : ""}
                </span>
                <span className="font-mono text-xs text-[var(--ge-text-muted)]">{w.address}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
