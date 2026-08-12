"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth/dal";
import { addChatMessage, claimChatIfNeeded, closeChat } from "@/lib/support-chat";
import { notifyUser } from "@/lib/notifications";
import { logAdminAction } from "@/lib/admin-log";
import { canAccessOffice } from "@/lib/office-scope";

// Puerto de `AppController::chatSend()/chatClose()` y
// `AdminController::chatReply()/chatClose()`. Sin polling en vivo por ahora
// (recarga tras enviar) — ver docs/PARIDAD.md.

export async function sendChatMessage(formData: FormData) {
  const user = await requireUser();
  const chatId = Number(formData.get("chatId"));
  const message = String(formData.get("message") ?? "").trim();
  if (!chatId || !message) return;

  const chat = await db.supportChat.findUnique({ where: { id: chatId } });
  if (!chat || chat.userId !== user.id || chat.status === "closed") return;

  await addChatMessage(chatId, user.id, "user", message);
  revalidatePath("/app/chat");
}

export async function closeChatClient(formData: FormData) {
  const user = await requireUser();
  const chatId = Number(formData.get("chatId"));
  const chat = await db.supportChat.findUnique({ where: { id: chatId } });
  if (!chat || chat.userId !== user.id) redirect("/app/chat?error=forbidden");

  await closeChat(chatId, user.id, user.fullName);
  revalidatePath("/app/chat");
  redirect("/app/chat?closed=1");
}

export async function adminReplyChat(formData: FormData) {
  const admin = await requireRole(["superadmin", "superworker"]);
  const chatId = Number(formData.get("chatId"));
  const message = String(formData.get("message") ?? "").trim();
  if (!chatId || !message) return;

  const chat = await db.supportChat.findUnique({ where: { id: chatId } });
  if (!chat || chat.status === "closed") return;
  if (!canAccessOffice(admin, chat.officeId)) return;

  await claimChatIfNeeded(chatId, admin.id, admin.fullName);
  await addChatMessage(chatId, admin.id, admin.role, message);
  await notifyUser(
    chat.userId,
    "Respuesta en chat en vivo",
    `${admin.fullName} te respondió en el chat. Entra a Chat en vivo para verlo.`,
    "info"
  );
  await logAdminAction(admin.id, "chat_reply", "chat", chatId);
  revalidatePath(`/admin/chat/${chatId}`);
}

export async function adminCloseChat(formData: FormData) {
  const admin = await requireRole(["superadmin", "superworker"]);
  const chatId = Number(formData.get("chatId"));
  const chat = await db.supportChat.findUnique({ where: { id: chatId } });
  if (!chat) redirect("/admin/chats?error=invalid");
  if (!canAccessOffice(admin, chat.officeId)) redirect("/admin/chats?error=forbidden");

  await closeChat(chatId, admin.id, admin.fullName);
  await logAdminAction(admin.id, "chat_close", "chat", chatId);
  revalidatePath(`/admin/chat/${chatId}`);
  redirect(`/admin/chat/${chatId}?closed=1`);
}
