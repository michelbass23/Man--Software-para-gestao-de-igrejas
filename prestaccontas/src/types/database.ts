export type EntryCategory =
  | "dizimo"
  | "oferta"
  | "doacao"
  | "campanha"
  | "evento"
  | "outros_entradas";

export type ExpenseCategory =
  | "aluguel"
  | "energia"
  | "agua"
  | "internet"
  | "manutencao"
  | "salarios"
  | "missoes"
  | "eventos"
  | "material"
  | "transporte"
  | "seguro"
  | "impostos"
  | "outros_despesas";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive" | "trialing";
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  plan: "free" | "pro" | "enterprise";
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  tenant_id: string;
  date: string;
  category: EntryCategory;
  amount: number;
  description?: string;
  person_name?: string;
  receipt_url?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  tenant_id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  person_name?: string;
  receipt_url?: string;
  is_fixed?: boolean;
  due_day?: number;
  next_due_date?: string;
  is_recurring?: boolean;
  status?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  totalEntries: number;
  totalExpenses: number;
  netBalance: number;
  entriesByCategory: { category: string; total: number; count: number }[];
  expensesByCategory: { category: string; total: number; count: number }[];
  monthlyEntries: { month: string; total: number }[];
  monthlyExpenses: { month: string; total: number }[];
  recentEntries: Entry[];
  recentExpenses: Expense[];
}

export const ENTRY_CATEGORY_LABELS: Record<EntryCategory, string> = {
  dizimo: "Dízimo",
  oferta: "Oferta",
  doacao: "Doação",
  campanha: "Campanha",
  evento: "Evento",
  outros_entradas: "Outros",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  aluguel: "Aluguel",
  energia: "Energia",
  agua: "Água",
  internet: "Internet",
  manutencao: "Manutenção",
  salarios: "Salários",
  missoes: "Missões",
  eventos: "Eventos",
  material: "Material",
  transporte: "Transporte",
  seguro: "Seguro",
  impostos: "Impostos",
  outros_despesas: "Outros",
};

export const ENTRY_CATEGORIES: EntryCategory[] = [
  "dizimo",
  "oferta",
  "doacao",
  "campanha",
  "evento",
  "outros_entradas",
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "aluguel",
  "energia",
  "agua",
  "internet",
  "manutencao",
  "salarios",
  "missoes",
  "eventos",
  "material",
  "transporte",
  "seguro",
  "impostos",
  "outros_despesas",
];

// ============================================
// MEMBERS
// ============================================

export type MemberStatus = "ativo" | "inativo" | "visitante";

export type MaritalStatus = "solteiro" | "casado" | "viuvo" | "divorciado" | "outro";

export interface Member {
  id: string;
  tenant_id: string;
  name: string;
  photo_url?: string;
  phone?: string;
  email?: string;
  birth_date?: string;
  baptism_date?: string;
  marital_status?: MaritalStatus;
  ministry?: string;
  status: MemberStatus;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  visitante: "Visitante",
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  viuvo: "Viúvo(a)",
  divorciado: "Divorciado(a)",
  outro: "Outro",
};

export const MEMBER_STATUSES: MemberStatus[] = ["ativo", "inativo", "visitante"];

export const MARITAL_STATUSES: MaritalStatus[] = [
  "solteiro",
  "casado",
  "viuvo",
  "divorciado",
  "outro",
];

export const MINISTRY_OPTIONS: string[] = [
  "Louvor",
  "Infantil",
  "Diaconato",
  "Mídia",
  "Recepção",
  "Ensino",
  "Evangelismo",
  "Outro",
];

// ============================================
// EVENTS (Agenda de Eventos)
// ============================================

export type EventType =
  | "culto"
  | "show"
  | "encontro"
  | "conferencia"
  | "workshop"
  | "retiro"
  | "batismo"
  | "ceia"
  | "culto_jovens"
  | "culto_criancas"
  | "outro";

export interface ChurchEvent {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  event_date: string;
  event_time?: string;
  location?: string;
  banner_url?: string;
  responsible_name?: string;
  status: "ativo" | "cancelado" | "concluido";
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  culto: "Culto",
  show: "Show",
  encontro: "Encontro",
  conferencia: "Conferência",
  workshop: "Workshop",
  retiro: "Retiro",
  batismo: "Batismo",
  ceia: "Ceia",
  culto_jovens: "Culto de Jovens",
  culto_criancas: "Culto de Crianças",
  outro: "Outro",
};

export const EVENT_TYPES: EventType[] = [
  "culto",
  "show",
  "encontro",
  "conferencia",
  "workshop",
  "retiro",
  "batismo",
  "ceia",
  "culto_jovens",
  "culto_criancas",
  "outro",
];

export type EventStatus = "ativo" | "cancelado" | "concluido";

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  ativo: "Ativo",
  cancelado: "Cancelado",
  concluido: "Concluído",
};

export const EVENT_STATUSES: EventStatus[] = ["ativo", "cancelado", "concluido"];
