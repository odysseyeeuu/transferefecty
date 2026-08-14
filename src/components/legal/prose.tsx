import { LEGAL_LAST_UPDATED } from "@/lib/legal";

/** Encabezado estándar de cada documento legal. */
export function LegalHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="mb-8 border-b border-[var(--ge-border)] pb-6">
      <h1 className="text-3xl font-bold text-[var(--ge-text-primary)]">{title}</h1>
      <p className="mt-2 text-[var(--ge-text-secondary)]">{intro}</p>
      <p className="mt-3 text-xs text-[var(--ge-text-muted)]">
        Última actualización: {LEGAL_LAST_UPDATED}
      </p>
    </header>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-[var(--ge-text-primary)]">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-[var(--ge-text-secondary)]">
        {children}
      </div>
    </section>
  );
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** Aviso destacado — para advertencias que el usuario no debería pasar por alto. */
export function Callout({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning";
  children: React.ReactNode;
}) {
  const color = tone === "warning" ? "var(--ge-warning)" : "var(--ge-cyan)";
  return (
    <div
      className="ge-card border-l-4 px-4 py-3 text-sm text-[var(--ge-text-secondary)]"
      style={{ borderLeftColor: color }}
    >
      {children}
    </div>
  );
}
