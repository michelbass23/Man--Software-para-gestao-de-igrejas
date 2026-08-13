"use client";

import { useState, useEffect, use } from "react";
import {
  Church,
  User,
  Clock,
  MapPin,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getEventInfoForCheckIn,
  registerAttendanceFixed,
} from "@/app/dashboard/events/attendance-actions";

interface EventData {
  valid: boolean;
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  churchName?: string;
  error?: string;
}

export default function FixedCheckInPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"membro" | "visitante">("visitante");

  // Buscar dados do evento ao carregar
  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      const result = await getEventInfoForCheckIn(eventId);
      setEventData(result);
      setIsLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!name.trim()) {
      setError("Por favor, informe seu nome");
      setIsSubmitting(false);
      return;
    }

    const result = await registerAttendanceFixed({
      eventId,
      name: name.trim(),
      age: age ? parseInt(age) : undefined,
      phone: phone.trim() || undefined,
      status,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setIsSubmitting(false);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Evento inválido
  if (!eventData?.valid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-ruby-dim flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-ruby" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">
            Evento Indisponível
          </h1>
          <p className="text-zinc-400 text-sm mb-4">
            {eventData?.error || "Este evento não está disponível no momento."}
          </p>
        </div>
      </div>
    );
  }

  // Sucesso
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-dim flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">
            Presença Confirmada!
          </h1>
          <p className="text-zinc-400 text-sm mb-2">
            {eventData.eventName}
          </p>
          <p className="text-zinc-500 text-xs">
            Obrigado por estar conosco! Deus abençoe!
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              setName("");
              setAge("");
              setPhone("");
              setStatus("visitante");
            }}
            className="mt-6 px-4 py-2 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors"
          >
            Registrar outra pessoa
          </button>
        </div>
      </div>
    );
  }

  // Formulário de check-in
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gold-dim flex items-center justify-center mx-auto mb-3">
            <Church className="w-6 h-6 text-gold" />
          </div>
          <h1 className="text-lg font-semibold text-zinc-100">
            {eventData.churchName}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {eventData.eventName}
          </p>
        </div>

        {/* Event Info */}
        <div className="glass-card p-3 mb-4">
          <div className="flex items-center justify-between text-xs">
            {eventData.eventDate && (
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(eventData.eventDate + "T12:00:00").toLocaleDateString("pt-BR")}
                  {eventData.eventTime && ` às ${eventData.eventTime.slice(0, 5)}`}
                </span>
              </div>
            )}
            {eventData.eventLocation && (
              <div className="flex items-center gap-1.5 text-zinc-400">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{eventData.eventLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nome */}
          <div>
            <label className="block text-zinc-400 text-xs mb-1.5">
              Nome completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
              autoFocus
              className="w-full"
            />
          </div>

          {/* Idade e Telefone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">
                Idade
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex: 25"
                min="1"
                max="120"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">
                Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-zinc-400 text-xs mb-1.5">
              Você é *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("membro")}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all",
                  status === "membro"
                    ? "bg-emerald-dim border-emerald/30 text-emerald"
                    : "border-border text-zinc-500 hover:text-zinc-300 hover:border-border-light"
                )}
              >
                <User className="w-4 h-4" />
                Membro
              </button>
              <button
                type="button"
                onClick={() => setStatus("visitante")}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all",
                  status === "visitante"
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    : "border-border text-zinc-500 hover:text-zinc-300 hover:border-border-light"
                )}
              >
                <User className="w-4 h-4" />
                Visitante
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-ruby-dim border border-ruby/20">
              <p className="text-ruby text-xs">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isSubmitting ? "Confirmando..." : "Confirmar Presença"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-[10px] mt-4">
          PrestaContas - Sistema de Presença
        </p>
      </div>
    </div>
  );
}
