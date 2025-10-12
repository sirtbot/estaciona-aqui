"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as NavigatorWithStandalone).standalone === true
    ) {
      console.log("PWA já instalada (modo standalone)");
      setIsInstalled(true);
      return;
    }

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log("beforeinstallprompt capturado!");
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detectar instalação bem-sucedida
    window.addEventListener("appinstalled", () => {
      console.log("PWA instalada!");
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("App instalado com sucesso! 🎉");
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstall = async () => {
    console.log("Botão de instalação clicado");
    console.log("deferredPrompt:", deferredPrompt);

    // iOS Safari
    if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !deferredPrompt) {
      toast.info(
        "Para instalar no iOS:\n\n1. Toque no ícone Compartilhar\n2. Role para baixo\n3. Toque em 'Adicionar à Tela de Início'",
        {
          duration: 10000,
        },
      );
      return;
    }

    // Android/Desktop sem prompt
    if (!deferredPrompt) {
      toast.info(
        "Para instalar:\n\n1. Clique no menu do navegador (⋮)\n2. Selecione 'Instalar app' ou 'Adicionar à tela inicial'\n\n💡 Use Chrome ou Edge para melhor experiência",
        {
          duration: 10000,
        },
      );
      return;
    }

    // Prompt disponível
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      console.log("Escolha do usuário:", outcome);

      if (outcome === "accepted") {
        setIsInstalled(true);
        toast.success("Instalando app...");
      } else {
        toast.info("Você pode instalar a qualquer momento!");
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Erro ao instalar:", error);
      toast.error("Erro ao tentar instalar");
    }
  };

  // Não mostrar se já estiver instalado
  if (isInstalled) {
    console.log("Botão oculto - app já instalado");
    return null;
  }

  console.log("Renderizando botão de instalação");

  return (
    <Button
      onClick={handleInstall}
      size="sm"
      variant="outline"
      className="h-9 bg-green-600 hover:bg-green-700 text-white border-green-700 hover:border-green-800"
      title="Instalar aplicação"
    >
      <Download className="h-4 w-4" />
      <span className="ml-1.5 hidden md:inline font-semibold">Instalar</span>
    </Button>
  );
}
