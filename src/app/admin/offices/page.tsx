import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { ensureFreshOfficeCodes } from "@/lib/office-code";
import { saveOffice, deleteOffice } from "@/app/actions/admin-offices";

export const metadata: Metadata = { title: "Admin · Oficinas" };

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-2 py-1.5 text-sm text-[var(--ge-text-primary)] outline-none";

export default async function AdminOfficesPage() {
  await requireRole(["superadmin"]);
  await ensureFreshOfficeCodes();

  const offices = await db.office.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Oficinas</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          El código de registro diario lo rota el sistema automáticamente.
        </p>
      </div>

      <form action={saveOffice} className="ge-card flex flex-wrap items-end gap-3 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--ge-text-secondary)]">Nombre</label>
          <input name="name" required className={fieldClass} />
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--ge-text-secondary)]">
          <input type="checkbox" name="isActive" defaultChecked /> Activa
        </label>
        <button
          type="submit"
          className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
          style={{ background: "var(--ge-gradient-brand)" }}
        >
          Crear oficina
        </button>
      </form>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {offices.map((o) => (
          <div key={o.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--ge-text-primary)]">{o.name}</p>
              <p className="text-xs text-[var(--ge-text-muted)]">
                Código hoy: <span className="font-mono">{o.code ?? "—"}</span> ·{" "}
                {o._count.users} usuarios · {o.isActive ? "Activa" : "Inactiva"}
              </p>
            </div>
            <div className="flex gap-2">
              <form action={saveOffice} className="flex items-center gap-2">
                <input type="hidden" name="officeId" value={o.id} />
                <input type="hidden" name="name" value={o.name} />
                <input type="hidden" name="isActive" value={o.isActive ? "" : "on"} />
                <button
                  type="submit"
                  className="rounded-[var(--ge-radius-sm)] px-3 py-1.5 text-xs font-medium text-[var(--ge-text-inverse)]"
                  style={{ background: o.isActive ? "var(--ge-error)" : "var(--ge-success)" }}
                >
                  {o.isActive ? "Desactivar" : "Activar"}
                </button>
              </form>
              <form action={deleteOffice}>
                <input type="hidden" name="officeId" value={o.id} />
                <button
                  type="submit"
                  className="rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] px-3 py-1.5 text-xs text-[var(--ge-text-secondary)]"
                >
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
