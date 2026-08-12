"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/admin-log";
import { officeScopeId } from "@/lib/office-scope";
import { WITHDRAW_CURRENCIES, isValidPaymentNetwork } from "@/lib/config/currencies";

// Puerto de `AdminController::depositWalletSave()/depositWalletDelete()`.
// Sólo SuperWorker administra las wallets de SU oficina (igual que la v1).

export async function saveDepositWallet(formData: FormData) {
  const admin = await requireRole(["superworker"]);
  const officeId = officeScopeId(admin);
  if (officeId <= 0) redirect("/admin/deposit-wallets?error=forbidden");

  const id = Number(formData.get("walletId"));
  const currency = String(formData.get("currency") ?? "").toUpperCase();
  const network = String(formData.get("network") ?? "").toUpperCase();
  const address = String(formData.get("address") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!address || !WITHDRAW_CURRENCIES.includes(currency)) {
    redirect("/admin/deposit-wallets?error=invalid");
  }
  if (!isValidPaymentNetwork(currency, network)) {
    redirect("/admin/deposit-wallets?error=network");
  }

  if (id > 0) {
    const own = await db.officeDepositWallet.findFirst({ where: { id, officeId } });
    if (!own) redirect("/admin/deposit-wallets?error=not_found");
    await db.officeDepositWallet.update({
      where: { id },
      data: { currency, network, address, label: label || null, isActive },
    });
    await logAdminAction(admin.id, "deposit_wallet_update", "office_deposit_wallet", id);
  } else {
    const created = await db.officeDepositWallet.create({
      data: { officeId, currency, network, address, label: label || null, isActive },
    });
    await logAdminAction(admin.id, "deposit_wallet_create", "office_deposit_wallet", created.id);
  }

  revalidatePath("/admin/deposit-wallets");
  redirect("/admin/deposit-wallets?saved=1");
}

export async function deleteDepositWallet(formData: FormData) {
  const admin = await requireRole(["superworker"]);
  const officeId = officeScopeId(admin);
  if (officeId <= 0) redirect("/admin/deposit-wallets?error=forbidden");

  const id = Number(formData.get("walletId"));
  if (!id) redirect("/admin/deposit-wallets?error=invalid");

  await db.officeDepositWallet.deleteMany({ where: { id, officeId } });
  await logAdminAction(admin.id, "deposit_wallet_delete", "office_deposit_wallet", id);

  revalidatePath("/admin/deposit-wallets");
  redirect("/admin/deposit-wallets?deleted=1");
}
