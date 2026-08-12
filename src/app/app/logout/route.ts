import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

// GET /app/logout — misma convención que la v1 (enlace simple en el sidebar).
export async function GET(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/app/login", request.url));
}
