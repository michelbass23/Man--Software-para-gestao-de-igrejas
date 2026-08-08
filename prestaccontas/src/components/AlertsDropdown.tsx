"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X, Check, CheckCheck, AlertTriangle, Clock } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  getAlerts,
  getAlertCount,
  markAlertAsRead,
  markAllAlertsAsRead,
  type Alert,
} from "@/app/dashboard/alerts/actions";

export default function AlertsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    const [alertsData, countData] = await Promise.all([
      getAlerts(true),
      getAlertCount(),
    ]);
    setAlerts(alertsData);
    setCount(countData);
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleMarkAsRead = async (alertId: string) => {
    await markAlertAsRead(alertId);
    fetchAlerts();
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    await markAllAlertsAsRead();
    fetchAlerts();
    setIsLoading(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return <AlertTriangle className="w-4 h-4 text-ruby" />;
      case "due_soon":
        return <Clock className="w-4 h-4 text-gold" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case "overdue":
        return "bg-ruby-dim border-ruby/20";
      case "due_soon":
        return "bg-gold-dim border-gold/20";
      default:
        return "bg-zinc-800/50 border-border";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ruby text-white text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 glass-card border border-border-light rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-scale">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-zinc-100">
                Alertas {count > 0 && `(${count})`}
              </h3>
              {count > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Marcar todos como lidos
                </button>
              )}
            </div>

            {/* Alerts list */}
            <div className="overflow-y-auto max-h-72">
              {alerts.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Nenhum alerta</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-3 p-4 border-b border-border/50 hover:bg-white/[0.02] transition-colors",
                      !alert.is_read && "bg-white/[0.02]"
                    )}
                  >
                    <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 font-medium">
                        {alert.title}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1 truncate">
                        {alert.message}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Vence: {formatDate(alert.due_date)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="p-1 rounded text-zinc-500 hover:text-emerald hover:bg-emerald-dim transition-colors"
                      title="Marcar como lido"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
