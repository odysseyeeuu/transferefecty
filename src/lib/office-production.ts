import "server-only";
import { db } from "@/lib/db";

/**
 * Producción por oficina en un rango de fechas — puerto de
 * `AdminController::officeProductionByRange()`.
 *
 * Mismas métricas y mismos criterios que la v1:
 *  - clientes: usuarios con rol `user` creados en el rango
 *  - depósitos: transacciones `deposit` en estado `completed` (cantidad y monto)
 *  - retiros: transacciones `withdrawal` en estado `completed` (monto)
 *  - swaps: suma de `fromAmount` de swaps `completed`
 *
 * Nota heredada de la v1: los montos se suman **sin convertir a una moneda
 * común**, así que mezclan BTC con USDT. Sirven como indicador de actividad,
 * no como un total financiero. Se mantiene igual para no cambiar el
 * significado de un reporte que el equipo ya conoce.
 */

export interface OfficeProduction {
  officeId: number;
  officeName: string;
  clientes: number;
  depositosN: number;
  depositosMonto: number;
  retirosMonto: number;
  swapsVol: number;
}

/** `to` es inclusivo: se convierte en "< día siguiente a las 00:00". */
function rangeBounds(from: string, to: string) {
  const gte = new Date(`${from}T00:00:00`);
  const lt = new Date(`${to}T00:00:00`);
  lt.setDate(lt.getDate() + 1);
  return { gte, lt };
}

export async function officeProductionByRange(
  from: string,
  to: string,
  onlyOfficeId?: number
): Promise<OfficeProduction[]> {
  const { gte, lt } = rangeBounds(from, to);
  const officeWhere = onlyOfficeId ? { id: onlyOfficeId } : {};

  const offices = await db.office.findMany({
    where: officeWhere,
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  if (offices.length === 0) return [];

  const officeIds = offices.map((o) => o.id);
  const userScope = { officeId: { in: officeIds } };

  const [clientes, depositos, retiros, swaps] = await Promise.all([
    db.user.groupBy({
      by: ["officeId"],
      where: { role: "user", ...userScope, createdAt: { gte, lt } },
      _count: { _all: true },
    }),
    db.transaction.groupBy({
      by: ["userId"],
      where: {
        type: "deposit",
        status: "completed",
        createdAt: { gte, lt },
        user: userScope,
      },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    db.transaction.groupBy({
      by: ["userId"],
      where: {
        type: "withdrawal",
        status: "completed",
        createdAt: { gte, lt },
        user: userScope,
      },
      _sum: { amount: true },
    }),
    db.swap.groupBy({
      by: ["userId"],
      where: { status: "completed", createdAt: { gte, lt }, user: userScope },
      _sum: { fromAmount: true },
    }),
  ]);

  // Las agregaciones de transacciones/swaps vienen por usuario; hay que
  // mapearlas a su oficina.
  const involvedUserIds = [
    ...new Set([
      ...depositos.map((d) => d.userId),
      ...retiros.map((r) => r.userId),
      ...swaps.map((s) => s.userId),
    ]),
  ];
  const userOffice = new Map<number, number | null>();
  if (involvedUserIds.length > 0) {
    const users = await db.user.findMany({
      where: { id: { in: involvedUserIds } },
      select: { id: true, officeId: true },
    });
    for (const u of users) userOffice.set(u.id, u.officeId);
  }

  const rows = new Map<number, OfficeProduction>(
    offices.map((o) => [
      o.id,
      {
        officeId: o.id,
        officeName: o.name,
        clientes: 0,
        depositosN: 0,
        depositosMonto: 0,
        retirosMonto: 0,
        swapsVol: 0,
      },
    ])
  );

  for (const c of clientes) {
    const row = c.officeId != null ? rows.get(c.officeId) : undefined;
    if (row) row.clientes = c._count._all;
  }
  for (const d of depositos) {
    const officeId = userOffice.get(d.userId);
    const row = officeId != null ? rows.get(officeId) : undefined;
    if (row) {
      row.depositosN += d._count._all;
      row.depositosMonto += Number(d._sum.amount ?? 0);
    }
  }
  for (const r of retiros) {
    const officeId = userOffice.get(r.userId);
    const row = officeId != null ? rows.get(officeId) : undefined;
    if (row) row.retirosMonto += Number(r._sum.amount ?? 0);
  }
  for (const s of swaps) {
    const officeId = userOffice.get(s.userId);
    const row = officeId != null ? rows.get(officeId) : undefined;
    if (row) row.swapsVol += Number(s._sum.fromAmount ?? 0);
  }

  return [...rows.values()];
}

/** Valida `YYYY-MM-DD`; devuelve null si no es una fecha real. */
export function validDate(raw: string | undefined | null): string | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : raw;
}

export function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const from = `${to.slice(0, 7)}-01`; // primer día del mes en curso
  return { from, to };
}
