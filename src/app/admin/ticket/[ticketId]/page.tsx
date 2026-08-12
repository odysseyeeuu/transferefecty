import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";
import { adminReplyTicket } from "@/app/actions/support";

export const metadata: Metadata = { title: "Admin · Ticket" };

const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const admin = await requireRole(["superadmin", "superworker"]);
  const { ticketId } = await params;
  const id = Number(ticketId);
  const scope = officeScopeId(admin);

  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: { user: { select: { fullName: true, email: true, officeId: true } } },
  });
  if (!ticket || (scope > 0 && ticket.user.officeId !== scope)) {
    redirect("/admin/tickets");
  }

  const messages = await db.supportMessage.findMany({
    where: { ticketId: id },
    include: { sender: { select: { fullName: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">{ticket.subject}</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          {ticket.user.fullName} ({ticket.user.email}) · #{ticket.id} · {ticket.status}
        </p>
      </div>

      <div className="ge-card flex flex-col gap-4 p-4">
        {messages.map((m) => (
          <div key={m.id} className={m.sender.role !== "user" ? "text-right" : ""}>
            <p className="text-xs text-[var(--ge-text-muted)]">
              {m.sender.fullName} ·{" "}
              {new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(
                m.createdAt
              )}
            </p>
            <p
              className={`mt-1 inline-block rounded-[var(--ge-radius-sm)] px-3 py-2 text-sm ${
                m.sender.role !== "user"
                  ? "bg-[var(--ge-violet)] text-white"
                  : "bg-[var(--ge-bg-elevated)] text-[var(--ge-text-primary)]"
              }`}
            >
              {m.message}
            </p>
          </div>
        ))}
      </div>

      <form action={adminReplyTicket} className="ge-card flex flex-col gap-3 p-4">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <textarea
          name="message"
          required
          rows={3}
          placeholder="Responder…"
          className="rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none"
        />
        <div className="flex items-center gap-2">
          <select
            name="status"
            defaultValue=""
            className="rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-2 py-1.5 text-sm text-[var(--ge-text-primary)]"
          >
            <option value="">Mantener/auto</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
            style={{ background: "var(--ge-gradient-brand)" }}
          >
            Responder
          </button>
        </div>
      </form>
    </div>
  );
}
