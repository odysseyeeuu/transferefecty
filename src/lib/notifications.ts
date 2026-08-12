import "server-only";
import { db } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

// Puerto de `WalletHelper::notify()` — crea una notificación interna para un usuario.
export async function notifyUser(
  userId: number,
  title: string,
  body: string,
  type: NotificationType = "info"
) {
  await db.notification.create({ data: { userId, title, body, type } });
}
