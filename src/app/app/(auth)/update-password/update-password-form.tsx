"use client";

import { useActionState } from "react";
import { resetPasswordWithToken } from "@/app/actions/auth";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]";

export function UpdatePasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordWithToken, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <input
        name="password"
        type="password"
        placeholder="Nueva contraseña"
        required
        autoComplete="new-password"
        className={fieldClass}
      />
      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirmar contraseña"
        required
        autoComplete="new-password"
        className={fieldClass}
      />
      {state?.message && <p className="text-sm text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending || !token}
        className="rounded-[var(--ge-radius)] px-4 py-2.5 font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Guardando…" : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}
