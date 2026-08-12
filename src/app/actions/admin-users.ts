"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { hashPassword } from "@/lib/auth/password";
import { logAdminAction } from "@/lib/admin-log";
import { canAccessOffice } from "@/lib/office-scope";

// Puerto de `AdminController::updateUser()/resetUserPassword()/deleteUser()`.

function staffCanView(
  staff: { role: string; officeId: number | null },
  target: { role: string; officeId: number | null }
): boolean {
  if (staff.role === "superadmin") return true;
  if (staff.role === "superworker") {
    if (target.role !== "user") return false;
    return canAccessOffice(staff, target.officeId);
  }
  return false;
}

export async function updateUserPermissions(formData: FormData) {
  const admin = await requireRole(["superadmin", "superworker"]);
  const userId = Number(formData.get("userId"));

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target || !staffCanView(admin, target)) redirect("/admin/users?error=forbidden");

  const data: Parameters<typeof db.user.update>[0]["data"] = {
    fullName: String(formData.get("fullName") ?? target.fullName).trim() || target.fullName,
    allowBuy: formData.get("allowBuy") === "on",
    allowSell: formData.get("allowSell") === "on",
    allowSend: formData.get("allowSend") === "on",
    allowSwap: formData.get("allowSwap") === "on",
    allowStaking: formData.get("allowStaking") === "on",
    dashboardNote: (formData.get("dashboardNote") as string) || null,
    isActive: formData.get("isActive") === "on",
  };

  if (admin.role === "superadmin") {
    const role = String(formData.get("role") ?? "");
    const officeId = Number(formData.get("officeId"));
    if (["user", "superworker", "superadmin"].includes(role)) {
      data.role = role as "user" | "superworker" | "superadmin";
    }
    if (officeId > 0) data.officeId = officeId;
  }

  await db.user.update({ where: { id: userId }, data });
  await logAdminAction(admin.id, "update_user", "user", userId);

  revalidatePath(`/admin/user/${userId}`);
  redirect(`/admin/user/${userId}?saved=1`);
}

export type ResetPasswordState = { message?: string } | undefined;

export async function resetUserPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const admin = await requireRole(["superadmin", "superworker"]);
  const userId = Number(formData.get("userId"));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const forceChange = formData.get("forcePasswordChange") === "on";

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target || !staffCanView(admin, target)) redirect("/admin/users?error=forbidden");
  if (admin.role === "superworker" && target.role !== "user") {
    redirect("/admin/users?error=forbidden");
  }
  if (password.length < 8 || password !== confirm) {
    return { message: "La contraseña debe tener al menos 8 caracteres y coincidir." };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
      forcePasswordChange: forceChange,
    },
  });
  await logAdminAction(admin.id, "reset_password", "user", userId);

  revalidatePath(`/admin/user/${userId}`);
  redirect(`/admin/user/${userId}?password=1`);
}

export async function deleteUser(formData: FormData) {
  const admin = await requireRole(["superadmin"]);
  const userId = Number(formData.get("userId"));
  if (!userId || userId === admin.id) redirect(`/admin/user/${userId}?error=forbidden`);

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target || !["user", "superworker"].includes(target.role)) {
    redirect(`/admin/user/${userId}?error=cannot_delete`);
  }

  await db.user.delete({ where: { id: userId } });
  await logAdminAction(admin.id, "delete_user", "user", userId);

  redirect("/admin/users?deleted=1");
}
