"use client";

import { useState, useEffect, use } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Users,
  UserCheck,
  UserX,
  ArrowLeft,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getEventReport } from "../../attendance-actions";
import Link from "next/link";

interface AttendanceRecord {
  id: string;
  name: string;
  status: "membro" | "visitante";
  phone: string | null;
  checked_in_at: string;
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  responsible_name: string | null;
  status: string;
}

export default function EventReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventData | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [absentMembers, setAbsentMembers] = useState<
    { id: string; name: string; phone: string | null }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      const result = await getEventReport(id);
      setEvent(result.event as EventData);
      setAttendance(result.attendance as AttendanceRecord[]);
      setAbsentMembers(result.absentMembers);
      setIsLoading(false);
    };
    fetchReport();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Evento nao encontrado</p>
        <Link
          href="/dashboard/events"
          className="text-gold text-sm mt-2 inline-block hover:underline"
        >
          Voltar para eventos
        </Link>
      </div>
    );
  }

  const members = attendance.filter((a) => a.status === "membro");
  const visitors = attendance.filter((a) => a.status === "visitante");

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const eventTypeLabels: Record<string, string> = {
    culto: "Culto",
    show: "Show",
    encontro: "Encontro",
    conferencia: "Conferencia",
    workshop: "Workshop",
    retiro: "Retiro",
    batismo: "Batismo",
    ceia: "Ceia",
    culto_jovens: "Culto de Jovens",
    culto_criancas: "Culto de Criancas",
    outro: "Outro",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/events"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-zinc-100 tracking-tight">
              Relatorio do Evento
            </h1>
            <p className="text-zinc-500 text-xs md:text-sm mt-1">
              {event.title}
            </p>
          </div>
        </div>
      </div>

      {/* Event Info */}
      <div className="glass-card p-4 md:p-6 mb-6 opacity-0 animate-fade-in stagger-1">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">
          {event.title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm">{formatDate(event.event_date)}</span>
          </div>
          {event.event_time && (
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{event.event_time.slice(0, 5)}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}
          {event.responsible_name && (
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-4 h-4" />
              <span className="text-sm">{event.responsible_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
              {eventTypeLabels[event.event_type] || event.event_type}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 opacity-0 animate-fade-in stagger-2">
        <div className="glass-card p-4 text-center">
          <Users className="w-5 h-5 text-gold mx-auto mb-2" />
          <p className="text-2xl font-bold font-mono text-zinc-100">
            {attendance.length}
          </p>
          <p className="text-xs text-zinc-500">Total Presentes</p>
        </div>
        <div className="glass-card p-4 text-center">
          <UserCheck className="w-5 h-5 text-emerald mx-auto mb-2" />
          <p className="text-2xl font-bold font-mono text-emerald">
            {members.length}
          </p>
          <p className="text-xs text-zinc-500">Membros</p>
        </div>
        <div className="glass-card p-4 text-center">
          <User className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold font-mono text-blue-400">
            {visitors.length}
          </p>
          <p className="text-xs text-zinc-500">Visitantes</p>
        </div>
        <div className="glass-card p-4 text-center">
          <UserX className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold font-mono text-amber-400">
            {absentMembers.length}
          </p>
          <p className="text-xs text-zinc-500">Faltosos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance List */}
        <div className="glass-card p-4 md:p-6 opacity-0 animate-fade-in stagger-3">
          <h3 className="text-zinc-100 font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald" />
            Presentes ({attendance.length})
          </h3>

          {attendance.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">
              Nenhuma presenca registrada
            </p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
              {attendance.map((a, index) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600 font-mono w-6">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm text-zinc-200">{a.name}</p>
                      {a.phone && (
                        <p className="text-xs text-zinc-500">{a.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                        a.status === "membro"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-blue-500/10 text-blue-400"
                      )}
                    >
                      {a.status === "membro" ? "Membro" : "Visitante"}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {formatTime(a.checked_in_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Absent Members */}
        <div className="glass-card p-4 md:p-6 opacity-0 animate-fade-in stagger-4">
          <h3 className="text-zinc-100 font-semibold mb-4 flex items-center gap-2">
            <UserX className="w-4 h-4 text-amber-400" />
            Faltosos ({absentMembers.length})
          </h3>

          {absentMembers.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">
              Todos os membros compareceram
            </p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
              {absentMembers.map((m, index) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600 font-mono w-6">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm text-zinc-200">{m.name}</p>
                      {m.phone && (
                        <p className="text-xs text-zinc-500">{m.phone}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                    Ausente
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
