// Puerto de `www/src/Helpers/KycHelper.php`.

export const KYC_DOCUMENT_TYPES = [
  "id_front",
  "id_back",
  "proof_of_address",
  "id_selfie",
] as const;

export type KycDocumentTypeValue = (typeof KYC_DOCUMENT_TYPES)[number];

export const KYC_TYPE_META: Record<
  KycDocumentTypeValue,
  { label: string; hint: string; accept: string; capture?: "user" }
> = {
  id_front: {
    label: "Identificación — frente",
    hint: "Foto clara del anverso de tu documento (cédula, pasaporte o DNI).",
    accept: "image/*,.pdf",
  },
  id_back: {
    label: "Identificación — reverso",
    hint: "Foto clara del reverso de tu documento.",
    accept: "image/*,.pdf",
  },
  proof_of_address: {
    label: "Comprobante de domicilio",
    hint: "Recibo de servicios, extracto bancario o factura reciente (máx. 3 meses).",
    accept: "image/*,.pdf",
  },
  id_selfie: {
    label: "Selfie con documento",
    hint: "Selfie tuyo sosteniendo el documento de identidad junto a tu rostro. Buena luz, rostro y documento visibles.",
    accept: "image/*",
    capture: "user",
  },
};

export function kycUserStatusLabel(status: string): string {
  return (
    {
      none: "Sin enviar",
      pending: "En revisión",
      approved: "Verificado",
      rejected: "Rechazado",
    }[status] ?? status
  );
}

export function kycDocStatusLabel(status: string): string {
  return (
    {
      pending: "En revisión",
      approved: "Aprobado",
      rejected: "Rechazado",
    }[status] ?? status
  );
}
