import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader, Section, Bullets, Callout } from "@/components/legal/prose";
import { getLegalDoc } from "@/lib/legal";

const doc = getLegalDoc("riesgos")!;
export const metadata: Metadata = { title: doc.title, description: doc.description };

export default function RiesgosPage() {
  return (
    <>
      <LegalHeader
        title={doc.title}
        intro="Operar con criptoactivos implica riesgos reales de pérdida. Lee esta advertencia antes de depositar fondos."
      />

      <Callout tone="warning">
        Los criptoactivos no son moneda de curso legal en la mayoría de jurisdicciones, no
        están respaldados por un banco central y <strong>no cuentan con seguro de depósito</strong>.
        Puedes perder la totalidad del importe invertido.
      </Callout>

      <Section title="1. Volatilidad">
        <p>
          El precio de los criptoactivos puede variar de forma brusca en periodos muy cortos.
          Una operación rentable hoy puede no serlo mañana. Nunca destines fondos que
          necesites para gastos esenciales o compromisos de corto plazo.
        </p>
      </Section>

      <Section title="2. Irreversibilidad de las operaciones">
        <p>
          Las transacciones confirmadas en una red blockchain no pueden revertirse. Un error
          en la dirección de destino o en la red seleccionada puede provocar la pérdida
          definitiva de los fondos, sin posibilidad de recuperación por nuestra parte ni por
          la de ningún tercero.
        </p>
      </Section>

      <Section title="3. Riesgos tecnológicos">
        <Bullets
          items={[
            "Congestión de la red que retrase confirmaciones o eleve las comisiones.",
            "Fallos, bifurcaciones o cambios de protocolo en las cadenas de bloques.",
            "Indisponibilidad temporal de la plataforma o de proveedores externos de precios.",
          ]}
        />
      </Section>

      <Section title="4. Riesgos de seguridad personal">
        <p>
          La causa más frecuente de pérdida es el compromiso de las credenciales de la persona
          usuaria: fraudes de suplantación, correos falsos y programas maliciosos.
        </p>
        <Bullets
          items={[
            "Activa la verificación en dos pasos (2FA) desde tu configuración.",
            "Nunca compartas contraseñas ni códigos: nuestro equipo jamás te los pedirá.",
            "Desconfía de cualquier promesa de rentabilidad garantizada o de terceros que te ofrezcan operar por ti.",
          ]}
        />
      </Section>

      <Section title="5. Rendimientos de los CDT">
        <p>
          Las tasas anuales (APY) publicadas son estimaciones sobre base anual y pueden
          modificarse para nuevas constituciones. El rendimiento se calcula sobre los días
          efectivamente transcurridos y no constituye una promesa de retorno garantizado. Los
          planes con plazo fijo inmovilizan el capital hasta su vencimiento.
        </p>
      </Section>

      <Section title="6. Ausencia de asesoramiento">
        <p>
          La información de la plataforma —incluidos precios, gráficos y planes— tiene
          carácter meramente informativo y{" "}
          <strong>no constituye asesoramiento financiero, legal ni fiscal</strong>, ni una
          recomendación de compra o venta. Las decisiones son responsabilidad exclusiva de la
          persona usuaria. Consulta con un profesional independiente si lo necesitas.
        </p>
      </Section>

      <Section title="7. Obligaciones fiscales">
        <p>
          La declaración y el pago de los impuestos que se deriven de tus operaciones
          corresponden a la persona usuaria, según la normativa de su país de residencia.
        </p>
      </Section>

      <Section title="Más información">
        <p>
          Revisa los{" "}
          <Link href="/legal/terminos" className="text-[var(--ge-cyan)]">
            Términos y Condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/legal/aml" className="text-[var(--ge-cyan)]">
            Política AML / KYC
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
