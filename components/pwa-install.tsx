"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registrado:", registration.scope);

            // Verificar atualizações
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    toast.info("Nova versão disponível! Recarregue a página.", {
                      duration: 5000,
                      action: {
                        label: "Recarregar",
                        onClick: () => window.location.reload(),
                      },
                    });
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("Erro ao registrar SW:", error);
          });
      });
    }

    // Detectar se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("PWA já está instalada (standalone mode)");
      setIsInstalled(true);
      setShowInstallButton(false);
      return;
    }

    // Verificar se já foi instalado via flag
    const wasInstalled = localStorage.getItem("pwa-installed");
    if (wasInstalled === "true") {
      console.log("PWA já foi instalada anteriormente");
      setIsInstalled(true);
      setShowInstallButton(false);
      return;
    }

    // Mostrar botão de instalação (sempre disponível)
    console.log("Mostrando botão de instalação PWA");
    setShowInstallButton(true);

    // Capturar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log("beforeinstallprompt disparado");
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Verificar se o usuário já dispensou o banner
      const dismissed = localStorage.getItem("pwa-banner-dismissed");
      if (!dismissed) {
        // Mostrar banner após 3 segundos
        setTimeout(() => {
          setShowInstallBanner(true);
        }, 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detectar quando o app for instalado
    window.addEventListener("appinstalled", () => {
      console.log("PWA instalada com sucesso!");
      setIsInstalled(true);
      setShowInstallBanner(false);
      setShowInstallButton(false);
      localStorage.setItem("pwa-installed", "true");
      toast.success("App instalado com sucesso! 🎉");
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Para iOS
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        toast.info(
          'Para instalar no iOS:\n\n1. Toque no botão Compartilhar (🔗)\n2. Role para baixo\n3. Toque em "Adicionar à Tela Inicial"',
          {
            duration: 10000,
          },
        );
      } else {
        // Para outros navegadores sem suporte
        toast.info(
          "Para instalar:\n\n1. Clique no menu do navegador (⋮)\n2. Procure por 'Instalar app' ou 'Adicionar à tela inicial'\n\nOu use Chrome/Edge para melhor experiência PWA",
          {
            duration: 10000,
          },
        );
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("Usuário aceitou instalar");
        setShowInstallBanner(false);
        setShowInstallButton(false);
        localStorage.setItem("pwa-installed", "true");
      } else {
        console.log("Usuário recusou instalar");
        toast.info("Você pode instalar o app a qualquer momento!");
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Erro ao instalar:", error);
      toast.error("Erro ao instalar o app");
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  return (
    <>
      {/* Botão fixo no header - sempre visível se não estiver instalado */}
      {showInstallButton && !isInstalled && (
        <Button
          onClick={handleInstallClick}
          size="sm"
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white h-9 shadow-lg font-semibold"
        >
          <Download className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Instalar</span>
          <span className="inline sm:hidden">+</span>
        </Button>
      )}

      {/* Banner de instalação (opcional) */}
      {showInstallBanner && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-2xl p-4 border border-blue-400">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
                <Download className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base mb-1">
                  Instalar EstacionaAqui
                </h3>
                <p className="text-sm text-blue-50 mb-3">
                  Instale o app para acesso rápido e usar offline!
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold h-9"
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    Instalar
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-9"
                  >
                    Agora não
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-white/80 hover:text-white hover:bg-white/20 rounded p-1 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
