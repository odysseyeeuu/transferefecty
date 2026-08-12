import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { AppSidebar } from "@/components/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  // Puerto de la v1: si un admin marcó `force_password_change`, no dejar
  // pasar a ninguna pantalla del dashboard hasta que cambie la contraseña.
  if (user.forcePasswordChange) {
    redirect("/app/force-password-change");
  }
  const isAdmin = user.role === "superadmin" || user.role === "superworker";

  return (
    <div className="flex min-h-screen">
      <AppSidebar isAdmin={isAdmin} />
      <div className="flex-1">
        <header className="flex items-center justify-end gap-3 border-b border-[var(--ge-border)] px-6 py-3">
          <div className="text-right">
            <p className="text-sm font-medium text-[var(--ge-text-primary)]">
              {user.fullName}
            </p>
            <p className="text-xs text-[var(--ge-text-muted)]">{user.email}</p>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
