"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/admin-log";

// Puerto de `AdminController::officeSave()/officeDelete()`.

export async function saveOffice(formData: FormData) {
  const admin = await requireRole(["superadmin"]);
  const id = Number(formData.get("officeId"));
  const name = String(formData.get("name") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  if (!name) redirect("/admin/offices?error=invalid");

  if (id > 0) {
    await db.office.update({ where: { id }, data: { name, isActive } });
    await logAdminAction(admin.id, "office_update", "office", id);
  } else {
    const created = await db.office.create({ data: { name, isActive } });
    await logAdminAction(admin.id, "office_create", "office", created.id);
  }

  revalidatePath("/admin/offices");
  redirect("/admin/offices?saved=1");
}

export async function deleteOffice(formData: FormData) {
  const admin = await requireRole(["superadmin"]);
  const id = Number(formData.get("officeId"));
  if (!id) redirect("/admin/offices?error=invalid");

  const clientsCount = await db.user.count({ where: { officeId: id } });
  if (clientsCount > 0) {
    const reassignTo = await db.office.findFirst({
      where: { id: { not: id }, isActive: true },
      orderBy: { id: "asc" },
      select: { id: true },
    });
    if (!reassignTo) redirect("/admin/offices?error=has_clients");
    await db.user.updateMany({ where: { officeId: id }, data: { officeId: reassignTo.id } });
    await logAdminAction(admin.id, "office_reassign_clients", "office", id);
  }

  await db.office.delete({ where: { id } });
  await logAdminAction(admin.id, "office_delete", "office", id);

  revalidatePath("/admin/offices");
  redirect("/admin/offices?deleted=1");
}
