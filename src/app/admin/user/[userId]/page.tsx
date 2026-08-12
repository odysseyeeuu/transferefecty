import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";
import { updateUserPermissions, deleteUser } from "@/app/actions/admin-users";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Admin · Detalle de usuario" };

const checkboxClass = "flex items-center gap-2 text-sm text-[var(--ge-text-secondary)]";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const admin = await requireRole(["superadmin", "superworker"]);
  const { userId } = await params;
  const id = Number(userId);
  const scope = officeScopeId(admin);

  const user = await db.user.findUnique({ where: { id } });
  if (!user) redirect("/admin/users");
  if (admin.role === "superworker" && (user.role !== "user" || scope <= 0 || user.officeId !== scope)) {
    redirect("/admin/users");
  }

  const [wallets, transactions, offices] = await Promise.all([
    db.wallet.findMany({ where: { userId: id }, orderBy: { currency: "asc" } }),
    db.transaction.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    admin.role === "superadmin" ? db.office.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);

  const isSuperAdmin = admin.role === "superadmin";

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">{user.fullName}</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          {user.email} · {user.role} · KYC: {user.kycStatus}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Permisos y estado
        </h2>
        <form action={updateUserPermissions} className="ge-card flex flex-col gap-4 p-4">
          <input type="hidden" name="userId" value={user.id} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--ge-text-secondary)]">Nombre</label>
            <input
              name="fullName"
              defaultValue={user.fullName}
              className="rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <label className={checkboxClass}>
              <input type="checkbox" name="allowBuy" defaultChecked={user.allowBuy} /> Comprar
            </label>
            <label className={checkboxClass}>
              <input type="checkbox" name="allowSell" defaultChecked={user.allowSell} /> Vender
            </label>
            <label className={checkboxClass}>
              <input type="checkbox" name="allowSend" defaultChecked={user.allowSend} /> Enviar
            </label>
            <label className={checkboxClass}>
              <input type="checkbox" name="allowSwap" defaultChecked={user.allowSwap} /> Swap
            </label>
            <label className={checkboxClass}>
              <input type="checkbox" name="allowStaking" defaultChecked={user.allowStaking} /> CDT / Stake
            </label>
            <label className={checkboxClass}>
              <input type="checkbox" name="isActive" defaultChecked={user.isActive} /> Cuenta activa
            </label>
          </div>

          {isSuperAdmin && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--ge-text-secondary)]">Rol</label>
                <select
                  name="role"
                  defaultValue={user.role}
                  className="rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-2 py-1.5 text-sm text-[var(--ge-text-primary)]"
                >
                  <option value="user">user</option>
                  <option value="superworker">superworker</option>
                  <option value="superadmin">superadmin</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--ge-text-secondary)]">Oficina</label>
                <select
                  name="officeId"
                  defaultValue={user.officeId ?? ""}
                  className="rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-2 py-1.5 text-sm text-[var(--ge-text-primary)]"
                >
                  <option value="">—</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[var(--ge-text-secondary)]">
              Nota visible en el dashboard del cliente
            </label>
            <textarea
              name="dashboardNote"
              defaultValue={user.dashboardNote ?? ""}
              rows={2}
              className="rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none"
            />
          </div>

          <button
            type="submit"
            className="self-start rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
            style={{ background: "var(--ge-gradient-brand)" }}
          >
            Guardar cambios
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Wallets
        </h2>
        <div className="ge-card divide-y divide-[var(--ge-border)]">
          {wallets.map((w) => (
            <div key={w.id} className="flex justify-between px-4 py-2 text-sm">
              <span className="text-[var(--ge-text-primary)]">{w.currency}</span>
              <span className="text-[var(--ge-text-secondary)]">{Number(w.balance)}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Últimas transacciones
        </h2>
        <div className="ge-card divide-y divide-[var(--ge-border)]">
          {transactions.map((t) => (
            <div key={t.id} className="flex justify-between px-4 py-2 text-sm">
              <span className="text-[var(--ge-text-primary)]">
                {t.type} · {t.currency}
              </span>
              <span className="text-[var(--ge-text-secondary)]">{Number(t.amount)}</span>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="px-4 py-4 text-sm text-[var(--ge-text-secondary)]">Sin movimientos.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Restablecer contraseña
        </h2>
        <div className="ge-card p-4">
          <ResetPasswordForm userId={user.id} />
        </div>
      </section>

      {isSuperAdmin && user.id !== admin.id && ["user", "superworker"].includes(user.role) && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-error)]">
            Zona de peligro
          </h2>
          <form action={deleteUser} className="ge-card p-4">
            <input type="hidden" name="userId" value={user.id} />
            <button
              type="submit"
              className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
              style={{ background: "var(--ge-error)" }}
            >
              Eliminar usuario
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
