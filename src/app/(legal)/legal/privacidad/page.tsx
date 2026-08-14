import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader, Section, Bullets, Callout } from "@/components/legal/prose";
import { getLegalDoc } from "@/lib/legal";

const doc = getLegalDoc("privacidad")!;
export const metadata: Metadata = { title: doc.title, description: doc.description };

export default function PrivacidadPage() {
  return (
    <>
      <LegalHeader
        title={doc.title}
        intro="Explicamos qué datos personales tratamos, con qué finalidad y qué derechos tienes sobre ellos."
      />

      <Section title="1. Datos que tratamos">
        <Bullets
          items={[
            <>
              <strong>De registro:</strong> nombre completo, correo electrónico, país,
              teléfono y oficina asociada.
            </>,
            <>
              <strong>De verificación (KYC):</strong> documento de identidad (anverso y
              reverso), comprobante de domicilio y selfie con documento.
            </>,
            <>
              <strong>De operación:</strong> saldos, movimientos, intercambios, depósitos a
              plazo y solicitudes de depósito o retiro.
            </>,
            <>
              <strong>Técnicos:</strong> dirección IP y fecha del último acceso, con fines de
              seguridad.
            </>,
            <>
              <strong>De soporte:</strong> mensajes de tickets y chat con el equipo.
            </>,
          ]}
        />
      </Section>

      <Section title="2. Para qué usamos tus datos">
        <Bullets
          items={[
            "Crear y administrar tu cuenta, y prestarte los servicios de la plataforma.",
            "Verificar tu identidad y cumplir obligaciones de prevención de lavado de activos.",
            "Detectar y prevenir fraude, accesos no autorizados y abusos.",
            "Atender tus consultas y solicitudes de soporte.",
            "Cumplir requerimientos legales y de autoridades competentes.",
          ]}
        />
        <p>
          No vendemos tus datos personales ni los cedemos a terceros con fines publicitarios.
        </p>
      </Section>

      <Section title="3. Quién puede ver tus documentos de identidad">
        <p>
          Los documentos que subes en la verificación KYC se almacenan cifrados y con acceso
          restringido. Únicamente pueden consultarlos:
        </p>
        <Bullets
          items={[
            "Tú, desde tu propia cuenta.",
            "El personal autorizado de la oficina a la que perteneces.",
            "La administración de la plataforma, para revisión y cumplimiento.",
          ]}
        />
        <Callout>
          Estos archivos no son accesibles mediante enlaces públicos: cada visualización pasa
          por una comprobación de permisos en el servidor.
        </Callout>
      </Section>

      <Section title="4. Proveedores que intervienen">
        <p>
          Para prestar el servicio nos apoyamos en proveedores de infraestructura que pueden
          tratar datos por cuenta nuestra, sujetos a obligaciones de confidencialidad:
          alojamiento de la aplicación, base de datos gestionada, almacenamiento de archivos
          y envío de correo transaccional.
        </p>
      </Section>

      <Section title="5. Cuánto tiempo conservamos la información">
        <p>
          Conservamos tus datos mientras tu cuenta permanezca activa. Tras su cierre,
          mantenemos la información estrictamente necesaria para atender obligaciones
          legales, contables y de prevención de lavado de activos durante los plazos que
          exija la normativa aplicable, y luego la eliminamos o anonimizamos.
        </p>
      </Section>

      <Section title="6. Seguridad">
        <Bullets
          items={[
            "Las contraseñas se guardan con hash bcrypt: no almacenamos contraseñas en texto plano ni podemos leerlas.",
            "Los secretos de verificación en dos pasos se guardan cifrados.",
            "Todo el tráfico viaja sobre HTTPS y las cookies de sesión son HttpOnly y Secure.",
            "El acceso del personal a los datos de clientes está limitado por oficina y por rol.",
          ]}
        />
      </Section>

      <Section title="7. Tus derechos">
        <p>
          Puedes solicitar acceso, rectificación, actualización o supresión de tus datos, así
          como oponerte a determinados tratamientos o solicitar su limitación. Para
          ejercerlos escríbenos a{" "}
          <a href="mailto:privacidad@transferefecty.com" className="text-[var(--ge-cyan)]">
            privacidad@transferefecty.com
          </a>{" "}
          desde el correo asociado a tu cuenta.
        </p>
        <p>
          Ten en cuenta que algunas solicitudes de supresión pueden verse limitadas por las
          obligaciones legales de conservación descritas arriba.
        </p>
      </Section>

      <Section title="8. Cambios en esta política">
        <p>
          Publicaremos cualquier actualización en esta misma página, indicando la fecha de
          última revisión. Consulta también nuestra{" "}
          <Link href="/legal/cookies" className="text-[var(--ge-cyan)]">
            Política de Cookies
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
