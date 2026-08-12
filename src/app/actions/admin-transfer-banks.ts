"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/admin-log";
import { TRANSFER_BANK_COUNTRIES } from "@/lib/config/countries";

// Puerto de `AdminController::transferBankSave()/transferBankDelete()`.

export async function saveTransferBank(formData: FormData) {
  const admin = await requireRole(["superadmin"]);
  const id = Number(formData.get("bankId"));
  const country = String(formData.get("country") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!name || !country || !(country in TRANSFER_BANK_COUNTRIES)) {
    redirect("/admin/transfer-banks?error=invalid");
  }

  if (id > 0) {
    await db.transferBank.update({ where: { id }, data: { country, name, isActive } });
    await logAdminAction(admin.id, "transfer_bank_update", "transfer_bank", id);
  } else {
    const created = await db.transferBank.create({ data: { country, name, isActive } });
    await logAdminAction(admin.id, "transfer_bank_create", "transfer_bank", created.id);
  }

  revalidatePath("/admin/transfer-banks");
  redirect("/admin/transfer-banks?saved=1");
}

export async function deleteTransferBank(formData: FormData) {
  const admin = await requireRole(["superadmin"]);
  const id = Number(formData.get("bankId"));
  if (!id) redirect("/admin/transfer-banks?error=invalid");

  await db.transferBank.delete({ where: { id } });
  await logAdminAction(admin.id, "transfer_bank_delete", "transfer_bank", id);

  revalidatePath("/admin/transfer-banks");
  redirect("/admin/transfer-banks?deleted=1");
}
