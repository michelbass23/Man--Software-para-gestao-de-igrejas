"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Heart, Copy, Check, Smartphone, Church } from "lucide-react";
import Image from "next/image";

interface PixDisplayProps {
  payload: string;
  churchName: string;
  pixKey: string;
  pixKeyType: string;
  logoUrl: string | null;
}

export default function PixDisplay({
  payload,
  churchName,
  pixKey,
  pixKeyType,
  logoUrl,
}: PixDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, payload, {
      width: 360,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
  }, [payload]);

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center px-4 py-8">
      {/* Church Header */}
      <div className="flex flex-col items-center gap-3 mb-8 animate-fade-in">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={churchName}
            width={64}
            height={64}
            className="w-16 h-16 rounded-2xl object-cover border border-zinc-700"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Church className="w-8 h-8 text-gold" />
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {churchName}
        </h1>
      </div>

      {/* Main Card */}
      <div className="glass-card rounded-3xl p-6 md:p-10 max-w-md w-full text-center animate-fade-in stagger-1">
        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-gold" />
          <h2 className="text-lg md:text-xl font-semibold text-white">
            Contribua com sua doação
          </h2>
        </div>
        <p className="text-zinc-400 text-sm mb-6">
          Escaneie o QR Code abaixo com o app do seu banco
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-2xl shadow-lg shadow-black/20">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* PIX Key Info */}
        <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
          <p className="text-zinc-500 text-xs mb-1">Chave PIX ({pixKeyType})</p>
          <p className="text-white text-sm font-mono break-all">{pixKey}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar código PIX (copia e cola)
              </>
            )}
          </button>

          <button
            onClick={handleCopyKey}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            Copiar apenas a chave
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-zinc-600 text-xs mt-8 animate-fade-in stagger-2">
        Contribua com amor e fé. Deus abençoe!
      </p>
    </div>
  );
}