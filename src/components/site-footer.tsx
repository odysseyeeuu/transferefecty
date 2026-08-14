import Link from "next/link";
import { Mail, MessageCircle, ShieldCheck, Clock, Lock } from "lucide-react";
import { Logo } from "@/components/logo";
import { LEGAL_DOCS } from "@/lib/legal";

const PRODUCTO = [
  { href: "/#features", label: "Funciones" },
  { href: "/#how", label: "Cómo funciona" },
  { href: "/#earn", label: "CDT / Staking" },
  { href: "/#security", label: "Seguridad" },
];

const CUENTA = [
  { href: "/app/register", label: "Crear cuenta" },
  { href: "/app/login", label: "Iniciar sesión" },
  { href: "/app/forgot-password", label: "Recuperar contraseña" },
];

const AYUDA = [
  { href: "/#faq", label: "Preguntas frecuentes" },
  { href: "/#contacto", label: "Contacto" },
  { href: "/app/support", label: "Abrir un ticket" },
  { href: "/app/chat", label: "Chat en vivo" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--ge-border)] bg-[var(--ge-bg-secondary)]">
      {/* Franja de confianza */}
      <div className="border-b border-[var(--ge-border)]">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "KYC verificado", sub: "Cumplimiento AML" },
            { icon: Lock, title: "Cifrado en tránsito", sub: "HTTPS y cookies seguras" },
            { icon: Clock, title: "Soporte 24/7", sub: "Tickets y chat en vivo" },
            { icon: MessageCircle, title: "Atención en español", sub: "Respaldo de tu oficina" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--ge-bg-card)] text-[var(--ge-violet)]">
                <item.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--ge-text-primary)]">{item.title}</p>
                <p className="text-xs text-[var(--ge-text-muted)]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Columnas de navegación */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo height={40} />
          <p className="mt-4 max-w-xs text-sm text-[var(--ge-text-secondary)]">
            Billetera de criptoactivos para enviar, intercambiar y hacer crecer tu dinero,
            con soporte humano en español.
          </p>
          <a
            href="mailto:soporte@transferefecty.com"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--ge-text-secondary)] transition-colors hover:text-[var(--ge-cyan)]"
          >
            <Mail className="size-4" />
            soporte@transferefecty.com
          </a>
        </div>

        <FooterColumn title="Producto" links={PRODUCTO} />
        <FooterColumn title="Tu cuenta" links={CUENTA} />
        <FooterColumn title="Ayuda" links={AYUDA} />
      </div>

      {/* Legales */}
      <div className="border-t border-[var(--ge-border)]">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_DOCS.map((doc) => (
              <Link
                key={doc.slug}
                href={`/legal/${doc.slug}`}
                className="text-xs text-[var(--ge-text-muted)] transition-colors hover:text-[var(--ge-text-primary)]"
              >
                {doc.title}
              </Link>
            ))}
          </nav>

          <p className="mt-5 text-xs leading-relaxed text-[var(--ge-text-muted)]">
            <strong className="text-[var(--ge-text-secondary)]">Advertencia de riesgo:</strong>{" "}
            operar con criptoactivos conlleva riesgo de pérdida total del capital. Los
            criptoactivos no son moneda de curso legal, no están respaldados por un banco
            central ni cubiertos por seguros de depósito. La información de esta plataforma no
            constituye asesoramiento financiero.{" "}
            <Link href="/legal/riesgos" className="text-[var(--ge-cyan)]">
              Leer la advertencia completa
            </Link>
            .
          </p>

          <p className="mt-4 text-xs text-[var(--ge-text-muted)]">
            © {year} Transfer Efecty. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
        {title}
      </p>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-[var(--ge-text-secondary)] transition-colors hover:text-[var(--ge-text-primary)]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
