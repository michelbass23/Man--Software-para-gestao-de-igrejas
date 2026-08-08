"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_LABELS,
  type ChurchEvent,
} from "@/types/database";
import { getActiveMembersWithPhone } from "@/app/dashboard/events/actions";

interface WhatsAppSendModalProps {
  isOpen: boolean;
  event: ChurchEvent | null;
  onClose: () => void;
}

export default function WhatsAppSendModal({
  isOpen,
  event,
  onClose,
}: WhatsAppSendModalProps) {
  const [members, setMembers] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      setSelectedIds(new Set());
      setSentCount(0);
      setIsSending(false);
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    setIsLoading(true);
    const data = await getActiveMembersWithPhone();
    setMembers(data);
    setSelectedIds(new Set(data.map((m) => m.id)));
    setIsLoading(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === members.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(members.map((m) => m.id)));
    }
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatEventTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    return `${hours}h${minutes}`;
  };

  const buildMessage = () => {
    if (!event) return "";

    let msg = `📢 *${event.title}*\n\n`;
    msg += `📅 ${formatEventDate(event.event_date)}`;

    if (event.event_time) {
      msg += ` às ${formatEventTime(event.event_time)}`;
    }
    msg += "\n";

    if (event.location) {
      msg += `📍 ${event.location}\n`;
    }

    if (event.responsible_name) {
      msg += `👤 Responsável: ${event.responsible_name}\n`;
    }

    if (event.description) {
      msg += `\n📝 ${event.description}`;
    }

    msg += `\n\nDeus abençoe! 🙏`;

    return msg;
  };

  const handleSend = async () => {
    if (!event) return;

    const message = buildMessage();
    const selectedMembers = members.filter((m) => selectedIds.has(m.id));

    if (selectedMembers.length === 0) {
      alert("Selecione pelo menos um membro");
      return;
    }

    setIsSending(true);
    setSentCount(0);

    for (let i = 0; i < selectedMembers.length; i++) {
      const member = selectedMembers[i];
      const phone = member.phone.replace(/\D/g, "");
      const encodedMsg = encodeURIComponent(message);
      const url = `https://wa.me/55${phone}?text=${encodedMsg}`;

      window.open(url, "_blank");
      setSentCount(i + 1);

      // Delay between opens to avoid popup blocking
      if (i < selectedMembers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    setIsSending(false);
  };

  const handleCopyMessage = () => {
    const message = buildMessage();
    navigator.clipboard.writeText(message);
    alert("Mensagem copiada para a área de transferência!");
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg mx-4 glass-card border border-border-light animate-fade-in-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-zinc-100 font-semibold">
                Enviar via WhatsApp
              </h2>
              <p className="text-zinc-500 text-xs">
                Selecione os membros que receberão o convite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Preview do Evento */}
          <div className="rounded-xl border border-border bg-zinc-900/50 p-4">
            {event.banner_url && (
              <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                <Image
                  src={event.banner_url}
                  alt={event.title}
                  width={400}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h3 className="text-zinc-100 font-semibold">{event.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full">
                {EVENT_TYPE_LABELS[event.event_type]}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-2">
              {formatEventDate(event.event_date)}
              {event.event_time && ` às ${formatEventTime(event.event_time)}`}
            </p>
            {event.location && (
              <p className="text-zinc-500 text-sm">📍 {event.location}</p>
            )}
          </div>

          {/* Seleção de Membros */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-zinc-400 text-sm">
                Membros com WhatsApp ({selectedIds.size} de {members.length} selecionados)
              </label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {selectedIds.size === members.length
                  ? "Desmarcar todos"
                  : "Selecionar todos"}
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-400" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm">
                  Nenhum membro ativo com telefone cadastrado
                </p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border p-2">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                      selectedIds.has(member.id)
                        ? "bg-emerald-500/10"
                        : "hover:bg-white/[0.03]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                        selectedIds.has(member.id)
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-zinc-600"
                      )}
                    >
                      {selectedIds.has(member.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-200 text-sm truncate">
                        {member.name}
                      </p>
                      <p className="text-zinc-500 text-xs">{member.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const phone = member.phone.replace(/\D/g, "");
                        const encodedMsg = encodeURIComponent(buildMessage());
                        window.open(
                          `https://wa.me/55${phone}?text=${encodedMsg}`,
                          "_blank"
                        );
                      }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="Enviar individualmente"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Progress */}
          {isSending && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400" />
                <p className="text-emerald-400 text-sm">
                  Enviando... {sentCount} de {selectedIds.size}
                </p>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(sentCount / selectedIds.size) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-zinc-400 text-sm font-medium hover:text-zinc-200 hover:border-border-light transition-colors"
            >
              Copiar mensagem
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || selectedIds.size === 0}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Enviar para {selectedIds.size} membros
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
