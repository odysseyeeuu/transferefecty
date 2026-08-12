"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getSession } from "@/lib/auth/session";
import { findActiveOfficeByCode } from "@/lib/office-code";
import { CRYPTO_CURRENCIES } from "@/lib/config/currencies";
import { sendMail } from "@/lib/mail";
import {
  LoginSchema,
  RegisterSchema,
  type LoginState,
  type RegisterState,
} from "@/lib/validations/auth";

/**
 * Puerto de `src/Core/Auth.php` (métodos `attempt`, `register`) a Server
 * Actions. Diferencias deliberadas frente a la v1:
 *  - No se guarda `password_plain` (la v1 sí lo hacía).
 *  - No existe el "auto-repair" de cuentas demo con contraseñas hardcodeadas
 *    que tenía `Auth::repairOrCreateDemoUser` — ese comportamiento era un
 *    parche de migración de la v1, no algo a replicar en un sistema nuevo.
 */

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const user = await db.user.findUnique({
    where: { email, isActive: true },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { message: "Correo o contraseña incorrectos." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  if (user.mfaEnabled) {
    await createSession({ userId: user.id, role: user.role, mfaPending: true });
    redirect("/app/verify-mfa");
  }

  await createSession({ userId: user.id, role: user.role });
  redirect(user.role === "user" ? "/app/dashboard" : "/admin/dashboard");
}

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const validated = RegisterSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    country: formData.get("country") || undefined,
    phone: formData.get("phone") || undefined,
    officeCode: formData.get("officeCode"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { fullName, email, password, country, phone, officeCode } = validated.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ["Ya existe una cuenta con este correo."] } };
  }

  const office = await findActiveOfficeByCode(officeCode);
  if (!office) {
    return {
      errors: { officeCode: ["Código de oficina inválido o vencido."] },
    };
  }

  const passwordHash = await hashPassword(password);

  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        country: country || null,
        phone: phone || null,
        officeId: office.id,
        role: "user",
      },
    });

    await tx.wallet.createMany({
      data: CRYPTO_CURRENCIES.map((currency) => ({
        userId: created.id,
        currency: currency.code,
        balance: 0,
        address: `${currency.code.toLowerCase()}_${randomBytes(12).toString("hex")}`,
      })),
    });

    return created;
  });

  await createSession({ userId: user.id, role: user.role });
  redirect("/app/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/app/login");
}

export async function verifyMfaCode(
  _prevState: { message?: string } | undefined,
  formData: FormData
) {
  const session = await getSession();
  if (!session?.userId || !session.mfaPending) {
    redirect("/app/login");
  }

  const token = String(formData.get("token") ?? "").trim();
  const user = await db.user.findUnique({ where: { id: session.userId } });

  if (!user?.mfaEnabled || !user.mfaSecretEncrypted) {
    redirect("/app/login");
  }

  const { verifyMfaToken } = await import("@/lib/auth/mfa");
  const isValid = verifyMfaToken(user.mfaSecretEncrypted, token);

  if (!isValid) {
    return { message: "Código incorrecto. Intenta de nuevo." };
  }

  await createSession({ userId: user.id, role: user.role });
  redirect(user.role === "user" ? "/app/dashboard" : "/admin/dashboard");
}

/**
 * Puerto de `AppController::forgotPassword()/updatePasswordPost()` (flujo de
 * `password_resets`). El envío de correo pasa por `lib/mail.ts` — hoy hace
 * `console.log` hasta que se conecte un proveedor real (ver ese archivo).
 */

export type ForgotPasswordState = { message?: string; sent?: boolean } | undefined;

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { message: "Ingresa tu correo." };

  const user = await db.user.findUnique({ where: { email, isActive: true } });

  // Siempre respondemos igual exista o no la cuenta — evita filtrar qué
  // correos están registrados (mismo comportamiento que la v1).
  if (user) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await db.passwordReset.create({ data: { email, token, expiresAt } });

    const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/app/update-password?token=${token}`;
    await sendMail({
      to: email,
      subject: "Recupera tu contraseña — Transfer Efecty",
      html: `<p>Solicitaste recuperar tu contraseña. Este enlace vence en 1 hora:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si no fuiste tú, ignora este correo.</p>`,
    });
  }

  return { sent: true };
}

export type ResetPasswordState = { message?: string } | undefined;

export async function resetPasswordWithToken(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8 || password !== confirm) {
    return { message: "La contraseña debe tener al menos 8 caracteres y coincidir con la confirmación." };
  }

  const reset = await db.passwordReset.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
  });
  if (!reset) {
    return { message: "El enlace es inválido o ya venció. Solicita uno nuevo." };
  }

  const user = await db.user.findUnique({ where: { email: reset.email } });
  if (user) {
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password), forcePasswordChange: false },
    });
  }
  await db.passwordReset.deleteMany({ where: { token } });

  redirect("/app/login?reset=1");
}
