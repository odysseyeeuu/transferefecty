"use client";

import { useActionState, useState } from "react";
import { sendBulkNotification } from "@/app/actions/admin-notifications";
import { KYC_FILTERS } from "@/lib/kyc-filter";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none";

export function SendNotificationForm({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [state, formAction, pending] = useActionState(sendBulkNotification, undefined);
  const [scope, setScope] = useState("one");

  return (
    <form action={formAction} className="ge-card flex flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-1.5 text-sm text-[var(--ge-text-secondary)]">
          <input
            type="radio"
            name="scope"
            value="one"
            checked={scope === "one"}
            onChange={() => setScope("one")}
          />
          Un usuario
        </label>
        <label className="flex items-center gap-1.5 text-sm text-[var(--ge-text-secondary)]">
          <input
            type="radio"
            name="scope"
            value="office"
            checked={scope === "office"}
            onChange={() => setScope("office")}
          />
          Mi oficina
        </label>
        {isSuperAdmin && (
          <label className="flex items-center gap-1.5 text-sm text-[var(--ge-text-secondary)]">
            <input
              type="radio"
              name="scope"
              value="all"
              checked={scope === "all"}
              onChange={() => setScope("all")}
            />
            Todos los clientes
          </label>
        )}
      </div>

      {scope === "one" && (
        <input name="userRef" placeholder="ID o email del usuario" className={fieldClass} />
      )}

      {scope !== "one" && (
        <select name="kycFilter" defaultValue="" className={fieldClass}>
          <option value="">Todos (sin filtro KYC)</option>
          {KYC_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      )}

      <input name="title" placeholder="Título" required className={fieldClass} />
      <textarea name="body" placeholder="Mensaje" required rows={3} className={fieldClass} />

      <select name="type" defaultValue="info" className={fieldClass}>
        <option value="info">Info</option>
        <option value="success">Éxito</option>
        <option value="warning">Advertencia</option>
        <option value="error">Error</option>
      </select>

      {state?.message && <p className="text-sm text-[var(--ge-error)]">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Enviando…" : "Enviar notificación"}
      </button>
    </form>
  );
}
