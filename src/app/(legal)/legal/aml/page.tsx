import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader, Section, Bullets, Callout } from "@/components/legal/prose";
import { getLegalDoc } from "@/lib/legal";

const doc = getLegalDoc("aml")!;
export const metadata: Metadata = { title: doc.title, description: doc.description };

export default function AmlPage() {
  return (
    <>
      <LegalHeader
        title={doc.title}
        intro="Nuestro compromiso en materia de prevención de lavado de activos y financiación del terrorismo (LA/FT), y qué implica para ti."
      />

      <Section title="1. Principio general">
        <p>
          Transfer Efecty rechaza cualquier uso de la plataforma con fines ilícitos. Aplicamos
          medidas de conocimiento del cliente, seguimiento de operaciones y reporte a las
          autoridades competentes cuando corresponda.
        </p>
      </Section>

      <Section title="2. Verificación de identidad (KYC)">
        <p>Para operar con normalidad debes completar la verificación aportando:</p>
        <Bullets
          items={[
            "Documento de identidad vigente — anverso y reverso.",
            "Comprobante de domicilio con antigüedad no mayor a tres meses.",
            "Selfie sosteniendo tu documento de identidad, con rostro y documento legibles.",
          ]}
        />
        <p>
          La documentación es revisada por el personal autorizado de tu oficina. Podemos
          solicitar información adicional o actualizada cuando sea necesario.
        </p>
      </Section>

      <Section title="3. Seguimiento de operaciones">
        <Bullets
          items={[
            "Las solicitudes de depósito y retiro se revisan y aprueban manualmente antes de ejecutarse.",
            "Toda acción del personal administrativo queda registrada en un log de auditoría.",
            "Podemos solicitar justificación sobre el origen de los fondos en operaciones que lo ameriten.",
          ]}
        />
      </Section>

      <Section title="4. Situaciones que pueden motivar una revisión">
        <Bullets
          items={[
            "Documentación incompleta, ilegible, alterada o inconsistente.",
            "Operaciones sin relación aparente con la actividad declarada.",
            "Fraccionamiento de operaciones para eludir controles.",
            "Negativa a aportar información requerida por normativa.",
            "Uso de la cuenta por parte de terceros no declarados.",
          ]}
        />
        <Callout tone="warning">
          Ante indicios fundados podemos suspender operaciones, congelar la cuenta y, cuando
          la ley lo exija, reportar a las autoridades sin notificación previa a la persona
          usuaria.
        </Callout>
      </Section>

      <Section title="5. Conservación de registros">
        <p>
          Conservamos la documentación de identificación y el registro de operaciones durante
          los plazos exigidos por la normativa aplicable, incluso después del cierre de la
          cuenta. Ver{" "}
          <Link href="/legal/privacidad" className="text-[var(--ge-cyan)]">
            Política de Privacidad
          </Link>
          .
        </p>
      </Section>

      <Section title="6. Canal de contacto">
        <p>
          Consultas sobre esta política:{" "}
          <a href="mailto:cumplimiento@transferefecty.com" className="text-[var(--ge-cyan)]">
            cumplimiento@transferefecty.com
          </a>
          .
        </p>
      </Section>
    </>
  );
}
