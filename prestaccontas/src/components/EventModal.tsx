"use client";

import { useState, useEffect, useRef } from "react";
import { X, CalendarDays, Upload, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPES,
  EVENT_STATUS_LABELS,
  EVENT_STATUSES,
  type ChurchEvent,
} from "@/types/database";
import { uploadEventBanner } from "@/app/dashboard/events/actions";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    eventType: string;
    eventDate: string;
    eventTime?: string;
    location?: string;
    bannerUrl?: string;
    responsibleName?: string;
    status?: string;
  }) => void;
  isLoading?: boolean;
  initialData?: ChurchEvent | null;
}

export default function EventModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: EventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined);
  const [responsibleName, setResponsibleName] = useState("");
  const [status, setStatus] = useState("ativo");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      setError("");
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setEventType(initialData.event_type || "");
        setEventDate(initialData.event_date || "");
        setEventTime(initialData.event_time || "");
        setLocation(initialData.location || "");
        setBannerUrl(initialData.banner_url || undefined);
        setResponsibleName(initialData.responsible_name || "");
        setStatus(initialData.status || "ativo");
      } else {
        setTitle("");
        setDescription("");
        setEventType("");
        setEventDate("");
        setEventTime("");
        setLocation("");
        setBannerUrl(undefined);
        setResponsibleName("");
        setStatus("ativo");
      }
    }
  }, [isOpen, initialData]);

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

  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    const result = await uploadEventBanner(file);

    if (result.error) {
      setError(result.error);
    } else {
      setBannerUrl(result.url || undefined);
    }

    setIsUploadingBanner(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveBanner = () => {
    setBannerUrl(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }
    if (!eventType) {
      setError("Selecione o tipo do evento");
      return;
    }
    if (!eventDate) {
      setError("Selecione a data do evento");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description || undefined,
      eventType,
      eventDate,
      eventTime: eventTime || undefined,
      location: location || undefined,
      bannerUrl: bannerUrl || undefined,
      responsibleName: responsibleName || undefined,
      status,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg mx-4 glass-card border border-border-light animate-fade-in-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-zinc-100 font-semibold">
                {isEditing ? "Editar Evento" : "Novo Evento"}
              </h2>
              <p className="text-zinc-500 text-xs">
                {isEditing
                  ? "Altere os dados do evento"
                  : "Preencha os dados do evento"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Banner */}
          <div className="space-y-2">
            <label className="block text-zinc-400 text-sm mb-2">
              Banner do evento
            </label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-zinc-900/50 flex-shrink-0">
                {bannerUrl ? (
                  <Image
                    src={bannerUrl}
                    alt="Banner do evento"
                    width={128}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CalendarDays className="w-8 h-8 text-zinc-600" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingBanner}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-zinc-400 text-sm hover:text-zinc-200 hover:border-border-light transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {isUploadingBanner ? "Enviando..." : "Banner"}
                </button>
                {bannerUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-zinc-500 text-sm hover:text-ruby hover:border-ruby/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBannerSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Nome do evento *
            </label>
            <input
              type="text"
              placeholder="Ex: Culto de Domingo, Show de Louvor..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Tipo e Responsável */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Tipo do evento *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EVENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Responsável
              </label>
              <input
                type="text"
                placeholder="Nome de quem definiu o evento"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
              />
            </div>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Data do evento *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Horário
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>

          {/* Local */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Local do evento
            </label>
            <input
              type="text"
              placeholder="Ex: Templo Principal, Auditório..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Descrição
            </label>
            <textarea
              rows={3}
              placeholder="Detalhes sobre o evento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {EVENT_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                    status === s
                      ? s === "ativo"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : s === "cancelado"
                        ? "bg-ruby-dim border-ruby/30 text-ruby"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : "border-border text-zinc-500 hover:text-zinc-300 hover:border-border-light"
                  )}
                >
                  {EVENT_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-ruby-dim border border-ruby/20">
              <p className="text-ruby text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-zinc-400 text-sm font-medium hover:text-zinc-200 hover:border-border-light transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !eventType || !eventDate}
              className="flex-1 px-4 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Salvando..."
                : isEditing
                ? "Atualizar"
                : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
