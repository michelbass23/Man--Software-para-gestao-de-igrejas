"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface PixQrCodeProps {
  payload: string;
  size?: number;
}

export default function PixQrCode({ payload, size = 220 }: PixQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !payload) return;

    QRCode.toCanvas(canvasRef.current, payload, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
  }, [payload, size]);

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded-xl" />
      <p className="text-faint text-[10px]">
        Escaneie com o app do banco
      </p>
    </div>
  );
}