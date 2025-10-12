"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  X,
  ClockIcon,
  Settings,
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
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedCancelReservationId, setSelectedCancelReservationId] =
    useState<string | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header - Modern App Style */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-md opacity-30"></div>
                <div className="relative p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <ParkingCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  EstacionaAqui
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
                  {defaultParkingLot.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin")}
                className="h-9 w-9 p-0 relative group hover:bg-purple-50 dark:hover:bg-purple-950"
                title="Painel Administrativo"
              >
                <div className="absolute inset-0 bg-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400 relative z-10" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              </Button>
              <InstallButton />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadReservations(true)}
                disabled={isRefreshing}
                className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  className={`h-4 w-4 text-slate-600 dark:text-slate-400 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl px-3 py-2.5 border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Livre
                </span>
              </div>
              <span className="text-sm font-bold text-green-700 dark:text-green-400">
                {
                  defaultParkingLot.spots.filter(
                    (spot) =>
                      !reservations.some(
                        (r) =>
                          r.spotId === spot.id &&
                          new Date(r.startTime) <= new Date() &&
                          new Date(r.endTime) > new Date(),
                      ),
                  ).length
                }
              </span>
            </div>

            <div className="flex-1 flex items-center justify-between bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl px-3 py-2.5 border border-red-200/50 dark:border-red-800/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                  Ocupado
                </span>
              </div>
              <span className="text-sm font-bold text-red-700 dark:text-red-400">
                {activeReservations.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-7xl mx-auto pb-8">
        {/* Parking Grid */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-lg">
          <div className="p-4 md:p-6">
            <ParkingGrid
              parkingLot={defaultParkingLot}
              reservations={reservations}
              onSpotClick={handleSpotClick}
            />
          </div>
        </Card>

        {/* Active Reservations - Mobile Optimized */}
        {activeReservations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Minhas Reservas
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeReservations.length}{" "}
                  {activeReservations.length === 1
                    ? "reserva ativa"
                    : "reservas ativas"}
                </p>
              </div>
            </div>
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
                    className={`overflow-hidden border-0 shadow-md ${
                      isActive
                        ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20"
                        : "bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Spot Number Badge */}
                        <div className="relative">
                          <div
                            className={`absolute inset-0 rounded-xl blur-md opacity-40 ${
                              isActive ? "bg-red-500" : "bg-slate-400"
                            }`}
                          ></div>
                          <div
                            className={`relative flex items-center justify-center w-14 h-14 rounded-xl font-bold text-white shadow-lg ${
                              isActive
                                ? "bg-gradient-to-br from-red-500 to-red-600"
                                : "bg-gradient-to-br from-slate-400 to-slate-500"
                            }`}
                          >
                            <span className="text-xl">{spot?.number}</span>
                          </div>
                        </div>

                        {/* Reservation Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                <span className="text-base font-bold text-slate-900 dark:text-white truncate">
                                  {reservation.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                  {reservation.licensePlate}
                                </span>
                              </div>
                            </div>
                            {isActive && (
                              <Badge
                                variant="destructive"
                                className="ml-2 text-xs font-semibold animate-pulse"
                              >
                                ATIVA
                              </Badge>
                            )}
                          </div>

                          {/* Time Info */}
                          <div className="flex items-center gap-2 mt-3 p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
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
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Modern Design */}
                      {isActive && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openExtendDialog(reservation)}
                            className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 font-semibold h-10 shadow-sm"
                          >
                            <ClockIcon className="h-4 w-4 mr-1.5" />
                            Prolongar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCheckoutDialog(reservation)}
                            className="w-full bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 font-semibold h-10 shadow-sm"
                          >
                            <LogOut className="h-4 w-4 mr-1.5" />
                            Já saí
                          </Button>
                        </div>
                      )}

                      {/* Cancel Button */}
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCancelReservationId(reservation.id);
                            setCancelDialogOpen(true);
                          }}
                          className="w-full bg-red-50/50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 font-semibold h-10 shadow-sm"
                        >
                          <X className="h-4 w-4 mr-1.5" />
                          Cancelar Reserva
                        </Button>
                      </div>
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

      {/* Cancel Reservation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancelar Reserva
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta reserva? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto h-11">
              Não, manter reserva
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedCancelReservationId) {
                  handleCancelReservation(selectedCancelReservationId);
                }
                setCancelDialogOpen(false);
                setSelectedCancelReservationId(null);
              }}
              className="w-full sm:w-auto h-11 bg-red-600 hover:bg-red-700"
            >
              Sim, cancelar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
