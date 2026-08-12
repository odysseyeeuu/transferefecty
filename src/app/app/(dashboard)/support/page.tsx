import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { CreateTicketForm } from "./create-ticket-form";

export const metadata: Metadata = { title: "Soporte" };

const STATUS_LABEL: Record<string, string> = {
  open: "Abierto",
  in_progress: "En progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
};

export default async function SupportPage() {
  const user = await requireUser();
  const tickets = await db.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Soporte</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Crea un ticket y el equipo de tu oficina te responderá.
        </p>
      </div>

      <div className="max-w-md">
        <CreateTicketForm />
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {tickets.map((t) => (
          <Link
            key={t.id}
            href={`/app/support/ticket/${t.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-[var(--ge-bg-elevated)]"
          >
            <div>
              <p className="text-sm font-medium text-[var(--ge-text-primary)]">{t.subject}</p>
              <p className="text-xs text-[var(--ge-text-muted)]">
                Ticket #{t.id} ·{" "}
                {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(t.updatedAt)}
              </p>
            </div>
            <span className="text-xs font-medium text-[var(--ge-cyan)]">
              {STATUS_LABEL[t.status]}
            </span>
          </Link>
        ))}
        {tickets.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">
            No tienes tickets todavía.
          </p>
        )}
      </div>
    </div>
  );
}
