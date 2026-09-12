"use client";

import { useState, useEffect, useCallback } from "react";
import {
  History,
  Plus,
  Pencil,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  CalendarDays,
  UserCog,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getAuditLogs, type AuditLogEntry } from "./actions";

const FIELD_LABELS: Record<string, string> = {
  name: "Nome",
  phone: "Telefone",
  email: "E-mail",
  birth_date: "Data de nascimento",
  baptism_date: "Data de batismo",
  marital_status: "Estado civil",
  ministry: "Ministério",
  status: "Status",
  notes: "Observações",
  date: "Data",
  category: "Categoria",
  amount: "Valor",
  description: "Descrição",
  person_name: "Nome",
  title: "Título",
  event_type: "Tipo",
  event_date: "Data",
  event_time: "Horário",
  location: "Local",
  responsible_name: "Responsável",
  role: "Papel",
};

const DATE_FIELDS = new Set(["date", "birth_date", "baptism_date", "event_date"]);
const CURRENCY_FIELDS = new Set(["amount"]);

function formatFieldValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "vazio";
  if (CURRENCY_FIELDS.has(field) && typeof value === "number") return formatCurrency(value);
  if (DATE_FIELDS.has(field) && typeof value === "string") {
    try {
      return formatDate(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

const ENTITY_LABELS: Record<string, string> = {
  entry: "Entrada",
  expense: "Despesa",
  member: "Membro",
  event: "Evento",
  team_member: "Usuário da equipe",
};

const ENTITY_ICONS: Record<string, typeof ArrowDownLeft> = {
  entry: ArrowDownLeft,
  expense: ArrowUpRight,
  member: Users,
  event: CalendarDays,
  team_member: UserCog,
};

const ACTION_LABELS: Record<string, string> = {
  create: "Criou",
  update: "Editou",
  delete: "Apagou",
};

const ACTION_STYLES: Record<string, string> = {
  create: "bg-emerald-dim text-emerald",
  update: "bg-amber-dim text-amber",
  delete: "bg-ruby-dim text-ruby",
};

const ACTION_ICONS: Record<string, typeof Plus> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
};

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return `${formatDate(date.toISOString().split("T")[0])} às ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [accessError, setAccessError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 30;

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAuditLogs({
        entityType: entityFilter || undefined,
        action: actionFilter || undefined,
        page,
        limit: ITEMS_PER_PAGE,
      });
      setLogs(result.logs);
      setTotal(result.total);
    } catch (error) {
      setAccessError(
        error instanceof Error ? error.message : "Erro ao carregar auditoria"
      );
    }
    setIsLoading(false);
  }, [entityFilter, actionFilter, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (accessError) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-ruby text-sm">{accessError}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-strong tracking-tight flex items-center gap-2 md:gap-3">
            <History className="w-5 h-5 md:w-6 md:h-6 text-gold" />
            Auditoria
          </h1>
          <p className="text-subtle text-xs md:text-sm mt-1">
            Histórico de criações, edições e exclusões feitas pela equipe
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card p-4 md:p-6 mb-6 opacity-0 animate-fade-in stagger-1">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-muted text-sm mb-2">Tipo de registro</label>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full"
            >
              <option value="">Todos</option>
              <option value="entry">Entradas</option>
              <option value="expense">Despesas</option>
              <option value="member">Membros</option>
              <option value="event">Eventos</option>
              <option value="team_member">Equipe</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-muted text-sm mb-2">Ação</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full"
            >
              <option value="">Todas</option>
              <option value="create">Criações</option>
              <option value="update">Edições</option>
              <option value="delete">Exclusões</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="glass-card overflow-hidden opacity-0 animate-fade-in stagger-2">
        {isLoading ? (
          <div className="p-8 text-center text-subtle text-sm">Carregando...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-subtle text-sm">
            Nenhum registro de auditoria encontrado
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => {
              const EntityIcon = ENTITY_ICONS[log.entity_type] || History;
              const ActionIcon = ACTION_ICONS[log.action] || History;
              return (
                <div
                  key={log.id}
                  className="p-4 flex items-start gap-3 hover:bg-hover transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-surface-hover flex items-center justify-center flex-shrink-0">
                    <EntityIcon className="w-4 h-4 text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-strong">
                      <span className="font-medium">{log.user_name || "Usuário"}</span>{" "}
                      <span
                        className={
                          log.action === "delete" ? "text-ruby" : "text-muted"
                        }
                      >
                        {(ACTION_LABELS[log.action] || log.action).toLowerCase()}
                      </span>{" "}
                      {ENTITY_LABELS[log.entity_type] || log.entity_type}
                      {log.entity_label && (
                        <span className="text-subtle"> — {log.entity_label}</span>
                      )}
                    </p>
                    {log.action === "update" &&
                      !!(log.metadata?.changes as Record<string, { from: unknown; to: unknown }>) && (
                        <div className="mt-1.5 space-y-0.5">
                          {Object.entries(
                            log.metadata!.changes as Record<
                              string,
                              { from: unknown; to: unknown }
                            >
                          ).map(([field, { from, to }]) => (
                            <p key={field} className="text-xs text-subtle">
                              <span className="text-muted">
                                {FIELD_LABELS[field] || field}:
                              </span>{" "}
                              {formatFieldValue(field, from)}{" "}
                              <span className="text-faint">→</span>{" "}
                              <span className="text-strong">
                                {formatFieldValue(field, to)}
                              </span>
                            </p>
                          ))}
                        </div>
                      )}
                    <p className="text-faint text-xs mt-1">
                      {formatDateTime(log.created_at)}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${
                      ACTION_STYLES[log.action] || "bg-surface-hover text-muted"
                    }`}
                  >
                    <ActionIcon className="w-3 h-3" />
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-border text-muted text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-subtle text-sm">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-border text-muted text-sm disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
