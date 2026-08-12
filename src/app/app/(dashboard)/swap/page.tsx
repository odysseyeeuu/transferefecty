import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { SwapForm } from "./swap-form";

export const metadata: Metadata = { title: "Swap" };

export default async function SwapPage() {
  const user = await requireUser();
  const [feePercent, history] = await Promise.all([
    getSetting("swap_fee_percent", "0.1"),
    db.swap.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 15 }),
  ]);

  if (!user.allowSwap) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-warning)]">
        Los intercambios están deshabilitados para tu cuenta. Pide permiso a tu
        SuperWorker o SuperAdmin.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Swap Crypto</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Intercambia entre tus monedas al instante, según el precio de mercado.
        </p>
      </div>

      <div className="max-w-md">
        <SwapForm feePercent={Number(feePercent)} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Historial
        </h2>
        <div className="ge-card divide-y divide-[var(--ge-border)]">
          {history.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-[var(--ge-text-primary)]">
                {Number(s.fromAmount)} {s.fromCurrency} → {Number(s.toAmount).toFixed(6)}{" "}
                {s.toCurrency}
              </span>
              <span className="text-xs text-[var(--ge-text-muted)]">
                {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(s.createdAt)}
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">
              Aún no has hecho ningún swap.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
