import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// Puerto de `AdminController::logAction()` — auditoría de acciones de staff.
export async function logAdminAction(
  adminId: number,
  action: string,
  targetType?: string | null,
  targetId?: number | null,
  details?: Prisma.InputJsonValue
) {
  const hdrs = await headers();
  const ipAddress =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? null;

  await db.adminLog.create({
    data: {
      adminId,
      action,
      targetType: targetType ?? null,
      targetId: targetId ?? null,
      details: details ?? undefined,
      ipAddress,
    },
  });
}
