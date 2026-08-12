"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { adjustBalance, ensureWallet, recordTransaction } from "@/lib/wallet";
import { notifyUser } from "@/lib/notifications";
import { logAdminAction } from "@/lib/admin-log";
import { canAccessOffice } from "@/lib/office-scope";
import { CRYPTO_CURRENCIES, isValidPaymentNetwork } from "@/lib/config/currencies";

// Puerto de `AdminController::credit()` / `applyFundsToUser()`.

export type CreditState = { error?: string; success?: string } | undefined;

function staffCanManageFunds(
  staff: { role: string; officeId: number | null },
  target: { role: string; officeId: number | null }
): boolean {
  if (["superadmin", "superworker"].includes(target.role)) return staff.role === "superadmin";
  if (staff.role === "superadmin") return true;
  if (staff.role === "superworker") {
    return target.role === "user" && canAccessOffice(staff, target.officeId);
  }
  return false;
}

export async function creditOrDebitFunds(
  _prevState: CreditState,
  formData: FormData
): Promise<CreditState> {
  const admin = await requireRole(["superadmin", "superworker"]);
  const identifier = String(formData.get("user") ?? "").trim().toLowerCase();
  const currency = String(formData.get("currency") ?? "USDT").toUpperCase();
  const network = String(formData.get("network") ?? "").toUpperCase();
  const amount = Number(formData.get("amount"));
  const operation = String(formData.get("operation") ?? "credit");
  const note = String(formData.get("note") ?? "").trim();

  const target = await db.user.findFirst({
    where: /^\d+$/.test(identifier) ? { id: Number(identifier) } : { email: identifier },
    select: { id: true, fullName: true, email: true, role: true, officeId: true },
  });

  if (!target) return { error: "Usuario no encontrado (busca por ID o email)." };
  if (!staffCanManageFunds(admin, target)) {
    return { error: "No tienes permiso para modificar el saldo de este usuario." };
  }
  if (!CRYPTO_CURRENCIES.some((c) => c.code === currency)) {
    return { error: "La moneda seleccionada no está disponible." };
  }
  if (!isValidPaymentNetwork(currency, network)) {
    return { error: "La red seleccionada no es válida para la moneda." };
  }
  if (!(amount > 0)) return { error: "El monto debe ser mayor a cero." };

  const isCredit = operation !== "debit";
  const type = isCredit ? "deposit" : "withdrawal";
  const description = `${note || (isCredit ? "Crédito manual de admin" : "Débito manual de admin")} [red: ${network}]`;

  try {
    await db.$transaction(async (tx) => {
      await ensureWallet(tx, target.id, currency);
      const ok = await adjustBalance(tx, target.id, currency, isCredit ? amount : -amount);
      if (!ok) throw new Error("insufficient_balance");
      await recordTransaction(tx, {
        userId: target.id,
        type,
        currency,
        amount,
        status: "completed",
        description,
        adminId: admin.id,
      });
    });
  } catch {
    return { error: "Saldo insuficiente para debitar." };
  }

  await notifyUser(
    target.id,
    isCredit ? "Fondos acreditados" : "Débito en tu cuenta",
    `${isCredit ? "+" : "-"}${amount.toFixed(8)} ${currency} — ${description}`,
    isCredit ? "success" : "warning"
  );
  await logAdminAction(admin.id, isCredit ? "credit_funds" : "debit_funds", "user", target.id);

  revalidatePath("/admin/credit");
  return {
    success: `${isCredit ? "Crédito" : "Débito"} aplicado a ${target.fullName} (${target.email}).`,
  };
}
