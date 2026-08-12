import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";
import { WITHDRAW_CURRENCIES, NETWORKS_BY_CURRENCY } from "@/lib/config/currencies";
import { saveDepositWallet, deleteDepositWallet } from "@/app/actions/admin-deposit-wallets";

export const metadata: Metadata = { title: "Admin · Wallets de depósito" };

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-2 py-1.5 text-sm text-[var(--ge-text-primary)] outline-none";

export default async function AdminDepositWalletsPage() {
  const admin = await requireRole(["superadmin", "superworker"]);
  const isSuperAdmin = admin.role === "superadmin";
  const officeId = officeScopeId(admin);

  if (!isSuperAdmin && officeId <= 0) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
        No tienes una oficina asignada.
      </p>
    );
  }

  const wallets = await db.officeDepositWallet.findMany({
    where: isSuperAdmin ? {} : { officeId },
    include: { office: { select: { name: true } } },
    orderBy: [{ currency: "asc" }, { network: "asc" }],
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          Wallets de depósito
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          {isSuperAdmin
            ? "Vista de todas las oficinas (sólo lectura para SuperAdmin)."
            : "Administra las wallets de tu oficina."}
        </p>
      </div>

      {!isSuperAdmin && (
        <form action={saveDepositWallet} className="ge-card flex flex-wrap items-end gap-3 p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--ge-text-secondary)]">Moneda</label>
            <select name="currency" className={fieldClass}>
              {WITHDRAW_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--ge-text-secondary)]">Red</label>
            <select name="network" className={fieldClass}>
              {Object.values(NETWORKS_BY_CURRENCY)
                .flat()
                .filter((v, i, arr) => arr.indexOf(v) === i)
                .map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--ge-text-secondary)]">Dirección</label>
            <input name="address" required className={`${fieldClass} w-64`} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--ge-text-secondary)]">Etiqueta</label>
            <input name="label" className={fieldClass} />
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--ge-text-secondary)]">
            <input type="checkbox" name="isActive" defaultChecked /> Activa
          </label>
          <button
            type="submit"
            className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
            style={{ background: "var(--ge-gradient-brand)" }}
          >
            Guardar
          </button>
        </form>
      )}

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {wallets.map((w) => (
          <div key={w.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="text-[var(--ge-text-primary)]">
                {w.currency} · {w.network} {isSuperAdmin && `· ${w.office.name}`}
              </p>
              <p className="font-mono text-xs text-[var(--ge-text-muted)]">{w.address}</p>
            </div>
            {!isSuperAdmin && (
              <form action={deleteDepositWallet}>
                <input type="hidden" name="walletId" value={w.id} />
                <button
                  type="submit"
                  className="rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] px-3 py-1.5 text-xs text-[var(--ge-text-secondary)]"
                >
                  Eliminar
                </button>
              </form>
            )}
          </div>
        ))}
        {wallets.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin wallets registradas.</p>
        )}
      </div>
    </div>
  );
}
