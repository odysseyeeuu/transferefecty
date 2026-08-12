"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth/dal";
import { adjustBalance, ensureWallet, getBalance, recordTransaction } from "@/lib/wallet";
import { notifyUser } from "@/lib/notifications";
import { logAdminAction } from "@/lib/admin-log";

// Puerto de `AppController::stakeExecute()/stakeUnstake()`.

export type StakeState = { message?: string } | undefined;

export async function executeStake(
  _prevState: StakeState,
  formData: FormData
): Promise<StakeState> {
  const user = await requireUser();
  if (!user.allowStaking) {
    return { message: "El CDT / staking está deshabilitado para tu cuenta." };
  }

  const planId = Number(formData.get("planId"));
  const amount = Number(formData.get("amount"));

  const plan = await db.stakePlan.findFirst({ where: { id: planId, isActive: true } });
  if (!plan || amount <= 0 || amount < Number(plan.minAmount)) {
    return { message: "Monto inválido o inferior al mínimo del plan." };
  }

  const currency = plan.currency;
  const lockDays = Math.max(0, plan.lockDays);
  const apy = Number(plan.apyPercent);

  const available = await getBalance(user.id, currency);
  if (available + 1e-12 < amount) {
    return {
      message:
        "Saldo insuficiente en esa criptomoneda. Usa el saldo disponible de la misma moneda del plan.",
    };
  }

  const maturityReward = lockDays > 0 ? amount * (apy / 100) * (lockDays / 365) : 0;
  const endsAt = new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000);

  try {
    await db.$transaction(async (tx) => {
      await ensureWallet(tx, user.id, currency);
      const ok = await adjustBalance(tx, user.id, currency, -amount);
      if (!ok) throw new Error("balance");

      await tx.userStake.create({
        data: { userId: user.id, planId, amount, endsAt },
      });

      await recordTransaction(tx, {
        userId: user.id,
        type: "stake",
        currency,
        amount,
        status: "completed",
        description: `CDT ${plan.name}${lockDays > 0 ? ` (${lockDays} días)` : " flexible"}`,
      });
    });
  } catch {
    return { message: "No se pudo completar la operación." };
  }

  const note =
    lockDays > 0
      ? `Bloqueaste ${amount} ${currency} por ${lockDays} días al ${apy}% APY. Rendimiento estimado al vencimiento: ${maturityReward.toFixed(6)} ${currency}.`
      : `Bloqueaste ${amount} ${currency} en plan flexible al ${apy}% APY. Puedes retirar cuando quieras con rendimiento proporcional.`;
  await notifyUser(user.id, "CDT cripto creado", note, "success");

  revalidatePath("/app/stake");
  revalidatePath("/app/dashboard");
  redirect("/app/stake?success=1");
}

export async function unstake(_prevState: StakeState, formData: FormData): Promise<StakeState> {
  const user = await requireUser();
  if (!user.allowStaking) {
    return { message: "El CDT / staking está deshabilitado para tu cuenta." };
  }

  const stakeId = Number(formData.get("stakeId"));
  const stake = await db.userStake.findFirst({
    where: { id: stakeId, userId: user.id, status: "active" },
    include: { plan: true },
  });
  if (!stake) return { message: "CDT no encontrado." };

  const lockDays = stake.plan.lockDays;
  if (lockDays > 0 && stake.endsAt.getTime() > Date.now()) {
    return { message: "Aún no vence el plazo. Tus criptos siguen bloqueadas como un CDT." };
  }

  const daysStaked = Math.max(
    1,
    Math.floor((Date.now() - stake.startedAt.getTime()) / (24 * 60 * 60 * 1000))
  );
  const effectiveDays = lockDays > 0 ? Math.min(daysStaked, lockDays) : daysStaked;
  const principal = Number(stake.amount);
  const apy = Number(stake.plan.apyPercent);
  const rewards = principal * (apy / 100) * (effectiveDays / 365);
  const total = principal + rewards;
  const currency = stake.plan.currency;

  try {
    await db.$transaction(async (tx) => {
      await ensureWallet(tx, user.id, currency);
      const ok = await adjustBalance(tx, user.id, currency, total);
      if (!ok) throw new Error("credit");

      await tx.userStake.update({
        where: { id: stakeId },
        data: { status: "completed", rewardsEarned: rewards },
      });

      await recordTransaction(tx, {
        userId: user.id,
        type: "unstake",
        currency,
        amount: total,
        status: "completed",
        description: `Retiro CDT ${stake.plan.name} (+${rewards.toFixed(6)} rendimiento)`,
      });

      if (rewards > 0) {
        await recordTransaction(tx, {
          userId: user.id,
          type: "reward",
          currency,
          amount: rewards,
          status: "completed",
          description: `Rendimiento CDT: ${stake.plan.name}`,
        });
      }
    });
  } catch {
    return { message: "No se pudo completar la operación." };
  }

  await notifyUser(
    user.id,
    "CDT liquidado",
    `Se acreditaron ${total} ${currency} (capital + rendimiento de ${rewards.toFixed(6)}).`,
    "success"
  );

  revalidatePath("/app/stake");
  revalidatePath("/app/dashboard");
  redirect("/app/stake?unstaked=1");
}

// -----------------------------------------------------------------------
// Admin: gestión de planes CDT (sólo SuperAdmin)
// -----------------------------------------------------------------------

export async function createStakePlan(formData: FormData) {
  const admin = await requireRole(["superadmin"]);

  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").toUpperCase();
  const apyPercent = Number(formData.get("apyPercent"));
  const minAmount = Number(formData.get("minAmount"));
  const lockDays = Number(formData.get("lockDays"));

  if (!name || !currency || !(apyPercent > 0) || minAmount < 0 || lockDays < 0) return;

  const plan = await db.stakePlan.create({
    data: { name, currency, apyPercent, minAmount, lockDays },
  });
  await logAdminAction(admin.id, "stake_plan_create", "stake_plan", plan.id);
  revalidatePath("/admin/stake-plans");
}

export async function toggleStakePlan(formData: FormData) {
  const admin = await requireRole(["superadmin"]);
  const id = Number(formData.get("planId"));
  const plan = await db.stakePlan.findUnique({ where: { id } });
  if (!plan) return;

  await db.stakePlan.update({ where: { id }, data: { isActive: !plan.isActive } });
  await logAdminAction(admin.id, plan.isActive ? "stake_plan_disable" : "stake_plan_enable", "stake_plan", id);
  revalidatePath("/admin/stake-plans");
}
