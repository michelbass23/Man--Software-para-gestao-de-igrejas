"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Clock, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateAttendanceToken,
  getAttendanceStats,
} from "@/app/dashboard/events/attendance-actions";

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

  // Atualizar estatísticas a cada 5 segundos
  useEffect(() => {
    const fetchStats = async () => {
      const result = await getAttendanceStats(eventId);
      setStats(result);
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
          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            {isGenerating ? (
              <div className="w-[300px] h-[300px] rounded-xl bg-zinc-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
              </div>
            ) : token ? (
              <div className="relative">
                <img
                  src={qrCodeUrl}
                  alt="QR Code para check-in"
                  width={300}
                  height={300}
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

          {/* Botão gerar novo */}
          {timeLeft === 0 && !isGenerating && (
            <button
              onClick={generateToken}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors mb-4"
            >
              <RefreshCw className="w-4 h-4" />
              Gerar novo QR Code
            </button>
          )}

          {/* Estatísticas */}
          <div className="glass-card p-4">
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
          </div>

          {/* Instruções */}
          <div className="mt-4 p-3 rounded-xl bg-zinc-900/50 border border-border">
            <p className="text-zinc-400 text-xs text-center">
              Projete este QR Code na tela da igreja.
              <br />
              Os membros escaneiam e confirmam presença.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
