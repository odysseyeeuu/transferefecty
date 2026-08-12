import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { CRYPTO_CURRENCIES } from "@/lib/config/currencies";

export const metadata: Metadata = { title: "Dashboard" };

function currencyMeta(code: string) {
  return CRYPTO_CURRENCIES.find((c) => c.code === code);
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [wallets, recentTransactions] = await Promise.all([
    db.wallet.findMany({ where: { userId: user.id }, orderBy: { currency: "asc" } }),
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          Hola, {user.fullName.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Estado de tu billetera Transfer Efecty.
        </p>
        {user.dashboardNote && (
          <p className="ge-card mt-4 px-4 py-3 text-sm text-[var(--ge-warning)]">
            {user.dashboardNote}
          </p>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Wallets
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => {
            const meta = currencyMeta(wallet.currency);
            return (
              <div key={wallet.id} className="ge-card flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-[var(--ge-text-muted)]">
                    {meta?.name ?? wallet.currency}
                  </p>
                  <p className="text-lg font-semibold text-[var(--ge-text-primary)]">
                    {Number(wallet.balance).toLocaleString("es-CO", {
                      maximumFractionDigits: 8,
                    })}{" "}
                    <span className="text-sm text-[var(--ge-text-secondary)]">
                      {wallet.currency}
                    </span>
                  </p>
                </div>
                <span
                  className="flex size-10 items-center justify-center rounded-full text-xs font-bold text-[var(--ge-text-inverse)]"
                  style={{ background: meta?.color ?? "var(--ge-violet)" }}
                >
                  {wallet.currency.slice(0, 3)}
                </span>
              </div>
            );
          })}
          {wallets.length === 0 && (
            <p className="text-sm text-[var(--ge-text-secondary)]">
              Aún no tienes wallets. (Deberían crearse automáticamente al registrarte —
              revisa el seed / migración de datos si ves esto en producción.)
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Últimas transacciones
        </h2>
        <div className="ge-card divide-y divide-[var(--ge-border)]">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium capitalize text-[var(--ge-text-primary)]">
                  {tx.type} · {tx.currency}
                </p>
                <p className="text-xs text-[var(--ge-text-muted)]">
                  {tx.description ?? "—"} ·{" "}
                  {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
                    tx.createdAt
                  )}
                </p>
              </div>
              <span className="text-sm font-semibold text-[var(--ge-text-primary)]">
                {Number(tx.amount).toLocaleString("es-CO", { maximumFractionDigits: 8 })}
              </span>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">
              Todavía no hay transacciones.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
