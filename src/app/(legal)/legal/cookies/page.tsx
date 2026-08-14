import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader, Section, Callout } from "@/components/legal/prose";
import { getLegalDoc } from "@/lib/legal";

const doc = getLegalDoc("cookies")!;
export const metadata: Metadata = { title: doc.title, description: doc.description };

export default function CookiesPage() {
  return (
    <>
      <LegalHeader
        title={doc.title}
        intro="Qué cookies utiliza Transfer Efecty y con qué finalidad."
      />

      <Callout>
        Hoy sólo utilizamos cookies <strong>estrictamente necesarias</strong> para que la
        plataforma funcione. No usamos cookies de publicidad ni de seguimiento entre sitios,
        por lo que no mostramos un banner de consentimiento.
      </Callout>

      <Section title="Cookies que utilizamos">
        <div className="overflow-x-auto">
          <table className="ge-card w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--ge-border)] text-xs uppercase tracking-wider text-[var(--ge-text-muted)]">
                <th className="px-4 py-3 font-semibold">Cookie</th>
                <th className="px-4 py-3 font-semibold">Finalidad</th>
                <th className="px-4 py-3 font-semibold">Duración</th>
              </tr>
            </thead>
            <tbody className="text-[var(--ge-text-secondary)]">
              <tr className="border-b border-[var(--ge-border)]">
                <td className="px-4 py-3 font-mono text-xs text-[var(--ge-text-primary)]">
                  ge_session
                </td>
                <td className="px-4 py-3">
                  Mantiene tu sesión iniciada e identifica de forma segura a la persona
                  usuaria. Sin ella no es posible acceder a la cuenta.
                </td>
                <td className="px-4 py-3">12 horas</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--ge-text-muted)]">
          Es una cookie firmada, marcada como <code>HttpOnly</code>, <code>Secure</code> y{" "}
          <code>SameSite=Lax</code>: no puede leerse desde JavaScript ni enviarse a otros
          sitios.
        </p>
      </Section>

      <Section title="Cómo controlarlas">
        <p>
          Puedes eliminar o bloquear las cookies desde la configuración de tu navegador. Ten
          en cuenta que si bloqueas la cookie de sesión no podrás iniciar sesión en la
          plataforma.
        </p>
        <p>
          Si en el futuro incorporamos cookies de analítica o de terceros, actualizaremos
          esta página y solicitaremos tu consentimiento previo cuando la normativa lo exija.
        </p>
      </Section>

      <Section title="Más información">
        <p>
          Revisa nuestra{" "}
          <Link href="/legal/privacidad" className="text-[var(--ge-cyan)]">
            Política de Privacidad
          </Link>{" "}
          para conocer el resto del tratamiento de datos.
        </p>
      </Section>
    </>
  );
}
