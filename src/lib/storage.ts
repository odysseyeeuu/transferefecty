import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

/**
 * Storage de archivos — puerto de `UploadService.php`.
 *
 * ⚠️ Esta implementación escribe a disco local (`v2/storage/uploads/`), lo
 * cual funciona perfecto en desarrollo pero **no sirve en Vercel**
 * (filesystem de solo lectura salvo `/tmp`, y no persiste entre invocaciones).
 * Antes de desplegar a producción, reemplazar el cuerpo de `saveUploadedFile`
 * por una subida a Vercel Blob o Cloudflare R2 — la firma de la función
 * (recibe un `File`, devuelve `{ path, url }`) está pensada para que ese
 * cambio no toque a quien la llama. Ver docs/ARQUITECTURA.md.
 */

const MAX_SIZE = 10 * 1024 * 1024; // 10MB, igual que la v1
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "pdf"];
const STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads");

export interface StoredFile {
  /** Ruta relativa guardada en BD, ej: "kyc/ab12....jpg" */
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

  const dir = path.join(STORAGE_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const name = `${randomBytes(16).toString("hex")}.${ext}`;
  const fullPath = path.join(dir, name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  return { path: `${subdir}/${name}` };
}

export function resolveStoredFilePath(relativePath: string): string {
  // Evita path traversal (mismo saneo que storage.php: sin ".." ni "\").
  const safe = relativePath.replace(/\.\.|\\/g, "");
  return path.join(STORAGE_ROOT, safe);
}

export const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
};
