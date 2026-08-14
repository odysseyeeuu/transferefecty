import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";
import {
  officeProductionByRange,
  validDate,
  defaultRange,
  type OfficeProduction,
} from "@/lib/office-production";

export const metadata: Metadata = { title: "Admin · Producción" };

const num = (n: number, max = 8) =>
  n.toLocaleString("es-CO", { maximumFractionDigits: max });

export default async function AdminProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; office?: string }>;
}) {
  const admin = await requireRole(["superadmin", "superworker"]);
  const scope = officeScopeId(admin);
  const params = await searchParams;

  const fallback = defaultRange();
  let from = validDate(params.from) ?? fallback.from;
  let to = validDate(params.to) ?? fallback.to;
  if (from > to) [from, to] = [to, from];

  // SuperWorker queda fijado a su oficina; SuperAdmin puede filtrar o ver todas.
  const requestedOffice = Number(params.office) || 0;
  const officeFilter = scope > 0 ? scope : requestedOffice || undefined;

  if (admin.role === "superworker" && scope <= 0) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
        No tienes una oficina asignada.
      </p>
    );
  }

  const [rows, offices] = await Promise.all([
    officeProductionByRange(from, to, officeFilter),
    admin.role === "superadmin"
      ? db.office.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
      : Promise.resolve([]),
  ]);

  const totals = rows.reduce<Omit<OfficeProduction, "officeId" | "officeName">>(
    (acc, r) => ({
      clientes: acc.clientes + r.clientes,
      depositosN: acc.depositosN + r.depositosN,
      depositosMonto: acc.depositosMonto + r.depositosMonto,
      retirosMonto: acc.retirosMonto + r.retirosMonto,
      swapsVol: acc.swapsVol + r.swapsVol,
    }),
    { clientes: 0, depositosN: 0, depositosMonto: 0, retirosMonto: 0, swapsVol: 0 }
  );

  const fieldClass =
    "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-2 py-1.5 text-sm text-[var(--ge-text-primary)] outline-none";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Producción</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Actividad por oficina entre {from} y {to} (ambos días incluidos).
        </p>
      </div>

      <form className="ge-card flex flex-wrap items-end gap-3 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--ge-text-secondary)]">Desde</label>
          <input type="date" name="from" defaultValue={from} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--ge-text-secondary)]">Hasta</label>
          <input type="date" name="to" defaultValue={to} className={fieldClass} />
        </div>
        {admin.role === "superadmin" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--ge-text-secondary)]">Oficina</label>
            <select name="office" defaultValue={String(requestedOffice || "")} className={fieldClass}>
              <option value="">Todas</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="submit"
          className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
          style={{ background: "var(--ge-gradient-brand)" }}
        >
          Aplicar
        </button>
      </form>

      <div className="ge-card overflow-x-auto">
        <table className="w-full min-w-[42rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--ge-border)] text-left text-xs uppercase tracking-wider text-[var(--ge-text-muted)]">
              <th className="px-4 py-3 font-semibold">Oficina</th>
              <th className="px-4 py-3 text-right font-semibold">Clientes nuevos</th>
              <th className="px-4 py-3 text-right font-semibold">Depósitos</th>
              <th className="px-4 py-3 text-right font-semibold">Monto depositado</th>
              <th className="px-4 py-3 text-right font-semibold">Monto retirado</th>
              <th className="px-4 py-3 text-right font-semibold">Volumen swaps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ge-border)]">
            {rows.map((r) => (
              <tr key={r.officeId}>
                <td className="px-4 py-3 text-[var(--ge-text-primary)]">{r.officeName}</td>
                <td className="px-4 py-3 text-right text-[var(--ge-text-secondary)]">{r.clientes}</td>
                <td className="px-4 py-3 text-right text-[var(--ge-text-secondary)]">{r.depositosN}</td>
                <td className="px-4 py-3 text-right text-[var(--ge-text-secondary)]">{num(r.depositosMonto)}</td>
                <td className="px-4 py-3 text-right text-[var(--ge-text-secondary)]">{num(r.retirosMonto)}</td>
                <td className="px-4 py-3 text-right text-[var(--ge-text-secondary)]">{num(r.swapsVol)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-[var(--ge-text-secondary)]">
                  Sin oficinas para mostrar.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 1 && (
            <tfoot>
              <tr className="border-t border-[var(--ge-border)] font-semibold text-[var(--ge-text-primary)]">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right">{totals.clientes}</td>
                <td className="px-4 py-3 text-right">{totals.depositosN}</td>
                <td className="px-4 py-3 text-right">{num(totals.depositosMonto)}</td>
                <td className="px-4 py-3 text-right">{num(totals.retirosMonto)}</td>
                <td className="px-4 py-3 text-right">{num(totals.swapsVol)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <p className="text-xs text-[var(--ge-text-muted)]">
        Los montos suman las cantidades tal cual, sin convertir a una moneda común (misma
        convención que la versión anterior): son un indicador de actividad, no un total
        financiero.
      </p>
    </div>
  );
}
