import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, type SessionRole } from "@/lib/auth/session";

/**
 * Data Access Layer — patrón recomendado por Next.js para centralizar la
 * verificación de sesión/autorización (ver guía "Authentication" de Next.js:
 * sección "Creating a Data Access Layer"). Todo Server Component, Server
 * Action o Route Handler que necesite saber "quién es el usuario" debe pasar
 * por aquí, nunca leer la cookie directamente.
 */

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.userId || session.mfaPending) {
    return null;
  }
  return session;
});

/** DTO seguro: sólo los campos que la UI necesita, nunca password/MFA secret. */
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId, isActive: true },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      officeId: true,
      country: true,
      avatar: true,
      kycStatus: true,
      mfaEnabled: true,
      allowBuy: true,
      allowSell: true,
      allowSend: true,
      allowSwap: true,
      allowStaking: true,
      dashboardNote: true,
      forcePasswordChange: true,
    },
  });

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/app/login");
  }
  return user;
}

export async function requireRole(roles: SessionRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/app/dashboard");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole(["superadmin", "superworker"]);
}
