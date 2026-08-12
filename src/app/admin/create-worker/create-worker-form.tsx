"use client";

import { useActionState } from "react";
import { createSuperWorker } from "@/app/actions/admin-staff";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none";

export function CreateWorkerForm({ offices }: { offices: { id: number; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createSuperWorker, undefined);

  return (
    <form action={formAction} className="ge-card flex max-w-md flex-col gap-3 p-4">
      <input name="fullName" placeholder="Nombre completo" required className={fieldClass} />
      <input name="email" type="email" placeholder="Email" required className={fieldClass} />
      <input name="password" type="password" placeholder="Contraseña" required className={fieldClass} />
      <select name="officeId" required className={fieldClass}>
        <option value="">Selecciona oficina…</option>
        {offices.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {state?.message && <p className="text-xs text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Creando…" : "Crear SuperWorker"}
      </button>
    </form>
  );
}
