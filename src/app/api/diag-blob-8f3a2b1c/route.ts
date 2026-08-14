import { NextResponse } from "next/server";
import { saveUploadedFile, readStoredFile } from "@/lib/storage";
import { del } from "@vercel/blob";

export const dynamic = "force-dynamic";

/**
 * TEMPORAL — verifica que Vercel Blob esté conectado y que el round-trip
 * completo (subir → leer → borrar) funcione en producción. Se elimina en
 * cuanto se confirme.
 */
export async function GET() {
  const out: Record<string, unknown> = {
    blobTokenPresente: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    backend: process.env.BLOB_READ_WRITE_TOKEN ? "vercel-blob" : "disco-local",
  };

  try {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    const file = new File([new Uint8Array(png)], "diag.png", { type: "image/png" });

    const saved = await saveUploadedFile(file, "kyc");
    out.subida = saved;
    if (!saved) throw new Error("saveUploadedFile devolvio null");

    const back = await readStoredFile(saved.path);
    out.lectura = back && { contentType: back.contentType, size: back.size };
    if (!back) throw new Error("readStoredFile devolvio null");
    out.bytesCoinciden = Buffer.compare(back.body, png) === 0;

    // Limpieza: no dejar el archivo de prueba en el store.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await del(saved.path);
      out.borrado = true;
      out.tras_borrado = (await readStoredFile(saved.path)) === null ? "no accesible (correcto)" : "SIGUE ACCESIBLE";
    }

    out.ok = true;
  } catch (err) {
    out.ok = false;
    out.error = err instanceof Error ? err.message.slice(0, 400) : String(err).slice(0, 400);
  }

  return NextResponse.json(out);
}
