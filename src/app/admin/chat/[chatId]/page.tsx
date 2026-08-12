import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";
import { adminReplyChat, adminCloseChat } from "@/app/actions/chat";

export const metadata: Metadata = { title: "Admin · Chat" };

const SENDER_LABEL: Record<string, string> = {
  user: "Cliente",
  superworker: "Staff",
  superadmin: "Staff",
  system: "Sistema",
};

export default async function AdminChatDetailPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const admin = await requireRole(["superadmin", "superworker"]);
  const { chatId } = await params;
  const id = Number(chatId);
  const scope = officeScopeId(admin);

  const chat = await db.supportChat.findUnique({
    where: { id },
    include: { user: { select: { fullName: true, email: true, officeId: true } } },
  });
  if (!chat || (scope > 0 && chat.officeId !== scope)) redirect("/admin/chats");

  const messages = await db.supportChatMessage.findMany({
    where: { chatId: id },
    orderBy: { id: "asc" },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
            Chat con {chat.user.fullName}
          </h1>
          <p className="text-sm text-[var(--ge-text-secondary)]">
            {chat.user.email} · {chat.status}
          </p>
        </div>
        {chat.status !== "closed" && (
          <form action={adminCloseChat}>
            <input type="hidden" name="chatId" value={chat.id} />
            <button
              type="submit"
              className="rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] px-3 py-1.5 text-xs text-[var(--ge-text-secondary)]"
            >
              Cerrar chat
            </button>
          </form>
        )}
      </div>

      <div className="ge-card flex max-h-[28rem] flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={m.senderRole !== "user" ? "text-right" : ""}>
            <p className="text-xs text-[var(--ge-text-muted)]">
              {SENDER_LABEL[m.senderRole] ?? m.senderRole}
            </p>
            <p
              className={`mt-1 inline-block rounded-[var(--ge-radius-sm)] px-3 py-2 text-sm ${
                m.senderRole === "system"
                  ? "bg-transparent text-[var(--ge-text-muted)] italic"
                  : m.senderRole !== "user"
                    ? "bg-[var(--ge-violet)] text-white"
                    : "bg-[var(--ge-bg-elevated)] text-[var(--ge-text-primary)]"
              }`}
            >
              {m.message}
            </p>
          </div>
        ))}
      </div>

      {chat.status !== "closed" && (
        <form action={adminReplyChat} className="flex gap-2">
          <input type="hidden" name="chatId" value={chat.id} />
          <input
            name="message"
            required
            placeholder="Responder…"
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
