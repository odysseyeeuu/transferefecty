import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";

export const metadata: Metadata = { title: "Admin · Swaps" };

// Nota: en v2 todo swap se ejecuta al instante (ver docs/PARIDAD.md) — esta
// pantalla es de auditoría/lectura, no de aprobación.
export default async function AdminSwapsPage() {
  const admin = await requireRole(["superadmin", "superworker"]);
  const scope = officeScopeId(admin);

  const swaps = await db.swap.findMany({
    where: scope > 0 ? { user: { officeId: scope } } : {},
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Swaps</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Auditoría de los últimos 100 intercambios (todos se ejecutan al instante).
        </p>
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {swaps.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="text-[var(--ge-text-primary)]">
                {s.user.fullName} · {Number(s.fromAmount)} {s.fromCurrency} →{" "}
                {Number(s.toAmount).toFixed(6)} {s.toCurrency}
              </p>
              <p className="text-xs text-[var(--ge-text-muted)]">{s.user.email}</p>
            </div>
            <span className="text-xs text-[var(--ge-text-muted)]">
              {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(
                s.createdAt
              )}
            </span>
          </div>
        ))}
        {swaps.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin swaps todavía.</p>
        )}
      </div>
    </div>
  );
}
