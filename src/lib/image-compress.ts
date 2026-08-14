/**
 * Compresión de imágenes en el navegador, antes de subirlas.
 *
 * Por qué existe: las Server Actions de Next.js van dentro de una petición
 * normal, y Vercel limita el cuerpo de una función serverless a ~4.5MB
 * (límite de plataforma, no configurable). El formulario de KYC manda 4
 * documentos a la vez, y una foto de cédula tomada con el móvil pesa entre
 * 2 y 8MB — sin comprimir, el envío falla casi siempre.
 *
 * Reescalar el lado más largo a 1600px y guardar como JPEG deja los
 * documentos perfectamente legibles para revisión (los datos de una cédula
 * se leen de sobra) y baja el peso a unos cientos de KB.
 *
 * Los PDF y cualquier formato no-imagen pasan sin tocar.
 */

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

/** Solo comprimimos rasterizables; los PDF se dejan intactos. */
function isCompressibleImage(file: File): boolean {
  return /^image\/(jpeg|png|webp)$/.test(file.type);
}

export async function compressImage(file: File): Promise<File> {
  if (!isCompressibleImage(file)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));

    // Si ya es pequeña y liviana, no vale la pena recodificar.
    if (scale === 1 && file.size <= 800 * 1024) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file; // no empeorar

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    // Si el navegador no soporta createImageBitmap/canvas, se sube el original.
    return file;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
