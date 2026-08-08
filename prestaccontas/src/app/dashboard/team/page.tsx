"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Crown,
  ShieldCheck,
  Eye,
  Trash2,
  X,
  Copy,
  Check,
  MessageCircle,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getTeamMembers,
  inviteUser,
  updateUserRole,
  removeUser,
} from "./actions";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  created_at: string;
}

interface InviteResult {
  name: string;
  email: string;
  password: string;
  role: string;
  churchName: string;
}

const roleConfig = {
  admin: {
    label: "Administrador",
    shortLabel: "Admin",
    icon: Crown,
    color: "text-gold",
    bg: "bg-gold-dim",
    border: "border-gold/20",
    description: "Acesso total",
  },
  editor: {
    label: "Editor",
    shortLabel: "Editor",
    icon: ShieldCheck,
    color: "text-emerald",
    bg: "bg-emerald-dim",
    border: "border-emerald/20",
    description: "Criar e editar",
  },
  viewer: {
    label: "Visualizador",
    shortLabel: "Viewer",
    icon: Eye,
    color: "text-zinc-400",
    bg: "bg-zinc-800/50",
    border: "border-zinc-700/20",
    description: "Apenas ver",
  },
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    const data = await getTeamMembers();
    setMembers(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteError(null);
    setInviteResult(null);

    const formData = new FormData();
    formData.append("name", inviteName);
    formData.append("email", inviteEmail);
    formData.append("role", inviteRole);

    const result = await inviteUser(null, formData);

    if (result && result.startsWith("SUCCESS:")) {
      try {
        const data = JSON.parse(result.replace("SUCCESS:", ""));
        setInviteResult(data);
        setInviteName("");
        setInviteEmail("");
        setInviteRole("viewer");
        fetchMembers();
      } catch {
        setInviteError("Erro ao processar resultado");
      }
    } else if (result) {
      setInviteError(result);
    }

    setIsInviting(false);
  };

  const handleCopyCredentials = () => {
    if (!inviteResult) return;

    const text = `Acesso ao sistema PrestaContas - ${inviteResult.churchName}\n\n` +
      `Email: ${inviteResult.email}\n` +
      `Senha: ${inviteResult.password}\n\n` +
      `Acesse: http://localhost:3000/login\n\n` +
      `Após o primeiro login, altere sua senha.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!inviteResult) return;

    const roleLabel =
      roleConfig[inviteResult.role as keyof typeof roleConfig]?.label ||
      inviteResult.role;

    const text = `Olá ${inviteResult.name}! 👋\n\n` +
      `Você foi convidado(a) para acessar o sistema *PrestaContas* da *${inviteResult.churchName}*.\n\n` +
      `📋 *Seus dados de acesso:*\n` +
      `📧 Email: ${inviteResult.email}\n` +
      `🔑 Senha: ${inviteResult.password}\n` +
      `👤 Permissão: ${roleLabel}\n\n` +
      `🔗 Acesse: http://localhost:3000/login\n\n` +
      `⚠️ Após o primeiro login, altere sua senha.\n\n` +
      `Deus abençoe! 🙏`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const error = await updateUserRole(userId, newRole);
    if (error) {
      setActionError(error);
      setTimeout(() => setActionError(null), 3000);
    } else {
      fetchMembers();
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;

    const error = await removeUser(userId);
    if (error) {
      setActionError(error);
      setTimeout(() => setActionError(null), 3000);
    } else {
      fetchMembers();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInviteError(null);
    setInviteResult(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2 md:gap-3">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-gold" />
            Equipe
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1">
            Gerencie os membros e permissões
          </p>
        </div>
        <button
          onClick={() => {
            setInviteError(null);
            setInviteResult(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          Convidar Membro
        </button>
      </div>

      {/* Error toast */}
      {actionError && (
        <div className="mb-4 p-3 rounded-xl bg-ruby-dim border border-ruby/20">
          <p className="text-ruby text-sm">{actionError}</p>
        </div>
      )}

      {/* Members Grid */}
      <div className="opacity-0 animate-fade-in stagger-1">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-800" />
                  <div className="flex-1">
                    <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="glass-card rounded-xl p-8 md:p-12 text-center">
            <Users className="w-10 h-10 md:w-12 md:h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-sm mb-2">
              Nenhum membro na equipe
            </p>
            <p className="text-zinc-500 text-xs">
              Convide membros para acessar o sistema
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {members.map((member, index) => {
              const config =
                roleConfig[member.role as keyof typeof roleConfig] ||
                roleConfig.viewer;
              const RoleIcon = config.icon;

              return (
                <div
                  key={member.id}
                  className="glass-card rounded-xl p-4 group hover:border-border-light transition-colors opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                        config.bg
                      )}
                    >
                      <span
                        className={cn("text-lg font-semibold", config.color)}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-zinc-100 font-semibold text-sm truncate">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <RoleIcon
                          className={cn("w-3.5 h-3.5", config.color)}
                        />
                        <span className={cn("text-xs", config.color)}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.id, e.target.value)
                      }
                      className="flex-1 text-xs bg-transparent border border-border rounded-lg px-2 py-1.5 text-zinc-300 focus:outline-none focus:border-gold"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-ruby hover:bg-ruby-dim transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md glass-card border border-border-light animate-fade-in-scale max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-surface/95 backdrop-blur-xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-dim flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h2 className="text-zinc-100 font-semibold">
                    {inviteResult ? "Convite Criado!" : "Convidar Membro"}
                  </h2>
                  <p className="text-zinc-500 text-xs">
                    {inviteResult
                      ? "Compartilhe os dados de acesso"
                      : "Crie o acesso para o membro"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resultado do Convite */}
            {inviteResult ? (
              <div className="p-4 md:p-6 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 text-sm font-medium mb-3">
                    Usuário criado com sucesso!
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs w-16">Nome:</span>
                      <span className="text-zinc-200 text-sm font-medium">
                        {inviteResult.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs w-16">Email:</span>
                      <span className="text-zinc-200 text-sm font-mono">
                        {inviteResult.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs w-16">Senha:</span>
                      <span className="text-gold text-sm font-mono font-bold">
                        {inviteResult.password}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs w-16">Papel:</span>
                      <span className="text-zinc-200 text-sm">
                        {
                          roleConfig[
                            inviteResult.role as keyof typeof roleConfig
                          ]?.label
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-zinc-500 text-xs">
                  Compartilhe essas credenciais com o membro. Ele poderá
                  alterar a senha após o primeiro login.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopyCredentials}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-zinc-300 text-sm font-medium hover:bg-white/[0.05] transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSendWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-500/90 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              /* Formulário de Convite */
              <form onSubmit={handleInvite} className="p-4 md:p-6 space-y-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Nome do membro"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    E-mail de acesso
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Permissão
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(roleConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setInviteRole(key)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                            inviteRole === key
                              ? `${config.bg} ${config.border} ${config.color}`
                              : "border-border text-zinc-500 hover:text-zinc-300 hover:border-border-light"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-[10px] font-medium">
                            {config.shortLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {inviteError && (
                  <div className="p-3 rounded-xl bg-ruby-dim border border-ruby/20">
                    <p className="text-ruby text-sm">{inviteError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isInviting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-zinc-400 text-sm font-medium hover:text-zinc-200 hover:border-border-light transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isInviting || !inviteName.trim() || !inviteEmail.trim()
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isInviting ? (
                      <>
                        <Key className="w-4 h-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Criar Acesso
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
