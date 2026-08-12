import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";

export const metadata: Metadata = { title: "Notificaciones" };

const TYPE_COLOR: Record<string, string> = {
  info: "var(--ge-cyan)",
  success: "var(--ge-success)",
  warning: "var(--ge-warning)",
  error: "var(--ge-error)",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireUser();
  const { filter } = await searchParams;
  const unreadOnly = filter === "unread";

  const notifications = await db.notification.findMany({
    where: { userId: user.id, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Notificaciones</h1>
          <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
            {unreadOnly ? "Mostrando sólo no leídas." : "Mostrando todas."}
          </p>
        </div>
        <form action={markAllNotificationsRead}>
          <button
            type="submit"
            className="rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--ge-text-primary)]"
          >
            Marcar todas como leídas
          </button>
        </form>
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-4 px-4 py-3">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: n.isRead ? "var(--ge-text-primary)" : TYPE_COLOR[n.type] }}
              >
                {n.title}
              </p>
              <p className="text-xs text-[var(--ge-text-secondary)]">{n.body}</p>
              <p className="mt-1 text-xs text-[var(--ge-text-muted)]">
                {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(
                  n.createdAt
                )}
              </p>
            </div>
            {!n.isRead && (
              <form action={markNotificationRead}>
                <input type="hidden" name="id" value={n.id} />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] px-2 py-1 text-xs text-[var(--ge-text-secondary)]"
                >
                  Marcar leída
                </button>
              </form>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">
            No hay notificaciones.
          </p>
        )}
      </div>
    </div>
  );
}
