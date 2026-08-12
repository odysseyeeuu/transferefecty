import type { Metadata } from "next";

export const metadata: Metadata = { title: "Producción" };

// TODO(v2): portar lógica real desde `www/admin/production/index.php`.
// Ver docs/PARIDAD.md para el detalle de qué falta en esta pantalla.
export default function Page() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-[var(--ge-text-primary)]">Producción</h1>
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
        🚧 Pendiente de portar desde <code>www/admin/production/index.php</code>. Ver{" "}
        <code>docs/PARIDAD.md</code> para el detalle de esta pantalla.
      </p>
    </div>
  );
}
