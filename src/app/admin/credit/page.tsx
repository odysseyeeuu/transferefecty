import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";
import { CreditForm } from "./credit-form";

export const metadata: Metadata = { title: "Admin · Agregar fondos" };

export default async function AdminCreditPage() {
  const admin = await requireRole(["superadmin", "superworker"]);
  const scope = officeScopeId(admin);

  const recent = await db.transaction.findMany({
    where: {
      adminId: { not: null },
      ...(scope > 0 ? { user: { officeId: scope } } : {}),
    },
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Agregar fondos</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Crédito/débito manual con auditoría (`admin_logs` + notificación al cliente).
        </p>
      </div>

      <CreditForm />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Movimientos recientes
        </h2>
        <div className="ge-card divide-y divide-[var(--ge-border)]">
          {recent.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-[var(--ge-text-primary)]">
                {tx.user.fullName} — {tx.type} {Number(tx.amount)} {tx.currency}
              </span>
              <span className="text-xs text-[var(--ge-text-muted)]">
                {new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(
                  tx.createdAt
                )}
              </span>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin movimientos.</p>
          )}
        </div>
      </section>
    </div>
  );
}
