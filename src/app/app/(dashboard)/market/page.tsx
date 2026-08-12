import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { getMarketData } from "@/lib/market";
import { CRYPTO_CURRENCIES } from "@/lib/config/currencies";

export const metadata: Metadata = { title: "Mercado" };

export default async function MarketPage() {
  await requireUser();
  const market = await getMarketData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Mercado</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Precios en vivo (caché de 2 minutos vía CoinGecko).
        </p>
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {market.map((row) => {
          const meta = CRYPTO_CURRENCIES.find((c) => c.code === row.code);
          const positive = row.change24h >= 0;
          return (
            <div key={row.code} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-8 items-center justify-center rounded-full text-[10px] font-bold text-[var(--ge-text-inverse)]"
                  style={{ background: meta?.color ?? "var(--ge-violet)" }}
                >
                  {row.code.slice(0, 3)}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--ge-text-primary)]">
                    {meta?.name ?? row.code}
                  </p>
                  <p className="text-xs text-[var(--ge-text-muted)]">{row.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--ge-text-primary)]">
                  ${row.price.toLocaleString("es-CO", { maximumFractionDigits: 6 })}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: positive ? "var(--ge-success)" : "var(--ge-error)" }}
                >
                  {positive ? "▲" : "▼"} {Math.abs(row.change24h).toFixed(2)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
