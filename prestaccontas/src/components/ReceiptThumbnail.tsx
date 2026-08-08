"use client";

import { useState } from "react";
import { File, Image, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReceiptThumbnailProps {
  url: string;
  className?: string;
}

export default function ReceiptThumbnail({ url, className }: ReceiptThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  const isPdf = url.match(/\.pdf(\?|$)/i);

  if (hasError) {
    return (
      <div className={cn("flex items-center gap-1.5 text-zinc-500", className)}>
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="text-xs">Erro</span>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className={cn("relative w-10 h-10 rounded-lg overflow-hidden border border-border", className)}>
        <img
          src={url}
          alt="Miniatura do comprovante"
          className={cn(
            "w-full h-full object-cover transition-opacity",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
            <Image className="w-4 h-4 text-zinc-600 animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className={cn("flex items-center gap-1.5 text-gold", className)}>
        <File className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">PDF</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-zinc-500", className)}>
      <File className="w-3.5 h-3.5" />
      <span className="text-xs">Arquivo</span>
    </div>
  );
}
