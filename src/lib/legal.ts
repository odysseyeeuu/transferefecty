/**
 * Índice de documentos legales. Centralizado aquí para que el footer, el
 * layout legal y el sitemap no se desincronicen: si se agrega un documento,
 * aparece solo en los tres sitios.
 *
 * IMPORTANTE: estos textos son una base redactada para una plataforma de
 * activos digitales, NO asesoría legal. Antes de operar con clientes reales
 * deben ser revisados por un abogado con la jurisdicción y la figura
 * societaria concretas de Transfer Efecty (ver docs/LEGAL.md).
 */

export interface LegalDoc {
  slug: string;
  title: string;
  short: string;
  description: string;
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terminos",
    title: "Términos y Condiciones",
    short: "Términos",
    description:
      "Condiciones de uso de la plataforma, obligaciones de las partes y reglas de las operaciones.",
  },
  {
    slug: "privacidad",
    title: "Política de Privacidad",
    short: "Privacidad",
    description:
      "Qué datos personales tratamos, con qué finalidad, por cuánto tiempo y cómo ejercer tus derechos.",
  },
  {
    slug: "cookies",
    title: "Política de Cookies",
    short: "Cookies",
    description: "Qué cookies usamos y para qué. Hoy sólo usamos cookies estrictamente necesarias.",
  },
  {
    slug: "aml",
    title: "Política AML / KYC",
    short: "AML / KYC",
    description:
      "Prevención de lavado de activos y financiación del terrorismo, y verificación de identidad.",
  },
  {
    slug: "riesgos",
    title: "Advertencia de Riesgos",
    short: "Riesgos",
    description:
      "Riesgos asociados a operar con criptoactivos. Léelo antes de depositar fondos.",
  },
];

/** Fecha de última revisión que se muestra en los documentos. */
export const LEGAL_LAST_UPDATED = "14 de agosto de 2026";

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
