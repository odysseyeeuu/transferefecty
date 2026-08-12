import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Proxy (reemplaza a `middleware.ts`, deprecado en Next.js 16 — ver
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 *
 * Esto es un chequeo OPTIMISTA (solo lee la cookie firmada, sin ir a la base
 * de datos) para redirigir rápido a login/dashboard y evitar parpadeos de UI.
 * NUNCA es la única barrera de seguridad: cada Server Action, Route Handler
 * y Server Component vuelve a verificar con la DAL (`src/lib/auth/dal.ts`)
 * antes de leer o escribir datos. Ver docs/ARQUITECTURA.md.
 */

const PUBLIC_APP_ROUTES = [
  "/app/login",
  "/app/register",
  "/app/forgot-password",
  "/app/update-password",
  "/app/verify-mfa",
];

// De estas, cuáles NO deben rebotar a /app/dashboard si el visitante ya
// tiene sesión (ej. un link de reset de contraseña llegado por correo debe
// funcionar aunque el usuario esté logueado en otra pestaña/dispositivo).
const ALWAYS_ACCESSIBLE_ROUTES = ["/app/forgot-password", "/app/update-password"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decryptSession(token);
  const isAuthenticated = Boolean(session?.userId && !session.mfaPending);

  const isAdminArea = pathname.startsWith("/admin");
  const isClientArea = pathname.startsWith("/app");
  const isPublicAppRoute = PUBLIC_APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAdminArea) {
    const hasAdminRole =
      isAuthenticated &&
      (session?.role === "superadmin" || session?.role === "superworker");
    if (!hasAdminRole) {
      return NextResponse.redirect(new URL("/app/login", request.url));
    }
  }

  if (isClientArea && !isPublicAppRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/app/login", request.url));
  }

  const isAlwaysAccessible = ALWAYS_ACCESSIBLE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (isClientArea && isPublicAppRoute && isAuthenticated && !isAlwaysAccessible) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
