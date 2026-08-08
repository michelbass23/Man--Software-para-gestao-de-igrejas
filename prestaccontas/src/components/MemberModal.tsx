"use client";

import { useState, useEffect, useRef } from "react";
import { X, UserPlus, User, Phone, Mail, Upload } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  MARITAL_STATUS_LABELS,
  MARITAL_STATUSES,
  MEMBER_STATUS_LABELS,
  MEMBER_STATUSES,
  MINISTRY_OPTIONS,
  type Member,
} from "@/types/database";
import { uploadMemberPhoto } from "@/app/dashboard/members/actions";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone?: string;
    email?: string;
    birthDate?: string;
    baptismDate?: string;
    maritalStatus?: string;
    ministry?: string;
    status?: string;
    notes?: string;
    photoUrl?: string;
  }) => void;
  isLoading?: boolean;
  initialData?: Member | null;
}

export default function MemberModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: MemberModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [baptismDate, setBaptismDate] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [ministry, setMinistry] = useState("");
  const [status, setStatus] = useState("ativo");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      setError("");
      if (initialData) {
        setName(initialData.name || "");
        setPhone(initialData.phone || "");
        setEmail(initialData.email || "");
        setBirthDate(initialData.birth_date || "");
        setBaptismDate(initialData.baptism_date || "");
        setMaritalStatus(initialData.marital_status || "");
        setMinistry(initialData.ministry || "");
        setStatus(initialData.status || "ativo");
        setNotes(initialData.notes || "");
        setPhotoUrl(initialData.photo_url || undefined);
      } else {
        setName("");
        setPhone("");
        setEmail("");
        setBirthDate("");
        setBaptismDate("");
        setMaritalStatus("");
        setMinistry("");
        setStatus("ativo");
        setNotes("");
        setPhotoUrl(undefined);
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

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const result = await uploadMemberPhoto(file);

    if (result.error) {
      setError(result.error);
    } else {
      setPhotoUrl(result.url || undefined);
    }

    setIsUploadingPhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    onSubmit({
      name: name.trim(),
      phone: phone || undefined,
      email: email || undefined,
      birthDate: birthDate || undefined,
      baptismDate: baptismDate || undefined,
      maritalStatus: maritalStatus || undefined,
      ministry: ministry || undefined,
      status,
      notes: notes || undefined,
      photoUrl: photoUrl || undefined,
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-zinc-100 font-semibold">
                {isEditing ? "Editar Membro" : "Novo Membro"}
              </h2>
              <p className="text-zinc-500 text-xs">
                {isEditing
                  ? "Altere os dados do membro"
                  : "Preencha os dados do membro"}
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
          {/* Foto */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-zinc-900/50 flex-shrink-0">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt="Foto do membro"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-zinc-600" />
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-zinc-400 text-sm hover:text-zinc-200 hover:border-border-light transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isUploadingPhoto ? "Enviando..." : "Foto"}
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
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
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Nome */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Nome completo *
            </label>
            <input
              type="text"
              placeholder="Ex: João da Silva Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Telefone e Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Telefone
              </label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={16}
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                E-mail
              </label>
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Data de nascimento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Data de batismo
              </label>
              <input
                type="date"
                value={baptismDate}
                onChange={(e) => setBaptismDate(e.target.value)}
              />
            </div>
          </div>

          {/* Estado civil e Ministério */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Estado civil
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
              >
                <option value="">Selecione</option>
                {MARITAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {MARITAL_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Ministério
              </label>
              <select
                value={ministry}
                onChange={(e) => setMinistry(e.target.value)}
              >
                <option value="">Selecione</option>
                {MINISTRY_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Situação */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Situação
            </label>
            <div className="flex gap-2">
              {MEMBER_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                    status === s
                      ? s === "ativo"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : s === "inativo"
                        ? "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : "border-border text-zinc-500 hover:text-zinc-300 hover:border-border-light"
                  )}
                >
                  {MEMBER_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Observações
            </label>
            <textarea
              rows={3}
              placeholder="Anotações sobre o membro..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
              disabled={isLoading || !name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
