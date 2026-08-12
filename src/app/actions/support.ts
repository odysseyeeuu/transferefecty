"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth/dal";
import { notifyUser } from "@/lib/notifications";
import { canAccessOffice } from "@/lib/office-scope";

// Puerto de `AppController::supportCreate()/supportReply()` y
// `AdminController::ticketReply()`.

export type SupportState = { message?: string } | undefined;

export async function createTicket(
  _prevState: SupportState,
  formData: FormData
): Promise<SupportState> {
  const user = await requireUser();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!subject || !message) return { message: "Completa el asunto y el mensaje." };
  if (!user.officeId) return { message: "Tu cuenta no tiene oficina asignada." };

  const ticket = await db.$transaction(async (tx) => {
    const t = await tx.supportTicket.create({
      data: { userId: user.id, subject, status: "open" },
    });
    await tx.supportMessage.create({
      data: { ticketId: t.id, senderId: user.id, message },
    });
    return t;
  });

  await notifyUser(
    user.id,
    "Ticket enviado a soporte",
    `Tu solicitud #${ticket.id} fue recibida. El SuperWorker de tu oficina te responderá pronto.`,
    "success"
  );

  revalidatePath("/app/support");
  redirect("/app/support?created=1");
}

export async function replyTicket(formData: FormData) {
  const user = await requireUser();
  const ticketId = Number(formData.get("ticketId"));
  const message = String(formData.get("message") ?? "").trim();
  if (!ticketId || !message) return;

  const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.userId !== user.id) return;

  await db.supportMessage.create({ data: { ticketId, senderId: user.id, message } });
  await db.supportTicket.update({ where: { id: ticketId }, data: { updatedAt: new Date() } });

  revalidatePath(`/app/support/ticket/${ticketId}`);
}

export async function adminReplyTicket(formData: FormData) {
  const admin = await requireRole(["superadmin", "superworker"]);
  const ticketId = Number(formData.get("ticketId"));
  const message = String(formData.get("message") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "");
  const allowedStatus = ["open", "in_progress", "resolved", "closed"] as const;
  if (!ticketId || !message) return;

  const ticket = await db.supportTicket.findUnique({
    where: { id: ticketId },
    include: { user: { select: { officeId: true } } },
  });
  if (!ticket) return;
  if (!canAccessOffice(admin, ticket.user.officeId)) return;

  let status: (typeof allowedStatus)[number] | null = allowedStatus.includes(
    statusRaw as (typeof allowedStatus)[number]
  )
    ? (statusRaw as (typeof allowedStatus)[number])
    : null;

  if (!status) {
    status = ["open", "in_progress"].includes(ticket.status) ? "in_progress" : ticket.status;
  }

  await db.$transaction([
    db.supportMessage.create({ data: { ticketId, senderId: admin.id, message } }),
    db.supportTicket.update({
      where: { id: ticketId },
      data: { status, assignedTo: admin.id, updatedAt: new Date() },
    }),
  ]);

  await notifyUser(
    ticket.userId,
    `Respuesta en tu ticket #${ticketId}`,
    `${admin.fullName} respondió tu solicitud de soporte.`,
    "info"
  );

  revalidatePath(`/admin/ticket/${ticketId}`);
}
