"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.sent) {
    return (
      <p className="text-sm text-[var(--ge-success)]">
        Si el correo existe en Transfer Efecty, te enviamos un enlace para recuperar tu
        contraseña. Revisa tu bandeja de entrada (y spam).
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        name="email"
        type="email"
        required
        placeholder="tu@correo.com"
        autoComplete="email"
        className="rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]"
      />
      {state?.message && <p className="text-sm text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius)] px-4 py-2.5 font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>
    </form>
  );
}
