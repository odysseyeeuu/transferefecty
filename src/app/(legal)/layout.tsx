import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import { SiteFooter } from "@/components/site-footer";
import { LEGAL_DOCS } from "@/lib/legal";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNav />
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[220px_1fr]">
          {/* Navegación entre documentos */}
          <nav aria-label="Documentos legales" className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
              Documentos legales
            </p>
            <ul className="flex flex-wrap gap-2 lg:flex-col">
              {LEGAL_DOCS.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/legal/${doc.slug}`}
                    className="block rounded-[var(--ge-radius-sm)] px-3 py-2 text-sm text-[var(--ge-text-secondary)] transition-colors hover:bg-[var(--ge-bg-elevated)] hover:text-[var(--ge-text-primary)]"
                  >
                    {doc.short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <article className="min-w-0">{children}</article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
