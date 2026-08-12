import { requireAdmin } from "@/lib/auth/dal";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={user.role} />
      <div className="flex-1">
        <header className="flex items-center justify-end gap-3 border-b border-[var(--ge-border)] px-6 py-3">
          <div className="text-right">
            <p className="text-sm font-medium text-[var(--ge-text-primary)]">
              {user.fullName}
            </p>
            <p className="text-xs uppercase tracking-wide text-[var(--ge-cyan)]">
              {user.role}
            </p>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
