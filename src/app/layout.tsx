import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Transfer Efecty — Billetera crypto global",
    template: "%s · Transfer Efecty",
  },
  description:
    "Transfer Efecty — depósitos, retiros, swap y CDT/staking en una sola billetera.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
