"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Clock, Users, Loader2, ChevronDown, ChevronUp, UserCheck, Printer, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateAttendanceToken,
  getAttendanceStats,
  getEventAttendance,
} from "@/app/dashboard/events/attendance-actions";

interface AttendanceRecord {
  id: string;
  name: string;
  status: "membro" | "visitante";
  checked_in_at: string;
}

interface QRCodeDisplayProps {
  eventId: string;
  eventName: string;
  onClose: () => void;
}

export default function QRCodeDisplay({
  eventId,
  eventName,
  onClose,
}: QRCodeDisplayProps) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState({ total: 0, members: 0, visitors: 0 });
  const [checkinUrl, setCheckinUrl] = useState("");
  const [attendees, setAttendees] = useState<AttendanceRecord[]>([]);
  const [showAttendees, setShowAttendees] = useState(false);
  const [activeTab, setActiveTab] = useState<"temporary" | "fixed">("temporary");

  // URL fixo do evento (nunca expira)
  const fixedUrl = typeof window !== "undefined"
    ? `${window.location.origin}/checkin/event/${eventId}`
    : "";

  // Gerar novo token
  const generateToken = useCallback(async () => {
    setIsGenerating(true);
    const result = await generateAttendanceToken(eventId);

    if (result.error) {
      alert(result.error);
      setIsGenerating(false);
      return;
    }

    if (result.token && result.expiresAt) {
      setToken(result.token);
      setExpiresAt(result.expiresAt);

      // Usar variável de ambiente ou detectar automaticamente
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const url = `${baseUrl}/checkin/${result.token}`;
      setCheckinUrl(url);

      const expires = new Date(result.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(remaining);
    }

    setIsGenerating(false);
  }, [eventId]);

  // Gerar token ao montar
  useEffect(() => {
    generateToken();
  }, [generateToken]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Atualizar estatísticas e lista a cada 5 segundos
  useEffect(() => {
    const fetchStats = async () => {
      const [statsResult, attendanceResult] = await Promise.all([
        getAttendanceStats(eventId),
        getEventAttendance(eventId),
      ]);
      setStats(statsResult);
      setAttendees(attendanceResult);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Usar API do Google Charts para gerar QR Code
  const qrCodeUrl = checkinUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkinUrl)}&bgcolor=18181b&color=D4A843`
    : "";

  // QR Code fixo (para imprimir)
  const fixedQrCodeUrl = fixedUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fixedUrl)}&bgcolor=18181b&color=D4A843`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md glass-card border border-border-light animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-zinc-100 font-semibold">Check-in do Evento</h2>
            <p className="text-zinc-500 text-xs">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("temporary")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                activeTab === "temporary"
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              Temporario (Projetor)
            </button>
            <button
              onClick={() => setActiveTab("fixed")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                activeTab === "fixed"
                  ? "bg-emerald/20 text-emerald border border-emerald/30"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"
              )}
            >
              <Printer className="w-3.5 h-3.5" />
              Fixo (Impressao)
            </button>
          </div>

          {/* QR Code Temporario */}
          {activeTab === "temporary" && (
            <>
              <div className="flex flex-col items-center mb-4">
                {isGenerating ? (
                  <div className="w-[280px] h-[280px] rounded-xl bg-zinc-900 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  </div>
                ) : token ? (
                  <div className="relative">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code temporario"
                      width={280}
                      height={280}
                      className="rounded-xl"
                    />
                    {timeLeft === 0 && (
                      <div className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-ruby font-semibold mb-2">Expirado</p>
                          <button
                            onClick={generateToken}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-black text-sm font-medium"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Gerar novo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Timer */}
              {token && timeLeft > 0 && (
                <div
                  className={cn(
                    "text-center p-3 rounded-xl mb-4",
                    timeLeft > 60 ? "bg-emerald-dim" : "bg-amber-500/10"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock
                      className={cn(
                        "w-4 h-4",
                        timeLeft > 60 ? "text-emerald" : "text-amber-400"
                      )}
                    />
                    <span
                      className={cn(
                        "font-mono text-xl font-bold",
                        timeLeft > 60 ? "text-emerald" : "text-amber-400"
                      )}
                    >
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Tempo restante deste QR Code
                  </p>
                </div>
              )}

              {/* Botao gerar novo */}
              {timeLeft === 0 && !isGenerating && (
                <button
                  onClick={generateToken}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors mb-4"
                >
                  <RefreshCw className="w-4 h-4" />
                  Gerar novo QR Code
                </button>
              )}

              <div className="p-3 rounded-xl bg-zinc-900/50 border border-border">
                <p className="text-zinc-400 text-xs text-center">
                  Projete este QR Code na tela da igreja.
                  <br />
                  Expira em 5 minutos por seguranca.
                </p>
              </div>
            </>
          )}

          {/* QR Code Fixo */}
          {activeTab === "fixed" && (
            <>
              <div className="flex flex-col items-center mb-4">
                <img
                  src={fixedQrCodeUrl}
                  alt="QR Code fixo"
                  width={280}
                  height={280}
                  className="rounded-xl"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-dim border border-emerald/20 mb-4">
                <p className="text-emerald text-xs text-center font-medium mb-1">
                  QR Code Permanente
                </p>
                <p className="text-zinc-400 text-[10px] text-center">
                  Nao expira. Ideal para imprimir e fixar na entrada da igreja.
                  <br />
                  Varios membros podem usar o mesmo dispositivo.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head><title>QR Code - ${eventName}</title></head>
                          <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif;background:#18181b;color:white;">
                            <h2 style="margin-bottom:8px;">${eventName}</h2>
                            <p style="color:#a1a1aa;font-size:14px;margin-bottom:24px;">Escaneie para confirmar presenca</p>
                            <img src="${fixedQrCodeUrl}" width="300" height="300" style="border-radius:12px;" />
                            <p style="color:#71717a;font-size:10px;margin-top:16px;">PrestaContas - Sistema de Presenca</p>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fixedUrl);
                    alert("Link copiado!");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Copiar Link
                </button>
              </div>
            </>
          )}

          {/* Estatísticas */}
          <div className="glass-card p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-semibold text-zinc-200">
                Presentes
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-zinc-100">
                  {stats.total}
                </p>
                <p className="text-[10px] text-zinc-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-emerald">
                  {stats.members}
                </p>
                <p className="text-[10px] text-zinc-500">Membros</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-blue-400">
                  {stats.visitors}
                </p>
                <p className="text-[10px] text-zinc-500">Visitantes</p>
              </div>
            </div>

            {/* Lista de presentes */}
            {attendees.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <button
                  onClick={() => setShowAttendees(!showAttendees)}
                  className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Ver lista de presentes
                  </span>
                  {showAttendees ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showAttendees && (
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
                    {attendees.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-zinc-900/50"
                      >
                        <span className="text-xs text-zinc-200 truncate">
                          {a.name}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                            a.status === "membro"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-blue-500/10 text-blue-400"
                          )}
                        >
                          {a.status === "membro" ? "Membro" : "Visitante"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
