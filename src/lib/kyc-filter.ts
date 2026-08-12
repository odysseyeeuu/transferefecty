import type { Prisma } from "@prisma/client";

// Puerto de `AdminController::notifKycFilterSql()`. Vive fuera de
// `app/actions/admin-notifications.ts` porque un archivo "use server" sólo
// puede exportar funciones async (convención de Server Actions de Next.js) —
// este helper es síncrono y se usa tanto en la action como en el form.

export const KYC_FILTERS = [
  { value: "approved", label: "KYC aprobado" },
  { value: "pending", label: "KYC pendiente" },
  { value: "none", label: "Sin KYC" },
  { value: "rejected", label: "KYC rechazado" },
  { value: "not_approved", label: "No aprobado (cualquier otro estado)" },
  { value: "missing_docs", label: "Sin documentos subidos" },
] as const;

export type KycFilterValue = (typeof KYC_FILTERS)[number]["value"] | "";

export function kycFilterWhere(filter: KycFilterValue): Prisma.UserWhereInput {
  switch (filter) {
    case "approved":
    case "pending":
    case "none":
    case "rejected":
      return { kycStatus: filter };
    case "not_approved":
      return { kycStatus: { not: "approved" } };
    case "missing_docs":
      // Simplificado frente a la v1 (que contaba tipos de documento
      // distintos < 4): aquí sólo cubre "no subió ningún documento todavía".
      return { kycDocuments: { none: {} } };
    default:
      return {};
  }
}
