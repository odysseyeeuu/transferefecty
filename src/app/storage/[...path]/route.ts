import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { readStoredFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * GET /storage/<subdir>/<archivo> — puerto de `storage.php`.
 *
 * Es la ÚNICA vía de acceso a los archivos subidos: en producción los blobs
 * son privados, así que aquí se decide quién puede verlos. Control de acceso
 * para KYC, igual que la v1: sólo el dueño del documento, un superadmin, o
 * un superworker de la misma oficina que el dueño.
 *
 * La ruta que llega es la misma que se guarda en BD (ej. `kyc/ab12….jpg`).
 */

const SERVABLE_PREFIXES = ["kyc/"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const relativePath = segments.join("/");

  // Lista blanca de subdirectorios servibles — evita que esta ruta se
  // convierta en un lector genérico de archivos si mañana se guardan
  // cosas nuevas bajo storage/.
  if (!SERVABLE_PREFIXES.some((prefix) => relativePath.startsWith(prefix))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (relativePath.startsWith("kyc/")) {
    const viewer = await getCurrentUser();
    if (!viewer) return new NextResponse("Forbidden", { status: 403 });

    const doc = await db.kycDocument.findFirst({
      where: { filePath: relativePath },
      select: { userId: true },
    });
    if (!doc) return new NextResponse("Not found", { status: 404 });

    const isOwner = doc.userId === viewer.id;
    const isSuperAdmin = viewer.role === "superadmin";
    let allowed = isOwner || isSuperAdmin;

    if (!allowed && viewer.role === "superworker") {
      const owner = await db.user.findUnique({
        where: { id: doc.userId },
        select: { officeId: true },
      });
      allowed = Boolean(
        viewer.officeId && owner?.officeId && viewer.officeId === owner.officeId
      );
    }

    if (!allowed) return new NextResponse("Forbidden", { status: 403 });
  }

  const file = await readStoredFile(relativePath);
  if (!file) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(file.body as unknown as BodyInit, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.size),
      "X-Content-Type-Options": "nosniff",
      // Documentos sensibles: nunca cachear en CDN ni en el navegador.
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${file.filename}"`,
    },
  });
}
