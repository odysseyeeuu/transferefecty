import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { CRYPTO_CURRENCIES } from "@/lib/config/currencies";
import { createStakePlan, toggleStakePlan } from "@/app/actions/stake";

export const metadata: Metadata = { title: "Admin · Planes CDT" };

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-2 py-1.5 text-sm text-[var(--ge-text-primary)] outline-none";

export default async function AdminStakePlansPage() {
  await requireRole(["superadmin"]);
  const plans = await db.stakePlan.findMany({ orderBy: [{ currency: "asc" }, { lockDays: "asc" }] });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Planes CDT</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Sólo SuperAdmin puede crear o desactivar planes.
        </p>
      </div>

      <form action={createStakePlan} className="ge-card flex flex-wrap items-end gap-3 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--ge-text-secondary)]">Nombre</label>
          <input name="name" required className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--ge-text-secondary)]">Moneda</label>
          <select name="currency" className={fieldClass}>
            {CRYPTO_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--ge-text-secondary)]">APY %</label>
          <input name="apyPercent" type="number" step="0.01" required className={`${fieldClass} w-24`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--ge-text-secondary)]">Mínimo</label>
          <input name="minAmount" type="number" step="any" required className={`${fieldClass} w-28`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--ge-text-secondary)]">Días bloqueo (0 = flexible)</label>
          <input name="lockDays" type="number" min="0" defaultValue={0} className={`${fieldClass} w-32`} />
        </div>
        <button
          type="submit"
          className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
          style={{ background: "var(--ge-gradient-brand)" }}
        >
          Crear plan
        </button>
      </form>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {plans.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--ge-text-primary)]">
                {p.name} — {p.currency}
              </p>
              <p className="text-xs text-[var(--ge-text-muted)]">
                {Number(p.apyPercent)}% APY · mín. {Number(p.minAmount)} ·{" "}
                {p.lockDays > 0 ? `${p.lockDays} días` : "flexible"}
              </p>
            </div>
            <form action={toggleStakePlan}>
              <input type="hidden" name="planId" value={p.id} />
              <button
                type="submit"
                className="rounded-[var(--ge-radius-sm)] px-3 py-1.5 text-xs font-medium text-[var(--ge-text-inverse)]"
                style={{ background: p.isActive ? "var(--ge-error)" : "var(--ge-success)" }}
              >
                {p.isActive ? "Desactivar" : "Activar"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
