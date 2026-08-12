import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Sesión stateless firmada (JWT/JWS), siguiendo el patrón recomendado por
 * Next.js para App Router (ver "Session Management" en la guía de
 * autenticación de Next.js). Sustituye a las sesiones PHP nativas de la v1.
 *
 * El payload es intencionalmente mínimo: nunca metas aquí datos sensibles
 * (contraseña, documentos KYC, etc.) — sólo lo necesario para identificar
 * y autorizar al usuario en cada request.
 */

const COOKIE_NAME = "ge_session";
const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS ?? 12);

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET no está definido o es demasiado corto (mínimo 32 caracteres). " +
        "Generar uno con: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionRole = "user" | "superworker" | "superadmin";

export interface SessionPayload {
  userId: number;
  role: SessionRole;
  /** true mientras el usuario pasó la contraseña pero falta el TOTP (MFA). */
  mfaPending?: boolean;
  [key: string]: unknown;
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_HOURS}h`)
    .sign(getSecretKey());
}

export async function decryptSession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const session = await encryptSession(payload);
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return decryptSession(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
