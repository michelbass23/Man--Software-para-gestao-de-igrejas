"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  CalendarDays,
  Pencil,
  Trash2,
  MessageCircle,
  MapPin,
  Clock,
  User,
  Calendar,
  X,
  QrCode,
} from "lucide-react";
import Image from "next/image";
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPES,
  EVENT_STATUS_LABELS,
  EVENT_STATUSES,
  type ChurchEvent,
  type EventType,
} from "@/types/database";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./actions";
import EventModal from "@/components/EventModal";
import WhatsAppSendModal from "@/components/WhatsAppSendModal";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export default function EventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [qrEvent, setQrEvent] = useState<ChurchEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [whatsappEvent, setWhatsappEvent] = useState<ChurchEvent | null>(null);

  const ITEMS_PER_PAGE = 12;

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    const result = await getEvents({
      search: searchQuery || undefined,
      eventType: typeFilter || undefined,
      status: statusFilter || undefined,
      page,
      limit: ITEMS_PER_PAGE,
    });
    setEvents(result.events);
    setTotal(result.total);
    setIsLoading(false);
  }, [searchQuery, typeFilter, statusFilter, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleCreate = () => {
    setEditingEvent(null);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: ChurchEvent) => {
    setEditingEvent(event);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    const result = await deleteEvent(id);
    if (!result.error) {
      fetchEvents();
    } else {
      alert(result.error);
    }
  };

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    eventType: string;
    eventDate: string;
    eventTime?: string;
    location?: string;
    bannerUrl?: string;
    responsibleName?: string;
    status?: string;
  }) => {
    setIsSaving(true);
    setSaveError(null);

    let result;

    if (editingEvent) {
      result = await updateEvent(editingEvent.id, data);
    } else {
      result = await createEvent(data);
    }

    if (result.error) {
      setSaveError(result.error);
      setIsSaving(false);
      return;
    }

    setIsModalOpen(false);
    setEditingEvent(null);
    setIsSaving(false);
    fetchEvents();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    return `${hours}h${minutes}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "cancelado":
        return "bg-ruby-dim text-ruby border-ruby/20";
      case "concluido":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getTypeColor = (type: EventType) => {
    const colors: Record<EventType, string> = {
      culto: "bg-violet-500/10 text-violet-400",
      show: "bg-pink-500/10 text-pink-400",
      encontro: "bg-blue-500/10 text-blue-400",
      conferencia: "bg-amber-500/10 text-amber-400",
      workshop: "bg-cyan-500/10 text-cyan-400",
      retiro: "bg-emerald-500/10 text-emerald-400",
      batismo: "bg-sky-500/10 text-sky-400",
      ceia: "bg-rose-500/10 text-rose-400",
      culto_jovens: "bg-indigo-500/10 text-indigo-400",
      culto_criancas: "bg-orange-500/10 text-orange-400",
      outro: "bg-zinc-500/10 text-zinc-400",
    };
    return colors[type] || colors.outro;
  };

  const upcomingEvents = events.filter(
    (e) => e.status === "ativo" && new Date(e.event_date + "T12:00:00") >= new Date()
  );

  const thisMonthEvents = events.filter((e) => {
    const eventDate = new Date(e.event_date + "T12:00:00");
    const now = new Date();
    return (
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2 md:gap-3">
            <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-violet-400" />
            Agenda de Eventos
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1">
            Gerencie os eventos da igreja
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-500/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Evento
        </button>
      </div>

      {/* Error toast */}
      {saveError && (
        <div className="mb-4 p-3 rounded-xl bg-ruby-dim border border-ruby/20">
          <p className="text-ruby text-sm">{saveError}</p>
        </div>
      )}

      {/* Summary */}
      <div className="glass-card p-4 mb-6 opacity-0 animate-fade-in stagger-1">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-zinc-500 text-xs">Total</p>
            <p className="text-zinc-200 font-mono text-lg font-semibold">
              {total}
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-zinc-500 text-xs">Próximos</p>
            <p className="text-violet-400 font-mono text-lg font-semibold">
              {upcomingEvents.length}
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-zinc-500 text-xs">Este mês</p>
            <p className="text-emerald-400 font-mono text-lg font-semibold">
              {thisMonthEvents.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters - Responsivo */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 opacity-0 animate-fade-in stagger-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, local ou responsável..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:min-w-[160px]"
          >
            <option value="">Todos os tipos</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:min-w-[140px]"
          >
            <option value="">Todos status</option>
            {EVENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {EVENT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="opacity-0 animate-fade-in stagger-3">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-32 bg-zinc-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  <div className="h-3 bg-zinc-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <CalendarDays className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-sm">
              {searchQuery || typeFilter || statusFilter
                ? "Nenhum evento encontrado com os filtros selecionados"
                : "Nenhum evento cadastrado"}
            </p>
            {!searchQuery && !typeFilter && !statusFilter && (
              <button
                onClick={handleCreate}
                className="mt-4 text-violet-400 text-sm hover:text-violet-300 transition-colors"
              >
                Criar primeiro evento
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="glass-card rounded-xl overflow-hidden group hover:border-violet-500/30 transition-colors"
                >
                  {/* Banner */}
                  <div className="relative h-32 bg-zinc-900">
                    {event.banner_url ? (
                      <Image
                        src={event.banner_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CalendarDays className="w-10 h-10 text-zinc-700" />
                      </div>
                    )}
                    {/* Date badge */}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-center min-w-[48px]">
                      <p className="text-white text-xs font-bold leading-none">
                        {formatDate(event.event_date).split(" ")[0]}
                      </p>
                      <p className="text-zinc-300 text-[10px] leading-none mt-0.5">
                        {formatDate(event.event_date).split(" ")[1]}
                      </p>
                    </div>
                    {/* Status badge */}
                    <span
                      className={`absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {EVENT_STATUS_LABELS[event.status as keyof typeof EVENT_STATUS_LABELS]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-zinc-100 font-semibold text-sm line-clamp-1">
                        {event.title}
                      </h3>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${getTypeColor(
                          event.event_type
                        )}`}
                      >
                        {EVENT_TYPE_LABELS[event.event_type]}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-zinc-500 text-xs line-clamp-2 mb-3">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-1.5 mb-3">
                      {event.event_time && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">
                            {formatTime(event.event_time)}
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs truncate">
                            {event.location}
                          </span>
                        </div>
                      )}
                      {event.responsible_name && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <User className="w-3 h-3" />
                          <span className="text-xs truncate">
                            {event.responsible_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-2 border-t border-border">
                      {event.status === "ativo" && (
                        <>
                          <button
                            onClick={() => setQrEvent(event)}
                            className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-gold hover:bg-gold-dim transition-colors"
                            title="Check-in QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span className="text-xs">Check-in</span>
                          </button>
                          <button
                            onClick={() => setWhatsappEvent(event)}
                            className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Enviar via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="text-xs">Enviar</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(event)}
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="text-xs">Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-zinc-500 hover:text-ruby hover:bg-ruby-dim transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-xs">Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-zinc-500 text-sm">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
          setSaveError(null);
        }}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        initialData={editingEvent}
      />

      {/* WhatsApp Modal */}
      <WhatsAppSendModal
        isOpen={!!whatsappEvent}
        event={whatsappEvent}
        onClose={() => setWhatsappEvent(null)}
      />

      {/* QR Code Modal */}
      {qrEvent && (
        <QRCodeDisplay
          eventId={qrEvent.id}
          eventName={qrEvent.title}
          onClose={() => setQrEvent(null)}
        />
      )}
    </div>
  );
}
