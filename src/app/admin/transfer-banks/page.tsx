import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { TRANSFER_BANK_COUNTRIES } from "@/lib/config/countries";
import { saveTransferBank, deleteTransferBank } from "@/app/actions/admin-transfer-banks";

export const metadata: Metadata = { title: "Admin · Bancos Transfer Int." };

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-2 py-1.5 text-sm text-[var(--ge-text-primary)] outline-none";

export default async function AdminTransferBanksPage() {
  await requireRole(["superadmin"]);
  const banks = await db.transferBank.findMany({ orderBy: [{ country: "asc" }, { name: "asc" }] });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          Bancos Transfer Internacional
        </h1>
      </div>

      <form action={saveTransferBank} className="ge-card flex flex-wrap items-end gap-3 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--ge-text-secondary)]">País</label>
          <select name="country" className={fieldClass}>
            {Object.entries(TRANSFER_BANK_COUNTRIES).map(([country, flag]) => (
              <option key={country} value={country}>
                {flag} {country}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--ge-text-secondary)]">Banco</label>
          <input name="name" required className={fieldClass} />
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--ge-text-secondary)]">
          <input type="checkbox" name="isActive" defaultChecked /> Activo
        </label>
        <button
          type="submit"
          className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
          style={{ background: "var(--ge-gradient-brand)" }}
        >
          Agregar banco
        </button>
      </form>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {banks.map((b) => (
          <div key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-[var(--ge-text-primary)]">
              {TRANSFER_BANK_COUNTRIES[b.country] ?? ""} {b.country} — {b.name}{" "}
              {!b.isActive && <span className="text-[var(--ge-text-muted)]">(inactivo)</span>}
            </span>
            <form action={deleteTransferBank}>
              <input type="hidden" name="bankId" value={b.id} />
              <button
                type="submit"
                className="rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] px-3 py-1.5 text-xs text-[var(--ge-text-secondary)]"
              >
                Eliminar
              </button>
            </form>
          </div>
        ))}
        {banks.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin bancos registrados.</p>
        )}
      </div>
    </div>
  );
}
