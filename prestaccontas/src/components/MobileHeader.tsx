"use client";

import { usePathname } from "next/navigation";
import { Menu, Church } from "lucide-react";

interface MobileHeaderProps {
  onMenuClick: () => void;
  tenantName?: string;
}

const pageTitle: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/members": "Membros",
  "/dashboard/events": "Eventos",
  "/dashboard/entries": "Entradas",
  "/dashboard/expenses": "Despesas",
  "/dashboard/fixed-expenses": "Despesas Fixas",
  "/dashboard/reports": "Relatórios",
  "/dashboard/team": "Equipe",
  "/dashboard/settings": "Configurações",
};

export default function MobileHeader({
  onMenuClick,
  tenantName = "Igreja",
}: MobileHeaderProps) {
  const pathname = usePathname();
  const title = pageTitle[pathname] || "PrestaContas";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-surface/95 backdrop-blur-xl border-b border-border lg:hidden">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors active:scale-95"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gold-dim flex items-center justify-center">
          <Church className="w-4 h-4 text-gold" />
        </div>
        <h1 className="text-base font-semibold text-zinc-100">{title}</h1>
      </div>

      {/* Espaçador para centralizar o título */}
      <div className="w-10" />
    </header>
  );
}
