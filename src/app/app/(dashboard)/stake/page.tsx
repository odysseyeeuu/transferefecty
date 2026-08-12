import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { StakeForm, UnstakeButton } from "./stake-forms";

export const metadata: Metadata = { title: "CDT / Stake" };

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
};

export default async function StakePage() {
  const user = await requireUser();
  const [plans, stakes] = await Promise.all([
    db.stakePlan.findMany({
      where: { isActive: true },
      orderBy: [{ currency: "asc" }, { lockDays: "asc" }],
    }),
    db.userStake.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  if (!user.allowStaking) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-warning)]">
        El CDT / staking está deshabilitado para tu cuenta. Pide permiso a tu
        SuperWorker o SuperAdmin.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">CDT / Stake</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Bloquea saldo por un plazo y recibe rendimiento (APY).
        </p>
      </div>

      <div className="max-w-md">
        <StakeForm
          plans={plans.map((p) => ({
            id: p.id,
            name: p.name,
            currency: p.currency,
            apyPercent: Number(p.apyPercent),
            minAmount: Number(p.minAmount),
            lockDays: p.lockDays,
          }))}
        />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Mis CDT
        </h2>
        <div className="ge-card divide-y divide-[var(--ge-border)]">
          {stakes.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--ge-text-primary)]">
                  {s.plan.name} — {Number(s.amount)} {s.plan.currency}
                </p>
                <p className="text-xs text-[var(--ge-text-muted)]">
                  {STATUS_LABEL[s.status]} · vence{" "}
                  {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(s.endsAt)}
                  {Number(s.rewardsEarned) > 0 &&
                    ` · rendimiento: ${Number(s.rewardsEarned).toFixed(6)} ${s.plan.currency}`}
                </p>
              </div>
              {s.status === "active" && <UnstakeButton stakeId={s.id} />}
            </div>
          ))}
          {stakes.length === 0 && (
            <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">
              Aún no tienes ningún CDT activo.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
