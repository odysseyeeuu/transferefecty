import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admin · SuperWorkers" };

export default async function AdminWorkersPage() {
  await requireRole(["superadmin"]);
  const workers = await db.user.findMany({
    where: { role: "superworker" },
    include: { office: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">SuperWorkers</h1>
        <Link
          href="/admin/create-worker"
          className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
          style={{ background: "var(--ge-gradient-brand)" }}
        >
          + Crear SuperWorker
        </Link>
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {workers.map((w) => (
          <Link
            key={w.id}
            href={`/admin/user/${w.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-[var(--ge-bg-elevated)]"
          >
            <div>
              <p className="text-sm font-medium text-[var(--ge-text-primary)]">{w.fullName}</p>
              <p className="text-xs text-[var(--ge-text-muted)]">{w.email}</p>
            </div>
            <span className="text-xs text-[var(--ge-text-muted)]">{w.office?.name ?? "Sin oficina"}</span>
          </Link>
        ))}
        {workers.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin SuperWorkers.</p>
        )}
      </div>
    </div>
  );
}
