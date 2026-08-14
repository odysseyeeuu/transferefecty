import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { DepositForm, WithdrawalForm } from "./payment-forms";
import { DepositAddresses } from "./deposit-addresses";

export const metadata: Metadata = { title: "Depositar / Retirar" };

const STATUS_COLOR: Record<string, string> = {
  pending: "var(--ge-warning)",
  approved: "var(--ge-success)",
  completed: "var(--ge-success)",
  rejected: "var(--ge-error)",
};

export default async function PaymentsPage() {
  const user = await requireUser();
  const [requests, depositWallets] = await Promise.all([
    db.depositRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    user.officeId
      ? db.officeDepositWallet.findMany({
          where: { officeId: user.officeId, isActive: true },
          orderBy: [{ currency: "asc" }, { network: "asc" }],
          select: { id: true, currency: true, network: true, address: true, label: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          Depositar / Retirar
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Las solicitudes las revisa un SuperWorker/SuperAdmin antes de acreditarse.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Direcciones para depositar
        </h2>
        <DepositAddresses wallets={depositWallets} />
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DepositForm />
        <WithdrawalForm />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Historial de solicitudes
        </h2>
        <div className="ge-card divide-y divide-[var(--ge-border)]">
          {requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium capitalize text-[var(--ge-text-primary)]">
                  {r.type === "deposit" ? "Depósito" : "Retiro"} · {r.currency}
                </p>
                <p className="text-xs text-[var(--ge-text-muted)]">
                  {Number(r.amount).toLocaleString("es-CO", { maximumFractionDigits: 8 })}{" "}
                  {r.currency} ·{" "}
                  {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(r.createdAt)}
                </p>
                {r.notes && (
                  <p className="text-xs text-[var(--ge-text-muted)]">{r.notes}</p>
                )}
              </div>
              <span
                className="text-xs font-semibold uppercase"
                style={{ color: STATUS_COLOR[r.status] }}
              >
                {r.status}
              </span>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">
              Sin solicitudes todavía.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
