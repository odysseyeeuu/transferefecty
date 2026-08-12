import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { resolveStoredFilePath, MIME_BY_EXTENSION } from "@/lib/storage";

/**
 * GET /storage/uploads/... — puerto de `storage.php`. Sirve archivos de
 * `storage/uploads/` con el mismo control de acceso que la v1 para KYC:
 * sólo el dueño, un superadmin, o un superworker de la misma oficina.
 *
 * ⚠️ Igual que `lib/storage.ts`: esto sirve desde disco local, válido para
 * desarrollo. En producción (Vercel) los archivos deben venir de Blob/R2
 * con URLs firmadas, no de esta ruta.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const relativePath = segments.join("/");

  if (!relativePath.startsWith("uploads/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const withinUploads = relativePath.replace(/^uploads\//, "");

  if (withinUploads.startsWith("kyc/")) {
    const viewer = await getCurrentUser();
    if (!viewer) return new NextResponse("Forbidden", { status: 403 });

    const doc = await db.kycDocument.findFirst({
      where: { filePath: withinUploads },
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

  const fullPath = resolveStoredFilePath(withinUploads);
  try {
    const stats = await stat(fullPath);
    if (!stats.isFile()) throw new Error("not a file");
    const buffer = await readFile(fullPath);
    const ext = fullPath.split(".").pop()?.toLowerCase() ?? "";
    const mime = MIME_BY_EXTENSION[ext] ?? "application/octet-stream";

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(stats.size),
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `inline; filename="${fullPath.split("/").pop()}"`,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
