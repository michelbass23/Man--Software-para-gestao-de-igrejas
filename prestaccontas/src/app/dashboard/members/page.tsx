"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Users,
  Pencil,
  Trash2,
  Phone,
  Mail,
  User,
  MessageCircle,
  Cake,
  X,
} from "lucide-react";
import Image from "next/image";
import MemberModal from "@/components/MemberModal";
import { formatDate } from "@/lib/utils";
import {
  MEMBER_STATUS_LABELS,
  MEMBER_STATUSES,
  MINISTRY_OPTIONS,
  type Member,
  type MemberStatus,
} from "@/types/database";
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  getBirthdayMembers,
} from "./actions";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [ministryFilter, setMinistryFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [photoViewerUrl, setPhotoViewerUrl] = useState<string | null>(null);
  const [photoViewerName, setPhotoViewerName] = useState<string>("");
  const [birthdayMembers, setBirthdayMembers] = useState<any[]>([]);

  const ITEMS_PER_PAGE = 12;

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    const result = await getMembers({
      search: searchQuery || undefined,
      status: statusFilter || undefined,
      ministry: ministryFilter || undefined,
      page,
      limit: ITEMS_PER_PAGE,
    });
    setMembers(result.members);
    setTotal(result.total);
    setIsLoading(false);
  }, [searchQuery, statusFilter, ministryFilter, page]);

  const fetchBirthdays = useCallback(async () => {
    const data = await getBirthdayMembers();
    setBirthdayMembers(data);
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchBirthdays();
  }, [fetchMembers, fetchBirthdays]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleCreate = () => {
    setEditingMember(null);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este membro?")) return;
    const result = await deleteMember(id);
    if (!result.error) {
      fetchMembers();
      fetchBirthdays();
    } else {
      alert(result.error);
    }
  };

  const handleSubmit = async (data: {
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
  }) => {
    setIsSaving(true);
    setSaveError(null);

    let result;

    if (editingMember) {
      result = await updateMember(editingMember.id, data);
    } else {
      result = await createMember(data);
    }

    if (result.error) {
      setSaveError(result.error);
      setIsSaving(false);
      return;
    }

    setIsModalOpen(false);
    setEditingMember(null);
    setIsSaving(false);
    fetchMembers();
    fetchBirthdays();
  };

  const openPhotoViewer = (url: string, name: string) => {
    setPhotoViewerUrl(url);
    setPhotoViewerName(name);
  };

  const closePhotoViewer = () => {
    setPhotoViewerUrl(null);
    setPhotoViewerName("");
  };

  const getBirthdayDay = (birthDate: string) => {
    return new Date(birthDate + "T12:00:00").getDate();
  };

  const isToday = (birthDate: string) => {
    const now = new Date();
    const birth = new Date(birthDate + "T12:00:00");
    return now.getDate() === birth.getDate() && now.getMonth() === birth.getMonth();
  };

  const isUpcomingBirthday = (birthDate: string) => {
    const now = new Date();
    const birth = new Date(birthDate + "T12:00:00");
    const thisYearBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (thisYearBirthday < now) {
      thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
    }
    const diffDays = Math.ceil((thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const getBirthdayDaysLeft = (birthDate: string) => {
    const now = new Date();
    const birth = new Date(birthDate + "T12:00:00");
    const thisYearBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (thisYearBirthday < now) {
      thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
    }
    return Math.ceil((thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case "ativo":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "inativo":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      case "visitante":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <div>
      {/* Header - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2 md:gap-3">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            Membros
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1">
            Cadastro de membros da igreja
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-500/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Membro
        </button>
      </div>

      {/* Error toast */}
      {saveError && (
        <div className="mb-4 p-3 rounded-xl bg-ruby-dim border border-ruby/20">
          <p className="text-ruby text-sm">{saveError}</p>
        </div>
      )}

      {/* Birthday Card - Responsivo */}
      {birthdayMembers.length > 0 && (
        <div className="glass-card p-3 md:p-4 mb-6 opacity-0 animate-fade-in stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <Cake className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-zinc-200">
              Aniversariantes do Mês
            </h3>
            <span className="text-xs text-zinc-500">
              ({birthdayMembers.length})
            </span>
          </div>
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
            {birthdayMembers.map((member) => (
              <div
                key={member.id}
                className={`flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 rounded-xl min-w-[70px] md:min-w-[80px] transition-colors ${
                  isToday(member.birth_date)
                    ? "bg-yellow-500/10 border border-yellow-500/20"
                    : "bg-zinc-900/50"
                }`}
              >
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-yellow-400/50 transition-all"
                  onClick={() => member.photo_url && openPhotoViewer(member.photo_url, member.name)}
                >
                  {member.photo_url ? (
                    <Image
                      src={member.photo_url}
                      alt={member.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 md:w-6 md:h-6 text-zinc-500" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-zinc-200 text-[10px] md:text-xs font-medium truncate max-w-[60px] md:max-w-[70px]">
                    {member.name.split(" ")[0]}
                  </p>
                  <p className="text-zinc-500 text-[10px] md:text-xs">
                    {getBirthdayDay(member.birth_date)}
                  </p>
                </div>
                {member.phone && (
                  <a
                    href={`https://wa.me/55${member.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Feliz aniversário, ${member.name.split(" ")[0]}! 🎂 Que Deus abençoe muito sua vida!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 md:p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    title="Enviar parabéns pelo WhatsApp"
                  >
                    <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary - Responsivo */}
      <div className="glass-card p-3 md:p-4 mb-6 opacity-0 animate-fade-in stagger-2">
        <div className="flex items-center gap-4 md:gap-6">
          <div>
            <p className="text-zinc-500 text-[10px] md:text-xs">Total</p>
            <p className="text-zinc-200 font-mono text-base md:text-lg font-semibold">
              {total}
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-zinc-500 text-[10px] md:text-xs">Ativos</p>
            <p className="text-emerald-400 font-mono text-base md:text-lg font-semibold">
              {members.filter((m) => m.status === "ativo").length}
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-zinc-500 text-[10px] md:text-xs">Visitantes</p>
            <p className="text-blue-400 font-mono text-base md:text-lg font-semibold">
              {members.filter((m) => m.status === "visitante").length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters - Responsivo */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 opacity-0 animate-fade-in stagger-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:min-w-[140px]"
          >
            <option value="">Todos status</option>
            {MEMBER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {MEMBER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={ministryFilter}
            onChange={(e) => {
              setMinistryFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:min-w-[160px]"
          >
            <option value="">Todos ministérios</option>
            {MINISTRY_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Grid - Cards como Eventos */}
      <div className="opacity-0 animate-fade-in stagger-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-800" />
                  <div className="flex-1">
                    <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="glass-card rounded-xl p-8 md:p-12 text-center">
            <Users className="w-10 h-10 md:w-12 md:h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-sm">
              {searchQuery || statusFilter || ministryFilter
                ? "Nenhum membro encontrado com os filtros selecionados"
                : "Nenhum membro cadastrado"}
            </p>
            {!searchQuery && !statusFilter && !ministryFilter && (
              <button
                onClick={handleCreate}
                className="mt-4 text-blue-400 text-sm hover:text-blue-300 transition-colors"
              >
                Cadastrar primeiro membro
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="glass-card rounded-xl p-4 group hover:border-blue-500/30 transition-colors"
                >
                  {/* Header com foto e info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400/50 transition-all"
                      onClick={() => member.photo_url && openPhotoViewer(member.photo_url, member.name)}
                    >
                      {member.photo_url ? (
                        <Image
                          src={member.photo_url}
                          alt={member.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-zinc-100 font-semibold text-sm truncate">
                          {member.name}
                        </h3>
                        {member.birth_date && isToday(member.birth_date) && (
                          <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0">
                            <Cake className="w-2.5 h-2.5" />
                            Hoje!
                          </span>
                        )}
                      </div>
                      {member.ministry && (
                        <p className="text-zinc-500 text-xs">{member.ministry}</p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border flex-shrink-0 ${getStatusColor(
                        member.status
                      )}`}
                    >
                      {MEMBER_STATUS_LABELS[member.status]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 mb-3">
                    {member.phone && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{member.phone}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs truncate">{member.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-2 border-t border-border">
                    {member.phone && (
                      <a
                        href={`https://wa.me/55${member.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="text-xs">WhatsApp</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(member)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="text-xs">Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-zinc-500 hover:text-ruby hover:bg-ruby-dim transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-xs">Excluir</span>
                    </button>
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
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
          setSaveError(null);
        }}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        initialData={editingMember}
      />

      {/* Photo Viewer Modal */}
      {photoViewerUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={closePhotoViewer}
        >
          <div className="relative max-w-md max-h-[80vh] w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-zinc-100 font-semibold">{photoViewerName}</h3>
              <button
                onClick={closePhotoViewer}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Image
              src={photoViewerUrl}
              alt={photoViewerName}
              width={400}
              height={400}
              className="rounded-2xl object-contain max-h-[70vh] mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
