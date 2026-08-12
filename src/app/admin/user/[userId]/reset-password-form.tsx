"use client";

import { useActionState } from "react";
import { resetUserPassword } from "@/app/actions/admin-users";

export function ResetPasswordForm({ userId }: { userId: number }) {
  const [state, formAction, pending] = useActionState(resetUserPassword, undefined);

  const fieldClass =
    "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none";

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input name="password" type="password" placeholder="Nueva contraseña" required className={fieldClass} />
      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirmar"
        required
        className={fieldClass}
      />
      <label className="flex items-center gap-2 text-xs text-[var(--ge-text-secondary)]">
        <input type="checkbox" name="forcePasswordChange" />
        Forzar cambio de contraseña en el próximo login
      </label>
      {state?.message && <p className="text-xs text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-[var(--ge-radius-sm)] px-3 py-1.5 text-xs font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-warning)" }}
      >
        {pending ? "Guardando…" : "Restablecer contraseña"}
      </button>
    </form>
  );
}
