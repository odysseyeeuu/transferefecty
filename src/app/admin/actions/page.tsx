import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admin · Registro de acciones" };

export default async function AdminActionsPage() {
  await requireRole(["superadmin"]);
  const logs = await db.adminLog.findMany({
    include: { admin: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          Registro de acciones
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Auditoría de las últimas 50 acciones de staff (`admin_logs`).
        </p>
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="text-[var(--ge-text-primary)]">
                {log.admin.fullName} · <span className="font-mono">{log.action}</span>
              </p>
              {log.targetType && (
                <p className="text-xs text-[var(--ge-text-muted)]">
                  {log.targetType} #{log.targetId}
                </p>
              )}
            </div>
            <span className="text-xs text-[var(--ge-text-muted)]">
              {new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(
                log.createdAt
              )}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin registros aún.</p>
        )}
      </div>
    </div>
  );
}
