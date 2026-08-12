import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { getSettings } from "@/lib/settings";
import { updateGeneralSettings } from "@/app/actions/admin-settings";

export const metadata: Metadata = { title: "Admin · Configuración general" };

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none";

export default async function AdminGeneralPage() {
  await requireRole(["superadmin"]);
  const settings = await getSettings({
    site_name: "Transfer Efecty",
    support_email: "support@globalefecty.com",
    swap_fee_percent: "0.1",
    announcement: "",
    maintenance_mode: "0",
    min_deposit_usd: "10",
    min_withdrawal_usd: "20",
  });

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Configuración general</h1>

      <form action={updateGeneralSettings} className="ge-card flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[var(--ge-text-secondary)]">Nombre del sitio</label>
          <input name="site_name" defaultValue={settings.site_name} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[var(--ge-text-secondary)]">Correo de soporte</label>
          <input name="support_email" defaultValue={settings.support_email} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[var(--ge-text-secondary)]">Comisión de swap (%)</label>
          <input name="swap_fee_percent" defaultValue={settings.swap_fee_percent} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[var(--ge-text-secondary)]">Depósito mínimo (USD)</label>
          <input name="min_deposit_usd" defaultValue={settings.min_deposit_usd} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[var(--ge-text-secondary)]">Retiro mínimo (USD)</label>
          <input name="min_withdrawal_usd" defaultValue={settings.min_withdrawal_usd} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[var(--ge-text-secondary)]">Anuncio (banner en Settings)</label>
          <textarea name="announcement" defaultValue={settings.announcement} rows={2} className={fieldClass} />
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--ge-text-secondary)]">
          <input type="checkbox" name="maintenance_mode" value="1" defaultChecked={settings.maintenance_mode === "1"} />
          Modo mantenimiento
        </label>

        <button
          type="submit"
          className="self-start rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
          style={{ background: "var(--ge-gradient-brand)" }}
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
