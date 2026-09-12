"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/components/ThemeProvider";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "Sistema", icon: Monitor },
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
];

interface ThemeToggleProps {
  variant?: "inline" | "segmented";
  className?: string;
}

export default function ThemeToggle({
  variant = "inline",
  className,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex rounded-xl border border-border bg-surface p-1",
          className
        )}
        role="radiogroup"
        aria-label="Tema da interface"
      >
        {OPTIONS.map((opt) => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-active text-strong"
                  : "text-muted hover:text-strong hover:bg-hover"
              )}
            >
              <opt.icon className="w-4 h-4" />
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  // variant "inline": alterna direto entre claro e escuro (com base no tema
  // já resolvido, não no valor salvo) — "Sistema" só existe no seletor
  // "segmented" das Configurações. Um clique sempre troca pro oposto do que
  // está na tela; antes o botão passava por "Sistema" no meio do ciclo,
  // exigindo 2 cliques pra voltar ao estado anterior.
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Escuro" : "Claro";
  const CurrentIcon = isDark ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "p-2 rounded-lg text-subtle hover:text-strong hover:bg-hover transition-colors",
        className
      )}
      title={`Tema: ${label} (clique para alternar)`}
      aria-label={`Tema atual: ${label}. Clique para alternar.`}
    >
      <CurrentIcon className="w-4 h-4" />
    </button>
  );
}
