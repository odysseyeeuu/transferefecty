import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";

export const metadata: Metadata = { title: "Admin · Tickets" };

const STATUS_LABEL: Record<string, string> = {
  open: "Abierto",
  in_progress: "En progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
};

export default async function AdminTicketsPage() {
  const admin = await requireRole(["superadmin", "superworker"]);
  const scope = officeScopeId(admin);

  if (admin.role === "superworker" && scope <= 0) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
        No tienes una oficina asignada.
      </p>
    );
  }

  const tickets = await db.supportTicket.findMany({
    where: scope > 0 ? { user: { officeId: scope } } : {},
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Tickets de soporte</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">{tickets.length} tickets.</p>
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {tickets.map((t) => (
          <Link
            key={t.id}
            href={`/admin/ticket/${t.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-[var(--ge-bg-elevated)]"
          >
            <div>
              <p className="text-sm font-medium text-[var(--ge-text-primary)]">{t.subject}</p>
              <p className="text-xs text-[var(--ge-text-muted)]">
                {t.user.fullName} ({t.user.email}) · #{t.id}
              </p>
            </div>
            <span className="text-xs font-medium text-[var(--ge-cyan)]">
              {STATUS_LABEL[t.status]}
            </span>
          </Link>
        ))}
        {tickets.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin tickets.</p>
        )}
      </div>
    </div>
  );
}
