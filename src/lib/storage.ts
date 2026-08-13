import "server-only";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { put, get } from "@vercel/blob";

/**
 * Storage de archivos — puerto de `UploadService.php`, con dos backends:
 *
 *  - **Vercel Blob** (producción): se activa solo si existe
 *    `BLOB_READ_WRITE_TOKEN`. Los blobs se suben con `access: "private"`,
 *    así que NO son accesibles por URL pública — sólo a través de nuestra
 *    ruta `/storage/[...path]`, que verifica permisos antes de servirlos.
 *    Esto importa: los documentos KYC son identificaciones reales.
 *
 *  - **Disco local** (desarrollo): `v2/storage/uploads/`. En Vercel el
 *    filesystem es efímero y de solo lectura fuera de /tmp, por eso no
 *    puede usarse en producción.
 *
 * En ambos casos lo que se guarda en la base de datos es la MISMA ruta
 * relativa (ej. `kyc/ab12….jpg`), así que cambiar de backend no requiere
 * migrar datos ni tocar el esquema.
 */

const MAX_SIZE = 10 * 1024 * 1024; // 10MB, igual que la v1
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "pdf"];
const STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads");

export const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
};

function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Evita path traversal (mismo saneo que `storage.php`: sin ".." ni "\"). */
function sanitizeRelativePath(relativePath: string): string {
  return relativePath.replace(/\.\.|\\/g, "");
}

export interface StoredFile {
  /** Ruta relativa guardada en BD, ej: "kyc/ab12….jpg" */
  path: string;
}

export async function saveUploadedFile(
  file: File,
  subdir: string
): Promise<StoredFile | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_SIZE) return null;

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return null;

  const name = `${randomBytes(16).toString("hex")}.${ext}`;
  const relativePath = `${subdir}/${name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isBlobConfigured()) {
    await put(relativePath, buffer, {
      access: "private",
      addRandomSuffix: false,
      contentType: MIME_BY_EXTENSION[ext] ?? "application/octet-stream",
    });
    return { path: relativePath };
  }

  const dir = path.join(STORAGE_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return { path: relativePath };
}

export interface StoredFileContent {
  body: Buffer;
  contentType: string;
  size: number;
  filename: string;
}

/**
 * Lee un archivo previamente guardado. Devuelve `null` si no existe.
 * NO hace ninguna verificación de permisos — eso es responsabilidad de
 * quien la llama (ver `src/app/storage/[...path]/route.ts`).
 */
export async function readStoredFile(
  relativePath: string
): Promise<StoredFileContent | null> {
  const safePath = sanitizeRelativePath(relativePath);
  const ext = safePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_BY_EXTENSION[ext] ?? "application/octet-stream";
  const filename = safePath.split("/").pop() ?? "archivo";

  if (isBlobConfigured()) {
    try {
      const result = await get(safePath, { access: "private" });
      if (!result) return null;
      const arrayBuffer = await new Response(result.stream).arrayBuffer();
      const body = Buffer.from(arrayBuffer);
      return { body, contentType, size: body.byteLength, filename };
    } catch {
      return null;
    }
  }

  try {
    const fullPath = path.join(STORAGE_ROOT, safePath);
    const stats = await stat(fullPath);
    if (!stats.isFile()) return null;
    const body = await readFile(fullPath);
    return { body, contentType, size: stats.size, filename };
  } catch {
    return null;
  }
}
