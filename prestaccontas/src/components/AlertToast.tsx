"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlertTriangle, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPendingAlerts, markAlertAsRead, type Alert } from "@/app/dashboard/alerts/actions";

export default function AlertToast() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkAlerts = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);

    try {
      console.log("Verificando alertas...");
      const pendingAlerts = await getPendingAlerts();
      console.log("Alertas recebidos:", pendingAlerts);

      if (pendingAlerts.length > 0) {
        setAlerts(pendingAlerts);
        setCurrentIndex(0);
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Erro ao verificar alertas:", error);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  useEffect(() => {
    // Verificar alertas após 2 segundos (para dar tempo da página carregar)
    const initialTimer = setTimeout(() => {
      checkAlerts();
    }, 2000);

    // Verificar a cada 2 minutos
    const interval = setInterval(checkAlerts, 2 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [checkAlerts]);

  const currentAlert = alerts[currentIndex];

  const handleDismiss = async () => {
    if (currentAlert) {
      await markAlertAsRead(currentAlert.id);
    }

    if (currentIndex < alerts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsVisible(false);
      setAlerts([]);
    }
  };

  const handleDismissAll = async () => {
    for (const alert of alerts) {
      await markAlertAsRead(alert.id);
    }
    setIsVisible(false);
    setAlerts([]);
  };

  if (!isVisible || !currentAlert) return null;

  const isOverdue = currentAlert.type === "overdue";
  const isDueSoon = currentAlert.type === "due_soon";

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div
        className={cn(
          "w-[400px] rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-xl",
          isOverdue
            ? "bg-[#1a0a0a] border-ruby/40"
            : "bg-[#1a150a] border-gold/40"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-5 py-4",
            isOverdue ? "bg-ruby/15" : "bg-gold/15"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isOverdue ? "bg-ruby/20" : "bg-gold/20"
              )}
            >
              {isOverdue ? (
                <AlertTriangle className="w-5 h-5 text-ruby" />
              ) : (
                <Clock className="w-5 h-5 text-gold" />
              )}
            </div>
            <div>
              <span
                className={cn(
                  "font-semibold text-base block",
                  isOverdue ? "text-ruby" : "text-gold"
                )}
              >
                {currentAlert.title}
              </span>
              {alerts.length > 1 && (
                <span className="text-xs text-zinc-500">
                  Alerta {currentIndex + 1} de {alerts.length}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <p className="text-zinc-200 text-sm leading-relaxed">
            {currentAlert.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
          <button
            onClick={handleDismissAll}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Dispensar todos ({alerts.length})
          </button>
          <button
            onClick={handleDismiss}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-medium transition-all",
              isOverdue
                ? "bg-ruby text-white hover:bg-ruby/80"
                : "bg-gold text-black hover:bg-gold/80"
            )}
          >
            {currentIndex < alerts.length - 1 ? "Próximo alerta" : "Entendi, obrigado"}
          </button>
        </div>
      </div>
    </div>
  );
}
