import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { replyTicket } from "@/app/actions/support";

export const metadata: Metadata = { title: "Ticket" };

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const user = await requireUser();
  const { ticketId } = await params;
  const id = Number(ticketId);

  const ticket = await db.supportTicket.findFirst({ where: { id, userId: user.id } });
  if (!ticket) redirect("/app/support");

  const messages = await db.supportMessage.findMany({
    where: { ticketId: id },
    include: { sender: { select: { fullName: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          {ticket.subject}
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Ticket #{ticket.id} · {ticket.status}
        </p>
      </div>

      <div className="ge-card flex flex-col gap-4 p-4">
        {messages.map((m) => (
          <div key={m.id} className={m.senderId === user.id ? "text-right" : ""}>
            <p className="text-xs text-[var(--ge-text-muted)]">
              {m.sender.fullName} ·{" "}
              {new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(
                m.createdAt
              )}
            </p>
            <p
              className={`mt-1 inline-block rounded-[var(--ge-radius-sm)] px-3 py-2 text-sm ${
                m.senderId === user.id
                  ? "bg-[var(--ge-violet)] text-white"
                  : "bg-[var(--ge-bg-elevated)] text-[var(--ge-text-primary)]"
              }`}
            >
              {m.message}
            </p>
          </div>
        ))}
      </div>

      {ticket.status !== "closed" && (
        <form action={replyTicket} className="flex gap-2">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <textarea
            name="message"
            required
            rows={2}
            placeholder="Escribe una respuesta…"
            className="flex-1 rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none"
          />
          <button
            type="submit"
            className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
            style={{ background: "var(--ge-gradient-brand)" }}
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}
