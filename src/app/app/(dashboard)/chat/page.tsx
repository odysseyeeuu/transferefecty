import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { openOrCreateChatForUser } from "@/lib/support-chat";
import { sendChatMessage, closeChatClient } from "@/app/actions/chat";
import { ChatAutoRefresh } from "@/components/chat-auto-refresh";

export const metadata: Metadata = { title: "Chat en vivo" };

const SENDER_LABEL: Record<string, string> = {
  user: "Tú",
  superworker: "Soporte",
  superadmin: "Soporte",
  system: "Sistema",
};

export default async function ChatPage() {
  const user = await requireUser();

  if (!user.officeId) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-warning)]">
        Tu cuenta no tiene oficina asignada — no se puede abrir un chat en vivo.
      </p>
    );
  }

  const { chat } = await openOrCreateChatForUser(user.id, user.officeId);
  const messages = await db.supportChatMessage.findMany({
    where: { chatId: chat.id },
    orderBy: { id: "asc" },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {chat.status !== "closed" && <ChatAutoRefresh />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Chat en vivo</h1>
          <p className="text-sm text-[var(--ge-text-secondary)]">Estado: {chat.status}</p>
        </div>
        {chat.status !== "closed" && (
          <form action={closeChatClient}>
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
          <div key={m.id} className={m.senderId === user.id ? "text-right" : ""}>
            <p className="text-xs text-[var(--ge-text-muted)]">
              {SENDER_LABEL[m.senderRole] ?? m.senderRole}
            </p>
            <p
              className={`mt-1 inline-block rounded-[var(--ge-radius-sm)] px-3 py-2 text-sm ${
                m.senderRole === "system"
                  ? "bg-transparent text-[var(--ge-text-muted)] italic"
                  : m.senderId === user.id
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
        <form action={sendChatMessage} className="flex gap-2">
          <input type="hidden" name="chatId" value={chat.id} />
          <input
            name="message"
            required
            placeholder="Escribe un mensaje…"
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
