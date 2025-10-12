"use client";

import { useState, useEffect, useCallback } from "react";
import { ParkingGrid } from "@/components/parking-grid";
import { ReservationDialog } from "@/components/reservation-dialog";
import { ExtendReservationDialog } from "@/components/extend-reservation-dialog";
import { InstallButton } from "@/components/install-button";
import { OfflineIndicator } from "@/components/offline-indicator";
import { defaultParkingLot } from "@/lib/parking-data";
import { Reservation } from "@/lib/types";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ParkingCircle,
  RefreshCw,
  Clock,
  User,
  Car,
  LogOut,
  ClockIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  // Carregar reservas da API
  const loadReservations = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true);

      const response = await fetch("/api/reservations");
      if (!response.ok) throw new Error("Erro ao carregar reservas");

      const data = await response.json();
      const withDates = data.map((r: Reservation) => ({
        ...r,
        startTime: new Date(r.startTime),
        endTime: new Date(r.endTime),
      }));

      setReservations(withDates);
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
      toast.error("Erro ao carregar reservas");
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();

    // Sincronizar quando voltar online
    const handleOnlineSync = () => {
      loadReservations(true);
    };

    window.addEventListener("online-sync", handleOnlineSync);

    return () => {
      window.removeEventListener("online-sync", handleOnlineSync);
    };
  }, [loadReservations]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadReservations();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadReservations]);

  const handleSpotClick = (spotId: string) => {
    setSelectedSpotId(spotId);
    setDialogOpen(true);
  };

  const handleReservationConfirm = async (data: {
    name: string;
    licensePlate: string;
    startTime: Date;
    endTime: Date;
  }) => {
    if (!selectedSpotId) return;

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotId: selectedSpotId,
          name: data.name,
          licensePlate: data.licensePlate,
          startTime: data.startTime.toISOString(),
          endTime: data.endTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar reserva");
        return;
      }

      const newReservation = await response.json();

      // Atualizar estado local sem refresh da página
      setReservations((prev) => [
        ...prev,
        {
          ...newReservation,
          startTime: new Date(newReservation.startTime),
          endTime: new Date(newReservation.endTime),
        },
      ]);

      setDialogOpen(false);
      setSelectedSpotId(null);

      const spot = defaultParkingLot.spots.find((s) => s.id === selectedSpotId);
      toast.success(
        `Reserva confirmada para a vaga ${spot?.number}! De ${data.startTime.toLocaleString()} até ${data.endTime.toLocaleString()}`,
      );
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      toast.error("Erro ao criar reserva");
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/reservations?id=${reservationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erro ao cancelar reserva");
        return;
      }

      setReservations((prev) => prev.filter((r) => r.id !== reservationId));

      toast.success("Reserva cancelada");
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      toast.error("Erro ao cancelar reserva");
    }
  };

  const handleExtendReservation = async (additionalHours: number) => {
    if (!selectedReservation) return;

    try {
      const response = await fetch(
        `/api/reservations?id=${selectedReservation.id}&action=extend`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ additionalHours }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erro ao prolongar reserva");
        return;
      }

      const updatedReservation = await response.json();

      setReservations((prev) =>
        prev.map((r) =>
          r.id === updatedReservation.id
            ? {
                ...updatedReservation,
                startTime: new Date(updatedReservation.startTime),
                endTime: new Date(updatedReservation.endTime),
              }
            : r,
        ),
      );

      toast.success(
        `Reserva prolongada em ${additionalHours >= 1 ? `${additionalHours}h` : `${additionalHours * 60} min`}!`,
      );
      setExtendDialogOpen(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error("Erro ao prolongar reserva:", error);
      toast.error("Erro ao prolongar reserva");
    }
  };

  const handleCheckoutEarly = async () => {
    if (!selectedReservation) return;

    try {
      const response = await fetch(
        `/api/reservations?id=${selectedReservation.id}&action=checkout`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erro ao fazer checkout");
        return;
      }

      const updatedReservation = await response.json();

      setReservations((prev) =>
        prev.map((r) =>
          r.id === updatedReservation.id
            ? {
                ...updatedReservation,
                startTime: new Date(updatedReservation.startTime),
                endTime: new Date(updatedReservation.endTime),
              }
            : r,
        ),
      );

      toast.success("Vaga liberada com sucesso!");
      setCheckoutDialogOpen(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error("Erro ao fazer checkout:", error);
      toast.error("Erro ao fazer checkout");
    }
  };

  const openExtendDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setExtendDialogOpen(true);
  };

  const openCheckoutDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setCheckoutDialogOpen(true);
  };

  const activeReservations = reservations.filter(
    (r) => new Date(r.endTime) > new Date(),
  );

  const selectedSpot = defaultParkingLot.spots.find(
    (s) => s.id === selectedSpotId,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header Mobile First */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="px-3 py-3 md:px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 md:p-2 bg-blue-500 rounded-lg">
                <ParkingCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  EstacionaAqui
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <InstallButton />
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadReservations(true)}
                disabled={isRefreshing}
                className="h-9"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm md:hidden">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-slate-600 dark:text-slate-400">Livre</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-slate-600 dark:text-slate-400">
                Ocupado
              </span>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary" className="font-semibold text-xs">
                {activeReservations.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* Parking Grid */}
        <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <div className="p-3 md:p-4">
            <ParkingGrid
              parkingLot={defaultParkingLot}
              reservations={reservations}
              onSpotClick={handleSpotClick}
            />
          </div>
        </Card>

        {/* Active Reservations - Mobile Optimized */}
        {activeReservations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white px-1 flex items-center gap-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
              Minhas Reservas
            </h2>
            {activeReservations
              .sort(
                (a, b) =>
                  new Date(a.startTime).getTime() -
                  new Date(b.startTime).getTime(),
              )
              .map((reservation) => {
                const spot = defaultParkingLot.spots.find(
                  (s) => s.id === reservation.spotId,
                );
                const isActive =
                  new Date(reservation.startTime) <= new Date() &&
                  new Date(reservation.endTime) > new Date();

                return (
                  <Card
                    key={reservation.id}
                    className={`p-3 md:p-4 ${
                      isActive
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                        : "bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                        <div
                          className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-white flex-shrink-0 text-lg md:text-xl ${
                            isActive ? "bg-red-500" : "bg-slate-400"
                          }`}
                        >
                          {spot?.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                            <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-500" />
                            <span className="text-sm md:text-base font-semibold text-slate-900 dark:text-white truncate">
                              {reservation.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2 mb-2">
                            <Car className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-500" />
                            <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                              {reservation.licensePlate}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(reservation.startTime).toLocaleString(
                              [],
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}{" "}
                            -{" "}
                            {new Date(reservation.endTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                          {isActive && (
                            <Badge
                              variant="destructive"
                              className="mt-2 text-xs"
                            >
                              Em uso agora
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação - Mobile Optimized */}
                    {isActive && (
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openExtendDialog(reservation)}
                          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs h-9 border-blue-300 font-semibold"
                        >
                          <ClockIcon className="h-3.5 w-3.5 mr-1.5" />
                          Prolongar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCheckoutDialog(reservation)}
                          className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950 text-xs h-9 border-green-300 font-semibold"
                        >
                          <LogOut className="h-3.5 w-3.5 mr-1.5" />
                          Já saí
                        </Button>
                      </div>
                    )}

                    {/* Botão Cancelar */}
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950 text-xs h-8"
                      >
                        Cancelar Reserva
                      </Button>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {/* Reservation Dialog */}
      {selectedSpot && (
        <ReservationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          spotNumber={selectedSpot.number}
          spotId={selectedSpot.id}
          existingReservations={reservations
            .filter((r) => r.spotId === selectedSpot.id)
            .map((r) => ({
              startTime: r.startTime,
              endTime: r.endTime,
            }))}
          onConfirm={handleReservationConfirm}
        />
      )}

      {/* Extend Reservation Dialog */}
      {selectedReservation && (
        <ExtendReservationDialog
          open={extendDialogOpen}
          onOpenChange={setExtendDialogOpen}
          spotNumber={
            defaultParkingLot.spots.find(
              (s) => s.id === selectedReservation.spotId,
            )?.number || 0
          }
          currentEndTime={new Date(selectedReservation.endTime)}
          onConfirm={handleExtendReservation}
        />
      )}

      {/* Checkout Early Dialog */}
      <AlertDialog
        open={checkoutDialogOpen}
        onOpenChange={setCheckoutDialogOpen}
      >
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-green-600" />
              Confirmar Saída
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que já saiu da vaga? Isto irá liberar a vaga
              imediatamente e terminar sua reserva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto h-11">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCheckoutEarly}
              className="w-full sm:w-auto h-11 bg-green-600 hover:bg-green-700"
            >
              Sim, já saí
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
