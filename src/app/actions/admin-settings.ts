"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/admin-log";

const SETTABLE_KEYS = [
  "site_name",
  "support_email",
  "swap_fee_percent",
  "announcement",
  "maintenance_mode",
  "min_deposit_usd",
  "min_withdrawal_usd",
] as const;

// Puerto de `AdminController::general()`.
export async function updateGeneralSettings(formData: FormData) {
  const admin = await requireRole(["superadmin"]);

  await db.$transaction(
    SETTABLE_KEYS.filter((key) => formData.has(key)).map((key) =>
      db.platformSetting.upsert({
        where: { key },
        update: { value: String(formData.get(key) ?? "").trim() },
        create: { key, value: String(formData.get(key) ?? "").trim() },
      })
    )
  );
  await logAdminAction(admin.id, "update_settings", "platform", null);

  revalidatePath("/admin/general");
  redirect("/admin/general?saved=1");
}
