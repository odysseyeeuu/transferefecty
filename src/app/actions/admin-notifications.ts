"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { officeScopeId, canAccessOffice } from "@/lib/office-scope";
import { logAdminAction } from "@/lib/admin-log";
import { kycFilterWhere, type KycFilterValue } from "@/lib/kyc-filter";
import type { NotificationType } from "@prisma/client";

// Puerto de `AdminController::sendNotification()`.

export type SendNotificationState = { message?: string; sent?: number } | undefined;

export async function sendBulkNotification(
  _prevState: SendNotificationState,
  formData: FormData
): Promise<SendNotificationState> {
  const admin = await requireRole(["superadmin", "superworker"]);

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const type = String(formData.get("type") ?? "info") as NotificationType;
  const scope = String(formData.get("scope") ?? "one");
  const userRef = String(formData.get("userRef") ?? "").trim();
  const kycFilter = (formData.get("kycFilter") as KycFilterValue) ?? "";

  if (!title || !body) return { message: "Completa el título y el mensaje." };

  const scopeId = officeScopeId(admin);
  let targetIds: number[] = [];

  if (scope === "office" || scope === "all") {
    const isAll = admin.role === "superadmin" && scope === "all";
    if (!isAll && scopeId <= 0) {
      return { message: "No tienes una oficina asignada." };
    }
    const users = await db.user.findMany({
      where: {
        role: "user",
        isActive: true,
        ...(isAll ? {} : { officeId: scopeId }),
        ...kycFilterWhere(kycFilter),
      },
      select: { id: true },
      take: 500,
    });
    targetIds = users.map((u) => u.id);
  } else {
    let userId = /^\d+$/.test(userRef) ? Number(userRef) : 0;
    if (!userId && userRef) {
      const found = await db.user.findUnique({ where: { email: userRef.toLowerCase() } });
      userId = found?.id ?? 0;
    }
    if (!userId) return { message: "Usuario no encontrado (busca por ID o email)." };

    const target = await db.user.findUnique({ where: { id: userId } });
    if (!target || target.role !== "user" || !canAccessOffice(admin, target.officeId)) {
      return { message: "No tienes permiso para notificar a ese usuario." };
    }
    targetIds = [userId];
  }

  if (targetIds.length === 0) return { message: "No hay destinatarios para ese filtro." };

  await db.notification.createMany({
    data: targetIds.map((userId) => ({ userId, title, body, type })),
  });

  await logAdminAction(admin.id, "send_notification", "notification", targetIds[0]);

  revalidatePath("/admin/notifications");
  redirect(`/admin/notifications?sent=${targetIds.length}`);
}
