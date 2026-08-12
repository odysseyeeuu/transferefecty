"use client";

import { useActionState } from "react";
import { submitKycDocuments } from "@/app/actions/kyc";
import { KYC_DOCUMENT_TYPES, KYC_TYPE_META } from "@/lib/kyc";

export function KycUploadForm() {
  const [state, formAction, pending] = useActionState(submitKycDocuments, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
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

      {state?.message && <p className="text-sm text-[var(--ge-error)]">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-[var(--ge-radius)] px-6 py-2.5 font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Enviando…" : "Enviar documentos"}
      </button>
    </form>
  );
}
