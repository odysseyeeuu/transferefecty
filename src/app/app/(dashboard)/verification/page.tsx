import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { KYC_TYPE_META, kycDocStatusLabel, kycUserStatusLabel } from "@/lib/kyc";
import { KycUploadForm } from "./kyc-upload-form";

export const metadata: Metadata = { title: "Verificación KYC" };

const STATUS_COLOR: Record<string, string> = {
  none: "var(--ge-text-muted)",
  pending: "var(--ge-warning)",
  approved: "var(--ge-success)",
  rejected: "var(--ge-error)",
};

export default async function VerificationPage() {
  const user = await requireUser();
  const documents = await db.kycDocument.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const canSubmit = user.kycStatus === "none" || user.kycStatus === "rejected";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          Verificación de identidad
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Estado actual:{" "}
          <span style={{ color: STATUS_COLOR[user.kycStatus] }} className="font-medium">
            {kycUserStatusLabel(user.kycStatus)}
          </span>
        </p>
      </div>

      {canSubmit && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
            {user.kycStatus === "rejected" ? "Vuelve a enviar tus documentos" : "Sube tus documentos"}
          </h2>
          <KycUploadForm />
        </section>
      )}

      {documents.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
            Documentos enviados
          </h2>
          <div className="ge-card divide-y divide-[var(--ge-border)]">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--ge-text-primary)]">
                    {KYC_TYPE_META[doc.documentType]?.label ?? doc.documentType}
                  </p>
                  {doc.reviewNote && (
                    <p className="text-xs text-[var(--ge-text-muted)]">Nota: {doc.reviewNote}</p>
                  )}
                </div>
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: STATUS_COLOR[doc.status] }}
                >
                  {kycDocStatusLabel(doc.status)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
