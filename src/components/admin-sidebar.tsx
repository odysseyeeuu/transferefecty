"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  Wallet,
  CreditCard,
  IdCard,
  ArrowLeftRight,
  PiggyBank,
  Landmark,
  MessagesSquare,
  Headset,
  Bell,
  ScrollText,
  Settings,
  Database,
  ArrowLeft,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Panel",
    items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operación",
    items: [
      { href: "/admin/payments", label: "Depósitos / Retiros", icon: CreditCard },
      { href: "/admin/kyc", label: "Revisión KYC", icon: IdCard },
      { href: "/admin/credit", label: "Crédito / débito", icon: Wallet },
      { href: "/admin/swaps", label: "Swaps", icon: ArrowLeftRight },
      { href: "/admin/stake-plans", label: "Planes CDT", icon: PiggyBank },
    ],
  },
  {
    label: "Usuarios",
    items: [
      { href: "/admin/users", label: "Usuarios", icon: Users },
      { href: "/admin/my-users", label: "Mis usuarios", icon: Users },
      { href: "/admin/workers", label: "Workers", icon: UserCog },
      { href: "/admin/admins", label: "Administradores", icon: UserCog, superAdminOnly: true },
      { href: "/admin/offices", label: "Oficinas", icon: Building2, superAdminOnly: true },
      {
        href: "/admin/deposit-wallets",
        label: "Wallets de depósito",
        icon: Landmark,
        superAdminOnly: true,
      },
      {
        href: "/admin/transfer-banks",
        label: "Bancos de transferencia",
        icon: Landmark,
        superAdminOnly: true,
      },
    ],
  },
  {
    label: "Soporte",
    items: [
      { href: "/admin/tickets", label: "Tickets", icon: Headset },
      { href: "/admin/chats", label: "Chats en vivo", icon: MessagesSquare },
      { href: "/admin/notifications", label: "Notificaciones", icon: Bell },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/actions", label: "Registro de acciones", icon: ScrollText, superAdminOnly: true },
      { href: "/admin/general", label: "Config. general", icon: Settings, superAdminOnly: true },
      { href: "/admin/database", label: "Base de datos", icon: Database, superAdminOnly: true },
    ],
  },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const isSuperAdmin = role === "superadmin";

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--ge-border)] bg-[var(--ge-bg-secondary)] px-3 py-4">
      <Link
        href="/admin/dashboard"
        data-text="Transfer Efecty · Admin"
        className="ge-glitch ge-gradient-text px-2 pb-6 text-lg font-bold"
      >
        Transfer Efecty · Admin
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => !item.superAdminOnly || isSuperAdmin);
          if (items.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
                {group.label}
              </p>
              <div className="space-y-1">
                {items.map((item) => {
                  const active = pathname?.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-[var(--ge-radius-sm)] px-2.5 py-2 text-sm transition-colors ${
                        active
                          ? "bg-[var(--ge-bg-elevated)] text-[var(--ge-text-primary)]"
                          : "text-[var(--ge-text-secondary)] hover:bg-[var(--ge-bg-elevated)] hover:text-[var(--ge-text-primary)]"
                      }`}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <Link
        href="/app/dashboard"
        className="mt-4 flex items-center gap-3 rounded-[var(--ge-radius-sm)] px-2.5 py-2 text-sm text-[var(--ge-text-secondary)] hover:bg-[var(--ge-bg-elevated)] hover:text-[var(--ge-text-primary)]"
      >
        <ArrowLeft className="size-4" />
        Volver a la app
      </Link>
    </aside>
  );
}
