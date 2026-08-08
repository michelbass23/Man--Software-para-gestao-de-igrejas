"use client";

import { useState, useEffect } from "react";
import { X, Download, ExternalLink, Maximize2, Minimize2, FileText, ZoomIn, ZoomOut } from "lucide-react";

interface ReceiptViewerProps {
  url: string;
  children?: React.ReactNode;
}

export default function ReceiptViewer({ url, children }: ReceiptViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imageError, setImageError] = useState(false);

  const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  const isPdf = url.match(/\.pdf(\?|$)/i);

  const fileName = decodeURIComponent(
    url.split("/").pop()?.split("?")[0] || "comprovante"
  );

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isFullscreen]);

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFullscreen(false);
    setZoom(1);
    setImageError(false);
  };

  return (
    <>
      {/* Trigger - sempre visível */}
      <div onClick={() => setIsOpen(true)} className="cursor-pointer inline-flex">
        {children}
      </div>

      {/* Modal Overlay - Fullscreen */}
      {isOpen && <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/80 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold-dim flex items-center justify-center">
              <FileText className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-semibold text-base">
                Comprovante
              </h3>
              <p className="text-zinc-500 text-sm truncate max-w-[500px]">
                {fileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom controls (apenas para imagens) */}
            {isImage && !imageError && (
              <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30"
                  title="Diminuir zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-3 py-1 text-sm text-zinc-300 hover:text-white font-mono hover:bg-zinc-700 rounded-lg transition-colors"
                  title="Resetar zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-black font-semibold hover:bg-gold/90 transition-colors"
              title="Baixar comprovante"
            >
              <Download className="w-5 h-5" />
              <span>Baixar</span>
            </button>

            {/* Open in new tab */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-5 h-5" />
            </a>

            {/* Close */}
            <button
              onClick={handleClose}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Fechar (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Full height */}
        <div className="flex-1 overflow-hidden flex items-center justify-center p-6 bg-zinc-950/50">
          {isImage && !imageError ? (
            <div className="overflow-auto w-full h-full flex items-center justify-center">
              <img
                src={url}
                alt="Comprovante"
                className="rounded-xl shadow-2xl transition-transform duration-200"
                style={{
                  transform: `scale(${zoom})`,
                  maxWidth: zoom <= 1 ? "90%" : "none",
                  maxHeight: zoom <= 1 ? "90%" : "none",
                  objectFit: "contain",
                }}
                onError={() => setImageError(true)}
                onDoubleClick={handleResetZoom}
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={url}
              className="w-full h-full rounded-xl border border-zinc-800 shadow-2xl"
              title="Comprovante PDF"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-zinc-600" />
              </div>
              <p className="text-zinc-300 text-xl font-medium mb-3">
                {imageError
                  ? "Erro ao carregar imagem"
                  : "Visualização não disponível"}
              </p>
              <p className="text-zinc-500 text-base mb-8 text-center max-w-lg">
                {imageError
                  ? "O arquivo pode não existir ou você não tem permissão para acessá-lo."
                  : "Este tipo de arquivo não pode ser visualizado diretamente."}
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gold text-black text-lg font-semibold hover:bg-gold/90 transition-colors"
              >
                <Download className="w-6 h-6" />
                Baixar arquivo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-6 px-6 py-3 bg-zinc-900/80 border-t border-zinc-800">
          {isImage && !imageError && (
            <>
              <span className="text-zinc-500 text-sm">
                Duplo clique para resetar zoom
              </span>
              <span className="text-zinc-700">•</span>
            </>
          )}
          <span className="text-zinc-500 text-sm">
            Pressione ESC para fechar
          </span>
        </div>
      </div>}
    </>
  );
}
