"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export interface DepositWallet {
  id: number;
  currency: string;
  network: string;
  address: string;
  label: string | null;
}

/**
 * Direcciones de depósito de la oficina del cliente — equivalente al
 * `officeDepositMap` que la v1 pasaba a la vista de pagos. Sin esto el
 * cliente no sabe a dónde enviar el crypto.
 */
export function DepositAddresses({ wallets }: { wallets: DepositWallet[] }) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function copy(wallet: DepositWallet) {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopiedId(wallet.id);
      setTimeout(() => setCopiedId((id) => (id === wallet.id ? null : id)), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, la dirección sigue visible
      // en pantalla para copiarla a mano.
    }
  }

  if (wallets.length === 0) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-warning)]">
        Tu oficina todavía no configuró direcciones de depósito. Escríbeles por chat en
        vivo antes de enviar fondos.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--ge-text-secondary)]">
        Envía tus fondos a la dirección que corresponda a la moneda y red que elegiste, y
        luego registra la solicitud de depósito aquí abajo.
      </p>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {wallets.map((w) => (
          <div key={w.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--ge-text-primary)]">
                {w.currency} · {w.network}
                {w.label && (
                  <span className="ml-2 text-xs font-normal text-[var(--ge-text-muted)]">
                    {w.label}
                  </span>
                )}
              </p>
              <p className="break-all font-mono text-xs text-[var(--ge-text-secondary)]">
                {w.address}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(w)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--ge-text-primary)]"
            >
              {copiedId === w.id ? (
                <>
                  <Check className="size-3.5" /> Copiada
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copiar
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--ge-text-muted)]">
        Verifica que la red coincida exactamente. Enviar por una red distinta a la
        indicada puede hacer que los fondos se pierdan de forma irrecuperable.
      </p>
    </div>
  );
}
