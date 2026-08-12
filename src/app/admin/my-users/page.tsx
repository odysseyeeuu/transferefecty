import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";

export const metadata: Metadata = { title: "Admin · Mis usuarios" };

export default async function AdminMyUsersPage() {
  const admin = await requireRole(["superadmin", "superworker"]);
  const scope = officeScopeId(admin);

  if (admin.role === "superworker" && scope <= 0) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
        No tienes una oficina asignada.
      </p>
    );
  }

  const users = await db.user.findMany({
    where: { role: "user", ...(scope > 0 ? { officeId: scope } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Mis usuarios</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">{users.length} clientes.</p>
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {users.map((u) => (
          <Link
            key={u.id}
            href={`/admin/user/${u.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-[var(--ge-bg-elevated)]"
          >
            <div>
              <p className="text-sm font-medium text-[var(--ge-text-primary)]">{u.fullName}</p>
              <p className="text-xs text-[var(--ge-text-muted)]">
                {u.email} · {u.country ?? "—"} · KYC: {u.kycStatus}
              </p>
            </div>
          </Link>
        ))}
        {users.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin clientes todavía.</p>
        )}
      </div>
    </div>
  );
}
