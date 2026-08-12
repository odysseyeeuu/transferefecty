import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admin · Dashboard" };

async function getStats() {
  const [totalUsers, pendingKyc, pendingDeposits, openTickets, openChats] =
    await Promise.all([
      db.user.count({ where: { role: "user" } }),
      db.kycDocument.count({ where: { status: "pending" } }),
      db.depositRequest.count({ where: { status: "pending" } }),
      db.supportTicket.count({ where: { status: { in: ["open", "in_progress"] } } }),
      db.supportChat.count({ where: { status: { in: ["open", "waiting"] } } }),
    ]);

  return { totalUsers, pendingKyc, pendingDeposits, openTickets, openChats };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Clientes", value: stats.totalUsers },
    { label: "KYC pendiente", value: stats.pendingKyc },
    { label: "Depósitos/Retiros pendientes", value: stats.pendingDeposits },
    { label: "Tickets abiertos", value: stats.openTickets },
    { label: "Chats en vivo abiertos", value: stats.openChats },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          Panel administrativo
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Resumen operativo en tiempo real (Postgres vía Prisma).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="ge-card p-4">
            <p className="text-xs text-[var(--ge-text-muted)]">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold text-[var(--ge-text-primary)]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
        Quedan pendientes: notificaciones masivas avanzadas, reporte de producción por
        oficina y el explorador de base de datos — ver <code>docs/PARIDAD.md</code> para el
        detalle completo.
      </p>
    </div>
  );
}
