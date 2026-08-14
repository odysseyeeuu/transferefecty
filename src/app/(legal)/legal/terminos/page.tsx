import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader, Section, Bullets, Callout } from "@/components/legal/prose";
import { getLegalDoc } from "@/lib/legal";

const doc = getLegalDoc("terminos")!;
export const metadata: Metadata = { title: doc.title, description: doc.description };

export default function TerminosPage() {
  return (
    <>
      <LegalHeader
        title={doc.title}
        intro="Estas condiciones regulan el acceso y uso de la plataforma Transfer Efecty. Al crear una cuenta declaras haberlas leído y aceptado."
      />

      <Section title="1. Quiénes somos y qué ofrecemos">
        <p>
          Transfer Efecty es una plataforma que permite a personas usuarias gestionar
          criptoactivos: recibir y enviar fondos, intercambiar entre monedas (swap),
          constituir depósitos a plazo (CDT) y solicitar depósitos y retiros a través de la
          oficina que las atiende.
        </p>
        <p>
          No somos un banco ni una entidad de depósito. Los saldos reflejados en la
          plataforma corresponden a criptoactivos y no están cubiertos por seguros de
          depósito bancario.
        </p>
      </Section>

      <Section title="2. Requisitos para usar la plataforma">
        <Bullets
          items={[
            "Ser mayor de edad según la legislación de tu país de residencia.",
            "Registrarte con un código de oficina válido y vigente.",
            "Completar la verificación de identidad (KYC) cuando se te solicite.",
            "No encontrarte en listas restrictivas ni actuar por cuenta de terceros sin declararlo.",
          ]}
        />
      </Section>

      <Section title="3. Tu cuenta y tu seguridad">
        <p>
          Eres responsable de mantener la confidencialidad de tus credenciales y de toda
          actividad realizada desde tu cuenta. Recomendamos activar la verificación en dos
          pasos (2FA) desde tu configuración.
        </p>
        <p>
          Debes notificarnos de inmediato ante cualquier uso no autorizado. No solicitamos
          tu contraseña ni tus códigos 2FA por ningún canal: nadie de nuestro equipo te los
          pedirá.
        </p>
      </Section>

      <Section title="4. Operaciones, órdenes y comisiones">
        <Bullets
          items={[
            "Los intercambios (swap) se ejecutan al precio de mercado vigente al momento de la operación, con la comisión informada en pantalla antes de confirmar.",
            "Los depósitos y retiros requieren revisión y aprobación por parte del personal autorizado de tu oficina antes de acreditarse o procesarse.",
            "Las operaciones sobre redes blockchain son irreversibles: una vez confirmadas no pueden anularse.",
            "Enviar fondos a una red distinta de la indicada puede ocasionar su pérdida definitiva, sin posibilidad de recuperación por nuestra parte.",
          ]}
        />
        <Callout tone="warning">
          Verifica siempre la moneda, la red y la dirección de destino antes de confirmar
          cualquier operación. Estas verificaciones son responsabilidad de la persona usuaria.
        </Callout>
      </Section>

      <Section title="5. Depósitos a plazo (CDT)">
        <p>
          Los planes de CDT inmovilizan el saldo indicado durante el plazo elegido y generan
          un rendimiento calculado sobre la tasa anual (APY) publicada y los días
          efectivamente transcurridos. Los planes con plazo fijo no permiten el retiro
          anticipado del capital hasta el vencimiento.
        </p>
        <p>
          Las tasas publicadas son estimaciones sobre base anual y pueden variar para nuevas
          constituciones. No constituyen una promesa de rentabilidad garantizada.
        </p>
      </Section>

      <Section title="6. Conductas prohibidas">
        <Bullets
          items={[
            "Utilizar la plataforma para actividades ilícitas o para ocultar el origen de fondos.",
            "Suplantar identidades o aportar documentación falsa o alterada.",
            "Intentar vulnerar, sobrecargar o acceder sin autorización a los sistemas.",
            "Operar en nombre de terceros sin la debida declaración y autorización.",
          ]}
        />
        <p>
          El incumplimiento puede derivar en la suspensión o cierre de la cuenta y, cuando
          corresponda, en el reporte a las autoridades competentes.
        </p>
      </Section>

      <Section title="7. Suspensión y cierre de cuentas">
        <p>
          Podemos limitar funcionalidades, suspender o cerrar una cuenta cuando detectemos
          indicios de fraude, incumplimiento de estas condiciones, requerimientos legales o
          riesgos para la seguridad de la plataforma o de terceros.
        </p>
      </Section>

      <Section title="8. Disponibilidad del servicio">
        <p>
          Trabajamos para mantener el servicio disponible de forma continua, pero no
          garantizamos ausencia total de interrupciones. Pueden producirse ventanas de
          mantenimiento, incidencias técnicas o afectaciones de terceros (redes blockchain,
          proveedores de precios o de infraestructura).
        </p>
      </Section>

      <Section title="9. Limitación de responsabilidad">
        <p>
          En la máxima medida permitida por la ley aplicable, no respondemos por pérdidas
          derivadas de la volatilidad de los criptoactivos, de decisiones de inversión de la
          persona usuaria, del uso de credenciales por terceros por causa no imputable a
          nosotros, ni de errores en direcciones o redes introducidas por la persona usuaria.
        </p>
      </Section>

      <Section title="10. Cambios en estas condiciones">
        <p>
          Podemos actualizar estas condiciones. Publicaremos la versión vigente en esta
          página con su fecha de actualización y, cuando el cambio sea sustancial, lo
          notificaremos por los canales de la plataforma.
        </p>
      </Section>

      <Section title="11. Contacto">
        <p>
          Para cualquier consulta sobre estas condiciones puedes escribirnos a{" "}
          <a href="mailto:soporte@transferefecty.com" className="text-[var(--ge-cyan)]">
            soporte@transferefecty.com
          </a>{" "}
          o abrir un ticket desde tu cuenta.
        </p>
        <p>
          Consulta también nuestra{" "}
          <Link href="/legal/privacidad" className="text-[var(--ge-cyan)]">
            Política de Privacidad
          </Link>{" "}
          y la{" "}
          <Link href="/legal/riesgos" className="text-[var(--ge-cyan)]">
            Advertencia de Riesgos
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
