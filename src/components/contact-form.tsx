"use client";

import { useActionState } from "react";
import { submitContactMessage } from "@/app/actions/contact";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, undefined);

  if (state?.success) {
    return (
      <p className="text-sm text-[var(--ge-success)]">
        Mensaje enviado correctamente. Te responderemos pronto.
      </p>
    );
  }

  return (
    <form action={formAction} className="mx-auto flex max-w-md flex-col gap-3">
      <input name="name" placeholder="Tu nombre" required className={fieldClass} />
      <input name="email" type="email" placeholder="Tu correo" required className={fieldClass} />
      <textarea name="message" placeholder="¿En qué te ayudamos?" required rows={3} className={fieldClass} />
      {state?.message && <p className="text-xs text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
