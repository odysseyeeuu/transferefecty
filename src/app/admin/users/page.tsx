import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";

export const metadata: Metadata = { title: "Admin · Usuarios" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; kyc?: string }>;
}) {
  const admin = await requireRole(["superadmin", "superworker"]);
  const scope = officeScopeId(admin);
  const { q, role, kyc } = await searchParams;

  if (admin.role === "superworker" && scope <= 0) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
        No tienes una oficina asignada.
      </p>
    );
  }

  const users = await db.user.findMany({
    where: {
      ...(scope > 0 ? { officeId: scope } : {}),
      ...(admin.role === "superworker" ? { role: "user" } : {}),
      ...(q ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
      ...(role && ["user", "superworker", "superadmin"].includes(role)
        ? { role: role as "user" | "superworker" | "superadmin" }
        : {}),
      ...(kyc && ["none", "pending", "approved", "rejected"].includes(kyc)
        ? { kycStatus: kyc as "none" | "pending" | "approved" | "rejected" }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Usuarios</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">{users.length} resultados.</p>
      </div>

      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o email"
          className="rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-1.5 text-sm text-[var(--ge-text-primary)] outline-none"
        />
        <button
          type="submit"
          className="rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] px-3 py-1.5 text-sm text-[var(--ge-text-primary)]"
        >
          Buscar
        </button>
      </form>

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
                {u.email} · {u.role} · KYC: {u.kycStatus}
              </p>
            </div>
            <span className={`text-xs font-medium ${u.isActive ? "text-[var(--ge-success)]" : "text-[var(--ge-error)]"}`}>
              {u.isActive ? "Activo" : "Inactivo"}
            </span>
          </Link>
        ))}
        {users.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin resultados.</p>
        )}
      </div>
    </div>
  );
}
