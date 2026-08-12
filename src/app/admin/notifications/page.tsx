import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";
import { SendNotificationForm } from "./send-notification-form";

export const metadata: Metadata = { title: "Admin · Notificaciones masivas" };

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const admin = await requireRole(["superadmin", "superworker"]);
  const { sent } = await searchParams;
  const scope = officeScopeId(admin);
  const isSuperAdmin = admin.role === "superadmin";

  const recent = await db.notification.findMany({
    where: {
      user: {
        role: "user",
        ...(isSuperAdmin ? {} : scope > 0 ? { officeId: scope } : { id: -1 }),
      },
    },
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          Notificaciones masivas
        </h1>
        {sent && (
          <p className="mt-1 text-sm text-[var(--ge-success)]">
            Notificación enviada a {sent} usuario{sent === "1" ? "" : "s"}.
          </p>
        )}
      </div>

      <SendNotificationForm isSuperAdmin={isSuperAdmin} />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Enviadas recientemente
        </h2>
        <div className="ge-card divide-y divide-[var(--ge-border)]">
          {recent.map((n) => (
            <div key={n.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="text-[var(--ge-text-primary)]">{n.title}</p>
                <p className="text-xs text-[var(--ge-text-muted)]">
                  {n.user.fullName} ({n.user.email})
                </p>
              </div>
              <span className="text-xs text-[var(--ge-text-muted)]">
                {new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(
                  n.createdAt
                )}
              </span>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">
              Sin notificaciones enviadas todavía.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
