"use client";

import { useActionState, useState } from "react";
import { submitKycDocuments } from "@/app/actions/kyc";
import { KYC_DOCUMENT_TYPES, KYC_TYPE_META } from "@/lib/kyc";
import { compressImage, formatBytes } from "@/lib/image-compress";

/**
 * Antes de enviar, las imágenes se comprimen en el navegador: Vercel limita
 * el cuerpo de cada petición a ~4.5MB y aquí van 4 documentos juntos, así
 * que sin comprimir el envío falla con fotos tomadas del móvil.
 * Ver src/lib/image-compress.ts.
 */
const MAX_TOTAL_BYTES = 3.5 * 1024 * 1024; // margen bajo el techo de Vercel

export function KycUploadForm() {
  const [state, formAction, pending] = useActionState(submitKycDocuments, undefined);
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    setPreparing(true);

    try {
      const form = event.currentTarget;
      const payload = new FormData();
      let total = 0;

      for (const type of KYC_DOCUMENT_TYPES) {
        const input = form.elements.namedItem(type) as HTMLInputElement | null;
        const file = input?.files?.[0];
        if (!file) {
          setLocalError("Debes adjuntar los 4 documentos requeridos.");
          return;
        }
        const prepared = await compressImage(file);
        total += prepared.size;
        payload.append(type, prepared);
      }

      if (total > MAX_TOTAL_BYTES) {
        setLocalError(
          `Los archivos suman ${formatBytes(total)} y el máximo permitido es ${formatBytes(
            MAX_TOTAL_BYTES
          )}. Si alguno es un PDF pesado, súbelo como foto o reduce su tamaño.`
        );
        return;
      }

      formAction(payload);
    } finally {
      setPreparing(false);
    }
  }

  const busy = pending || preparing;
  const message = localError ?? state?.message;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {KYC_DOCUMENT_TYPES.map((type) => {
          const meta = KYC_TYPE_META[type];
          return (
            <div key={type} className="ge-card flex flex-col gap-2 p-4">
              <label htmlFor={type} className="text-sm font-medium text-[var(--ge-text-primary)]">
                {meta.label}
              </label>
              <p className="text-xs text-[var(--ge-text-muted)]">{meta.hint}</p>
              <input
                id={type}
                name={type}
                type="file"
                accept={meta.accept}
                capture={meta.capture}
                required
                className="text-sm text-[var(--ge-text-secondary)] file:mr-3 file:rounded-[var(--ge-radius-sm)] file:border-0 file:bg-[var(--ge-bg-elevated)] file:px-3 file:py-1.5 file:text-[var(--ge-text-primary)]"
              />
            </div>
          );
        })}
      </div>

      {message && <p className="text-sm text-[var(--ge-error)]">{message}</p>}

      <button
        type="submit"
        disabled={busy}
        className="self-start rounded-[var(--ge-radius)] px-6 py-2.5 font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {preparing ? "Preparando imágenes…" : pending ? "Enviando…" : "Enviar documentos"}
      </button>

      <p className="text-xs text-[var(--ge-text-muted)]">
        Las fotos se optimizan automáticamente antes de enviarse, sin perder legibilidad.
      </p>
    </form>
  );
}
