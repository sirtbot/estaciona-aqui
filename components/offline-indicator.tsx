"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { toast } from "sonner";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Verificar estado inicial
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      toast.success("Conexão restabelecida! 🎉", {
        duration: 3000,
      });

      // Esconder indicador após 3 segundos
      setTimeout(() => {
        setShowIndicator(false);
      }, 3000);

      // Recarregar reservas
      window.dispatchEvent(new CustomEvent("online-sync"));
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      toast.error("Sem conexão - Modo offline ativado", {
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Mostrar apenas quando offline ou nos primeiros 3s após voltar online
  if (!showIndicator && isOnline) {
    return null;
  }

  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 duration-300 ${
        !isOnline ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border-2 transition-all ${
          isOnline
            ? "bg-green-500 border-green-600 text-white"
            : "bg-yellow-500 border-yellow-600 text-yellow-950"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-semibold">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-semibold">Modo Offline</span>
          </>
        )}
      </div>
    </div>
  );
}
