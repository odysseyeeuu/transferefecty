"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth/dal";
import { saveUploadedFile } from "@/lib/storage";
import { notifyUser } from "@/lib/notifications";
import { logAdminAction } from "@/lib/admin-log";
import { officeScopeId } from "@/lib/office-scope";
import { KYC_DOCUMENT_TYPES, type KycDocumentTypeValue } from "@/lib/kyc";

/**
 * Puerto de `AppController::verification()/verificationSubmit()` y
 * `AdminController::reviewKycDocument()/updateKyc()`.
 */

export type KycSubmitState = { message?: string } | undefined;

export async function submitKycDocuments(
  _prevState: KycSubmitState,
  formData: FormData
): Promise<KycSubmitState> {
  const user = await requireUser();

  if (!["none", "rejected"].includes(user.kycStatus)) {
    redirect("/app/verification");
  }

  const files: Record<KycDocumentTypeValue, File | null> = {
    id_front: null,
    id_back: null,
    proof_of_address: null,
    id_selfie: null,
  };

  for (const type of KYC_DOCUMENT_TYPES) {
    const file = formData.get(type);
    if (!(file instanceof File) || file.size === 0) {
      return { message: "Debes adjuntar los 4 documentos requeridos." };
    }
    files[type] = file;
  }

  const stored: Array<{ type: KycDocumentTypeValue; path: string }> = [];
  for (const type of KYC_DOCUMENT_TYPES) {
    const result = await saveUploadedFile(files[type]!, "kyc");
    if (!result) {
      return {
        message: `No se pudo subir "${type}". Verifica que sea JPG/PNG/WEBP/PDF y pese menos de 10MB.`,
      };
    }
    stored.push({ type, path: result.path });
  }

  if (user.kycStatus === "rejected") {
    await db.kycDocument.deleteMany({ where: { userId: user.id } });
  }

  await db.$transaction([
    db.kycDocument.createMany({
      data: stored.map((s) => ({
        userId: user.id,
        documentType: s.type,
        filePath: s.path,
        status: "pending",
      })),
    }),
    db.user.update({ where: { id: user.id }, data: { kycStatus: "pending" } }),
  ]);

  revalidatePath("/app/verification");
  redirect("/app/verification?submitted=1");
}

/** Recalcula `users.kyc_status` a partir del estado de sus documentos. Puerto de `syncUserKycStatus`. */
async function syncUserKycStatus(userId: number, adminActorId?: number) {
  const docs = await db.kycDocument.findMany({
    where: { userId },
    select: { status: true },
  });

  const previous = await db.user.findUnique({ where: { id: userId }, select: { kycStatus: true } });

  let nextStatus: "none" | "pending" | "approved" | "rejected" = "none";
  if (docs.length === 0) {
    nextStatus = "none";
  } else if (docs.some((d) => d.status === "rejected")) {
    nextStatus = "rejected";
  } else if (docs.length >= KYC_DOCUMENT_TYPES.length && docs.every((d) => d.status === "approved")) {
    nextStatus = "approved";
  } else {
    nextStatus = "pending";
  }

  await db.user.update({ where: { id: userId }, data: { kycStatus: nextStatus } });

  if (previous?.kycStatus !== nextStatus) {
    if (nextStatus === "approved") {
      await notifyUser(
        userId,
        "Verificación aprobada",
        "Tu identidad ha sido verificada. Ya puedes usar todos los servicios de Transfer Efecty.",
        "success"
      );
    } else if (nextStatus === "rejected") {
      await notifyUser(
        userId,
        "Verificación rechazada",
        "Uno o más documentos fueron rechazados. Sube nuevamente la documentación en Verificación KYC.",
        "warning"
      );
    }
  }
  void adminActorId;
}

export type ReviewKycState = { message?: string } | undefined;

export async function reviewKycDocument(
  _prevState: ReviewKycState,
  formData: FormData
): Promise<ReviewKycState> {
  const admin = await requireRole(["superadmin", "superworker"]);

  const userId = Number(formData.get("userId"));
  const returnTo = String(formData.get("returnTo") ?? "");
  const basePath = returnTo === "queue" ? "/admin/kyc" : `/admin/user/${userId}`;

  const target = await db.user.findUnique({ where: { id: userId }, select: { officeId: true } });
  if (!target) redirect("/admin/users?error=forbidden");

  const scope = officeScopeId(admin);
  if (admin.role === "superworker" && (scope <= 0 || target.officeId !== scope)) {
    redirect("/admin/users?error=forbidden");
  }

  const bulk = formData.get("bulk");
  if (bulk === "approve_all") {
    await db.kycDocument.updateMany({
      where: { userId, status: "pending" },
      data: { status: "approved", reviewedBy: admin.id },
    });
    await syncUserKycStatus(userId);
    await logAdminAction(admin.id, "kyc_approve_all", "user", userId);
    revalidatePath(basePath);
    redirect(`${basePath}?${returnTo === "queue" ? "bulk=1" : "kyc=1"}`);
  }

  const docId = Number(formData.get("documentId"));
  const decision = String(formData.get("decision") ?? "");
  if (!docId || !["approved", "rejected", "pending"].includes(decision)) {
    return { message: "Solicitud inválida." };
  }

  const doc = await db.kycDocument.findFirst({ where: { id: docId, userId } });
  if (!doc) return { message: "Documento no encontrado." };

  const note = String(formData.get("reviewNote") ?? "").trim();
  const noteToSave = note !== "" ? note : decision === "pending" ? null : doc.reviewNote;

  await db.kycDocument.update({
    where: { id: docId },
    data: {
      status: decision as "approved" | "rejected" | "pending",
      reviewedBy: admin.id,
      reviewNote: noteToSave,
    },
  });

  await syncUserKycStatus(userId);

  const action =
    doc.status === decision ? `kyc_doc_${decision}` : `kyc_doc_${doc.status}_to_${decision}`;
  await logAdminAction(admin.id, action, "kyc_document", docId);

  revalidatePath(basePath);
  redirect(`${basePath}?${doc.status === decision ? "doc=1" : "doc=changed"}`);
}

/** Wrapper para usar directamente como `action` de un `<form>` sin `useActionState`. */
export async function reviewKycDocumentForm(formData: FormData) {
  await reviewKycDocument(undefined, formData);
}
