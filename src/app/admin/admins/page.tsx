import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admin · SuperAdmins" };

export default async function AdminAdminsPage() {
  await requireRole(["superadmin"]);
  const admins = await db.user.findMany({
    where: { role: "superadmin" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">SuperAdmins</h1>
        <Link
          href="/admin/create-admin"
          className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
          style={{ background: "var(--ge-gradient-brand)" }}
        >
          + Crear administrador
        </Link>
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--ge-text-primary)]">{a.fullName}</p>
              <p className="text-xs text-[var(--ge-text-muted)]">{a.email}</p>
            </div>
            <span className={`text-xs font-medium ${a.isActive ? "text-[var(--ge-success)]" : "text-[var(--ge-error)]"}`}>
              {a.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        ))}
        {admins.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin administradores.</p>
        )}
      </div>
    </div>
  );
}
