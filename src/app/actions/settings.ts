"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { verifyMfaToken } from "@/lib/auth/mfa";

// Puerto de `AppController::settingsUpdatePassword()/settingsMfaEnable()/settingsMfaDisable()`.

export type SettingsState = { message?: string } | undefined;

export async function updatePassword(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const user = await requireUser();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const row = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!row || !(await verifyPassword(current, row.passwordHash))) {
    return { message: "La contraseña actual no es correcta." };
  }
  if (next.length < 8 || next !== confirm) {
    return { message: "La nueva contraseña debe tener al menos 8 caracteres y coincidir con la confirmación." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next), forcePasswordChange: false },
  });

  revalidatePath("/app/settings");
  redirect("/app/settings?password=1");
}

export async function enableMfa(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const user = await requireUser();
  const encryptedSecret = String(formData.get("encryptedSecret") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  if (!encryptedSecret || !verifyMfaToken(encryptedSecret, code)) {
    return { message: "Código incorrecto. Escanea el QR de nuevo e inténtalo otra vez." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { mfaEnabled: true, mfaSecretEncrypted: encryptedSecret },
  });

  revalidatePath("/app/settings");
  redirect("/app/settings?mfa=1");
}

export async function disableMfa() {
  const user = await requireUser();
  await db.user.update({
    where: { id: user.id },
    data: { mfaEnabled: false, mfaSecretEncrypted: null },
  });
  revalidatePath("/app/settings");
  redirect("/app/settings?mfa_off=1");
}

/** Puerto de `AppController::forcePassword()` — gate obligatorio de cambio de contraseña. */
export async function forcePasswordChange(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const user = await requireUser();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8 || password !== confirm) {
    return { message: "La contraseña debe tener al menos 8 caracteres y coincidir con la confirmación." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password), forcePasswordChange: false },
  });

  redirect("/app/dashboard");
}
