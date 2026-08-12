import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Transacciones" };

const STATUS_COLOR: Record<string, string> = {
  pending: "var(--ge-warning)",
  completed: "var(--ge-success)",
  failed: "var(--ge-error)",
  cancelled: "var(--ge-text-muted)",
};

const TYPE_LABEL: Record<string, string> = {
  deposit: "Depósito",
  withdrawal: "Retiro",
  swap: "Swap",
  stake: "CDT",
  unstake: "Retiro CDT",
  reward: "Rendimiento",
  adjustment: "Ajuste",
  send: "Envío",
  receive: "Recepción",
};

export default async function TransactionsPage() {
  const user = await requireUser();
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Transacciones</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Últimos 50 movimientos de tu cuenta.
        </p>
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--ge-text-primary)]">
                {TYPE_LABEL[tx.type] ?? tx.type} · {tx.currency}
              </p>
              <p className="text-xs text-[var(--ge-text-muted)]">
                {tx.description ?? "—"} ·{" "}
                {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(
                  tx.createdAt
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--ge-text-primary)]">
                {Number(tx.amount).toLocaleString("es-CO", { maximumFractionDigits: 8 })}
              </p>
              <span
                className="text-xs font-semibold uppercase"
                style={{ color: STATUS_COLOR[tx.status] }}
              >
                {tx.status}
              </span>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">
            Aún no tienes transacciones.
          </p>
        )}
      </div>
    </div>
  );
}
