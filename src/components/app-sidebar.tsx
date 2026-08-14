"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bell,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  LineChart,
  List,
  CreditCard,
  MessagesSquare,
  Headset,
  Settings,
  IdCard,
  ShieldHalf,
  LogOut,
} from "lucide-react";
import { LogoLink } from "@/components/logo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/app/notifications", label: "Notificaciones", icon: Bell },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { href: "/app/wallets", label: "Wallets", icon: Wallet },
      { href: "/app/swap", label: "Swap", icon: ArrowLeftRight },
      { href: "/app/stake", label: "CDT / Stake", icon: PiggyBank },
      { href: "/app/market", label: "Market", icon: LineChart },
      { href: "/app/transactions", label: "Transacciones", icon: List },
      { href: "/app/payments", label: "Depositar/Retirar", icon: CreditCard },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { href: "/app/chat", label: "Chat en vivo", icon: MessagesSquare },
      { href: "/app/support", label: "Tickets", icon: Headset },
      { href: "/app/settings", label: "Settings", icon: Settings },
      { href: "/app/verification", label: "Verification", icon: IdCard },
    ],
  },
];

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--ge-border)] bg-[var(--ge-bg-secondary)] px-3 py-4">
      <div className="px-2 pb-6">
        <LogoLink href="/app/dashboard" height={34} priority />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
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
        ))}

        {isAdmin && (
          <div>
            <div className="space-y-1">
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-3 rounded-[var(--ge-radius-sm)] px-2.5 py-2 text-sm ${
                  pathname?.startsWith("/admin")
                    ? "bg-[var(--ge-bg-elevated)] text-[var(--ge-cyan)]"
                    : "text-[var(--ge-cyan)] hover:bg-[var(--ge-bg-elevated)]"
                }`}
              >
                <ShieldHalf className="size-4" />
                Admin Panel
              </Link>
            </div>
          </div>
        )}
      </nav>

      <a
        href="/app/logout"
        className="mt-4 flex items-center gap-3 rounded-[var(--ge-radius-sm)] px-2.5 py-2 text-sm text-[var(--ge-text-secondary)] hover:bg-[var(--ge-bg-elevated)] hover:text-[var(--ge-error)]"
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </a>
    </aside>
  );
}
