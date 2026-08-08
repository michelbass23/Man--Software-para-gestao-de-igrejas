"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  CalendarClock,
  CalendarDays,
  FileText,
  LogOut,
  Church,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/login/actions";
import AlertsDropdown from "@/components/AlertsDropdown";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Membros",
    href: "/dashboard/members",
    icon: Users,
  },
  {
    label: "Eventos",
    href: "/dashboard/events",
    icon: CalendarDays,
  },
  {
    label: "Entradas",
    href: "/dashboard/entries",
    icon: ArrowDownLeft,
  },
  {
    label: "Despesas",
    href: "/dashboard/expenses",
    icon: ArrowUpRight,
  },
  {
    label: "Despesas Fixas",
    href: "/dashboard/fixed-expenses",
    icon: CalendarClock,
  },
  {
    label: "Relatórios",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    label: "Equipe",
    href: "/dashboard/team",
    icon: Users,
    adminOnly: true,
  },
  {
    label: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
    adminOnly: true,
  },
];

interface SidebarProps {
  tenantName?: string;
  tenantLogoUrl?: string | null;
  userName?: string;
  userRole?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  tenantName = "Igreja",
  tenantLogoUrl,
  userName = "Usuário",
  userRole = "admin",
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "admin";

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  // Fechar sidebar ao mudar de rota
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Bloquear scroll do body quando sidebar está aberta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay - aparece atrás do sidebar no mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 flex flex-col bg-surface z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Header com logo e botão fechar */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            {tenantLogoUrl ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={tenantLogoUrl}
                  alt={tenantName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gold-dim flex items-center justify-center flex-shrink-0">
                <Church className="w-5 h-5 text-gold" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-100 truncate">
                {tenantName}
              </p>
              <p className="text-xs text-zinc-500 capitalize">{userRole}</p>
            </div>
          </div>

          {/* Botão fechar - apenas mobile */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/[0.08] text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-gold" : "text-zinc-500"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé com alertas e usuário */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertsDropdown />
          </div>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/50">
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-zinc-300">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {userName}
              </p>
              <p className="text-xs text-zinc-500 capitalize">{userRole}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
