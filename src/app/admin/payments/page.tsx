import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";
import { reviewPaymentRequestForm } from "@/app/actions/payments";

export const metadata: Metadata = { title: "Admin · Depósitos / Retiros" };

export default async function AdminPaymentsPage() {
  const admin = await requireRole(["superadmin", "superworker"]);
  const scope = officeScopeId(admin);

  const requests = await db.depositRequest.findMany({
    where: {
      status: "pending",
      ...(scope > 0 ? { user: { officeId: scope } } : {}),
    },
    include: { user: { select: { fullName: true, email: true, officeId: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          Depósitos / Retiros pendientes
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          {requests.length} solicitud{requests.length === 1 ? "" : "es"} en cola.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {requests.map((r) => (
          <div key={r.id} className="ge-card flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--ge-text-primary)]">
                  {r.type === "deposit" ? "Depósito" : "Retiro"} · {Number(r.amount)}{" "}
                  {r.currency}
                </p>
                <p className="text-xs text-[var(--ge-text-muted)]">
                  {r.user.fullName} ({r.user.email})
                </p>
                {r.destinationAddress && (
                  <p className="text-xs text-[var(--ge-text-muted)]">
                    Destino: {r.destinationAddress}
                  </p>
                )}
                {r.notes && <p className="text-xs text-[var(--ge-text-muted)]">{r.notes}</p>}
              </div>
            </div>
            <form action={reviewPaymentRequestForm} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="requestId" value={r.id} />
              <input
                type="text"
                name="staffNote"
                placeholder="Nota visible al cliente (opcional)"
                className="min-w-[14rem] flex-1 rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-2 py-1.5 text-sm text-[var(--ge-text-primary)] outline-none"
              />
              <button
                type="submit"
                name="decision"
                value="approved"
                className="rounded-[var(--ge-radius-sm)] px-3 py-1.5 text-sm font-medium text-[var(--ge-text-inverse)]"
                style={{ background: "var(--ge-success)" }}
              >
                Aprobar
              </button>
              <button
                type="submit"
                name="decision"
                value="rejected"
                className="rounded-[var(--ge-radius-sm)] px-3 py-1.5 text-sm font-medium text-[var(--ge-text-inverse)]"
                style={{ background: "var(--ge-error)" }}
              >
                Rechazar
              </button>
            </form>
          </div>
        ))}

        {requests.length === 0 && (
          <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
            No hay solicitudes pendientes.
          </p>
        )}
      </div>
    </div>
  );
}
