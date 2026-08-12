"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";

export async function markNotificationRead(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  await db.notification.updateMany({ where: { id, userId: user.id }, data: { isRead: true } });
  revalidatePath("/app/notifications");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await db.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  revalidatePath("/app/notifications");
}
