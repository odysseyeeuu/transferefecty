"use client";

import { useActionState } from "react";
import { createTicket } from "@/app/actions/support";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]";

export function CreateTicketForm() {
  const [state, formAction, pending] = useActionState(createTicket, undefined);

  return (
    <form action={formAction} className="ge-card flex flex-col gap-3 p-4">
      <input name="subject" placeholder="Asunto" required className={fieldClass} />
      <textarea name="message" placeholder="Describe tu problema" rows={3} required className={fieldClass} />
      {state?.message && <p className="text-xs text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Enviando…" : "Crear ticket"}
      </button>
    </form>
  );
}
