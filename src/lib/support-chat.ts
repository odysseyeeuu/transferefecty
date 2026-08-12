import "server-only";
import { db } from "@/lib/db";
import type { ChatSenderRole } from "@prisma/client";

// Puerto simplificado de `SupportChatService.php` (sin adjuntos de imagen — ver docs/PARIDAD.md).

export async function openOrCreateChatForUser(userId: number, officeId: number) {
  const existing = await db.supportChat.findFirst({
    where: { userId, officeId, status: { in: ["open", "waiting"] } },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return { chat: existing, created: false };

  const chat = await db.supportChat.create({
    data: { userId, officeId, status: "open", lastMessageAt: new Date() },
  });
  await addChatMessage(chat.id, userId, "system", "Chat iniciado. Un asesor de tu oficina te atenderá en breve.");
  return { chat, created: true };
}

export async function addChatMessage(
  chatId: number,
  senderId: number,
  senderRole: ChatSenderRole,
  message: string
) {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 4000) return null;

  const created = await db.supportChatMessage.create({
    data: { chatId, senderId, senderRole, message: trimmed },
  });

  const statusBump = senderRole === "user" ? "open" : "waiting";
  await db.supportChat.update({
    where: { id: chatId },
    data: {
      lastMessageAt: new Date(),
      // No reabrir un chat cerrado con un mensaje de sistema/staff automático.
      status: (await db.supportChat.findUnique({ where: { id: chatId }, select: { status: true } }))
        ?.status === "closed"
        ? "closed"
        : statusBump,
    },
  });

  return created;
}

export async function claimChatIfNeeded(chatId: number, staffId: number, staffName: string) {
  const chat = await db.supportChat.findUnique({ where: { id: chatId } });
  if (!chat || chat.status === "closed" || chat.assignedTo) return;

  await db.supportChat.update({
    where: { id: chatId },
    data: { assignedTo: staffId, status: "waiting" },
  });
  await addChatMessage(chatId, staffId, "system", `${staffName} se unió al chat.`);
}

export async function closeChat(chatId: number, closedBy: number, closerName: string) {
  const chat = await db.supportChat.findUnique({ where: { id: chatId } });
  if (!chat || chat.status === "closed") return false;

  await db.supportChat.update({
    where: { id: chatId },
    data: { status: "closed", closedAt: new Date(), closedBy },
  });
  await addChatMessage(chatId, closedBy, "system", `Chat cerrado por ${closerName}.`);
  return true;
}
