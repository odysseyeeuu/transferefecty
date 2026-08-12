import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";
import { KYC_TYPE_META, kycDocStatusLabel } from "@/lib/kyc";
import { reviewKycDocumentForm } from "@/app/actions/kyc";

export const metadata: Metadata = { title: "Admin · Cola KYC" };

const STATUS_COLOR: Record<string, string> = {
  pending: "var(--ge-warning)",
  approved: "var(--ge-success)",
  rejected: "var(--ge-error)",
};

export default async function AdminKycQueuePage() {
  const admin = await requireRole(["superadmin", "superworker"]);
  const scope = officeScopeId(admin);

  if (admin.role === "superworker" && scope <= 0) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
        No tienes una oficina asignada — no hay usuarios que revisar.
      </p>
    );
  }

  const users = await db.user.findMany({
    where: {
      kycStatus: { in: ["pending", "rejected"] },
      ...(scope > 0 ? { officeId: scope } : {}),
    },
    include: { kycDocuments: { orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Cola KYC</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          {users.length} usuario{users.length === 1 ? "" : "s"} pendiente
          {users.length === 1 ? "" : "s"} de revisión.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {users.map((u) => {
          // último documento por tipo (misma regla que KycHelper::latestByType)
          const latestByType = new Map<string, (typeof u.kycDocuments)[number]>();
          for (const doc of u.kycDocuments) {
            if (!latestByType.has(doc.documentType)) latestByType.set(doc.documentType, doc);
          }

          return (
            <div key={u.id} className="ge-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--ge-text-primary)]">{u.fullName}</p>
                  <p className="text-xs text-[var(--ge-text-muted)]">{u.email}</p>
                </div>
                <form action={reviewKycDocumentForm}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="returnTo" value="queue" />
                  <input type="hidden" name="bulk" value="approve_all" />
                  <button
                    type="submit"
                    className="rounded-[var(--ge-radius-sm)] px-3 py-1.5 text-xs font-medium text-[var(--ge-text-inverse)]"
                    style={{ background: "var(--ge-success)" }}
                  >
                    Aprobar todos los pendientes
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[...latestByType.values()].map((doc) => (
                  <div key={doc.id} className="rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-[var(--ge-text-primary)]">
                        {KYC_TYPE_META[doc.documentType]?.label ?? doc.documentType}
                      </p>
                      <span
                        className="text-xs font-semibold uppercase"
                        style={{ color: STATUS_COLOR[doc.status] }}
                      >
                        {kycDocStatusLabel(doc.status)}
                      </span>
                    </div>
                    <a
                      href={`/storage/${doc.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--ge-cyan)] hover:underline"
                    >
                      Ver archivo →
                    </a>
                    <form action={reviewKycDocumentForm} className="mt-2 flex flex-wrap gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="documentId" value={doc.id} />
                      <input type="hidden" name="returnTo" value="queue" />
                      <input
                        type="text"
                        name="reviewNote"
                        placeholder="Nota (opcional)"
                        className="min-w-[8rem] flex-1 rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-2 py-1 text-xs text-[var(--ge-text-primary)] outline-none"
                      />
                      <button
                        type="submit"
                        name="decision"
                        value="approved"
                        className="rounded-[var(--ge-radius-sm)] px-2.5 py-1 text-xs font-medium text-[var(--ge-text-inverse)]"
                        style={{ background: "var(--ge-success)" }}
                      >
                        Aprobar
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="rejected"
                        className="rounded-[var(--ge-radius-sm)] px-2.5 py-1 text-xs font-medium text-[var(--ge-text-inverse)]"
                        style={{ background: "var(--ge-error)" }}
                      >
                        Rechazar
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
            No hay usuarios pendientes de revisión KYC.
          </p>
        )}
      </div>
    </div>
  );
}
