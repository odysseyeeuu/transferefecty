"use client";

import { useActionState } from "react";
import { sendCrypto } from "@/app/actions/wallet";
import { CRYPTO_CURRENCIES } from "@/lib/config/currencies";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]";

export function SendForm({ defaultCurrency }: { defaultCurrency: string }) {
  const [state, formAction, pending] = useActionState(sendCrypto, undefined);

  return (
    <form action={formAction} className="ge-card flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[var(--ge-text-secondary)]">Moneda</label>
        <select name="currency" defaultValue={defaultCurrency} className={fieldClass}>
          {CRYPTO_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[var(--ge-text-secondary)]">Monto</label>
        <input name="amount" type="number" step="any" min="0" required className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[var(--ge-text-secondary)]">Dirección de destino</label>
        <input name="address" required className={fieldClass} />
      </div>
      {state?.message && <p className="text-sm text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius)] px-4 py-2.5 font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
