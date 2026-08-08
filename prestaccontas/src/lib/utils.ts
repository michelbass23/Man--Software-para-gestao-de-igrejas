import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: string | Date): string {
  // Corrigir bug de fuso horário para strings de data (YYYY-MM-DD)
  const d = typeof date === "string" && date.length === 10 && !date.includes("T")
    ? new Date(date + "T12:00:00")
    : new Date(date);
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(date: string | Date): string {
  // Corrigir bug de fuso horário para strings de data (YYYY-MM-DD)
  const d = typeof date === "string" && date.length === 10 && !date.includes("T")
    ? new Date(date + "T12:00:00")
    : new Date(date);
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

export function getMonthName(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(
    new Date(date)
  );
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}
