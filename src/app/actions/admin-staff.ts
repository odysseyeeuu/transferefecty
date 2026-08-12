"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { hashPassword } from "@/lib/auth/password";
import { logAdminAction } from "@/lib/admin-log";

// Puerto de `AdminController::createAdmin()/createWorker()`.

export type CreateStaffState = { message?: string } | undefined;

export async function createSuperAdmin(
  _prevState: CreateStaffState,
  formData: FormData
): Promise<CreateStaffState> {
  const admin = await requireRole(["superadmin"]);
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const forceChange = formData.get("forcePasswordChange") === "on";

  if (fullName.length < 3) return { message: "El nombre debe tener al menos 3 caracteres." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { message: "Email inválido." };
  if (password.length < 8) return { message: "La contraseña debe tener al menos 8 caracteres." };
  if (password !== confirm) return { message: "Las contraseñas no coinciden." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { message: "Ya existe una cuenta con ese email." };

  const created = await db.user.create({
    data: {
      fullName,
      email,
      passwordHash: await hashPassword(password),
      role: "superadmin",
      emailVerified: true,
      isActive: true,
      kycStatus: "approved",
      forcePasswordChange: forceChange,
    },
  });
  await logAdminAction(admin.id, "create_admin", "user", created.id);

  revalidatePath("/admin/admins");
  redirect("/admin/admins?created=1");
}

export type CreateWorkerState = { message?: string } | undefined;

export async function createSuperWorker(
  _prevState: CreateWorkerState,
  formData: FormData
): Promise<CreateWorkerState> {
  const admin = await requireRole(["superadmin"]);
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const officeId = Number(formData.get("officeId"));

  if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) return { message: "Datos inválidos." };
  if (password.length < 8) return { message: "La contraseña debe tener al menos 8 caracteres." };
  if (!officeId) return { message: "Selecciona una oficina." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { message: "Ya existe una cuenta con ese email." };

  const created = await db.user.create({
    data: {
      fullName,
      email,
      passwordHash: await hashPassword(password),
      role: "superworker",
      officeId,
      isActive: true,
      emailVerified: true,
      kycStatus: "approved",
    },
  });
  await logAdminAction(admin.id, "create_superworker", "user", created.id);

  revalidatePath("/admin/workers");
  redirect("/admin/workers?created=1");
}
