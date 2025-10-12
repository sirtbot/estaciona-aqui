"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Reservation } from "@/lib/types";
import { defaultParkingLot } from "@/lib/parking-data";
import {
  Calendar,
  Clock,
  Car,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function SpotLightPage() {
  const params = useParams();
  const spotNumber = parseInt(params.spotNumber as string);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [nextReservations, setNextReservations] = useState<Reservation[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isOccupied, setIsOccupied] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await fetch("/api/reservations");
        if (!response.ok) return;

        const reservations: Reservation[] = await response.json();
        const now = new Date();

        const spot = defaultParkingLot.spots.find(
          (s) => s.number === spotNumber,
        );
        if (!spot) return;

        const activeReservation = reservations.find(
          (r) =>
            r.spotId === spot.id &&
            new Date(r.startTime) <= now &&
            new Date(r.endTime) > now,
        );

        if (activeReservation) {
          setReservation(activeReservation);
          setIsOccupied(true);
        } else {
          setReservation(null);
          setIsOccupied(false);
        }

        const upcomingReservations = reservations
          .filter((r) => r.spotId === spot.id && new Date(r.startTime) > now)
          .sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
          )
          .slice(0, 3);

        setNextReservations(upcomingReservations);
      } catch (error) {
        console.error("Erro ao buscar reserva:", error);
      }
    };

    fetchReservation();
    const interval = setInterval(fetchReservation, 2000);

    return () => clearInterval(interval);
  }, [spotNumber]);

  useEffect(() => {
    if (!reservation || !isOccupied) {
      setTimeRemaining("");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const endTime = new Date(reservation.endTime);
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("EXPIRADO");
        setIsOccupied(false);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [reservation, isOccupied]);

  useEffect(() => {
    if (nextReservations.length === 0) return;

    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [nextReservations.length]);

  const getTimeUntilStart = (startTime: string | Date): string => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return "Começa agora";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `Em ${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `Em ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `Em ${minutes}m`;
    } else {
      const seconds = Math.floor(diff / 1000);
      return `Em ${seconds}s`;
    }
  };

  const formatTime = (date: string | Date): string => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-all duration-700 p-8 relative overflow-hidden ${
        isOccupied
          ? "bg-gradient-to-br from-red-600 via-red-500 to-red-700"
          : "bg-gradient-to-br from-green-500 via-green-400 to-emerald-600"
      }`}
    >
      {/* Efeito de fundo animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Número da Vaga */}
        <div className="text-center mb-12">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>
            <div className="relative text-white font-black drop-shadow-2xl">
              <div className="text-[12rem] leading-none tracking-tighter">
                {spotNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Status e Timer */}
        <div className="flex flex-col items-center gap-6 mb-16 w-full max-w-5xl mx-auto">
          {isOccupied ? (
            <>
              {timeRemaining && (
                <div className="inline-block bg-black/30 backdrop-blur-xl rounded-3xl px-16 py-8 border-2 border-white/40 shadow-2xl">
                  <div className="text-white text-7xl font-black tracking-tight">
                    {timeRemaining}
                  </div>
                </div>
              )}

              {reservation && (
                <div className="w-full bg-white/15 backdrop-blur-lg rounded-2xl border border-white/30 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm bg-red-500/40 text-white border border-red-400/30">
                          <XCircle className="w-5 h-5" />
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/30 text-white">
                          <span>OCUPADO</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-white" />
                        <div className="text-white text-3xl font-bold">
                          {reservation.name}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-white/90">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          <span className="text-lg font-medium">
                            {formatTime(reservation.startTime)} -{" "}
                            {formatTime(reservation.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="w-5 h-5" />
                          <span className="text-lg font-medium">
                            {reservation.licensePlate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="inline-flex items-center gap-4 bg-black/20 backdrop-blur-md rounded-3xl px-12 py-6 border-2 border-white/30">
              <CheckCircle
                className="w-8 h-8 text-green-200"
                strokeWidth={2.5}
              />
              <span className="text-white text-5xl font-bold tracking-wide">
                LIVRE
              </span>
            </div>
          )}
        </div>

        {/* Próximas Reservas */}
        {nextReservations.length > 0 && (
          <div className="w-full">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px flex-1 bg-white/30 max-w-xs"></div>
              <div className="inline-flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/30">
                <Calendar className="w-6 h-6 text-white" />
                <span className="text-white text-2xl font-bold tracking-wide">
                  PRÓXIMAS RESERVAS
                </span>
              </div>
              <div className="h-px flex-1 bg-white/30 max-w-xs"></div>
            </div>

            <div className="grid gap-5 max-w-5xl mx-auto">
              {nextReservations.map((res, index) => {
                const timeUntil = getTimeUntilStart(res.startTime);
                const isStartingSoon =
                  timeUntil.includes("m") &&
                  !timeUntil.includes("h") &&
                  !timeUntil.includes("d");
                const isImminent =
                  timeUntil.includes("s") && !timeUntil.includes("m");

                return (
                  <div
                    key={res.id}
                    className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                      isImminent
                        ? "bg-yellow-400/30 border-2 border-yellow-300 shadow-2xl shadow-yellow-500/50"
                        : isStartingSoon
                          ? "bg-orange-400/20 border-2 border-orange-300/50 shadow-lg"
                          : "bg-white/15 border border-white/30"
                    } backdrop-blur-lg`}
                  >
                    <div className="p-6">
                      {/* Header com badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm ${
                              isImminent
                                ? "bg-yellow-400 text-gray-900"
                                : isStartingSoon
                                  ? "bg-orange-400 text-white"
                                  : "bg-white/30 text-white"
                            }`}
                          >
                            {index + 1}ª
                          </div>
                          {index === 0 && (
                            <div
                              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${
                                isImminent
                                  ? "bg-yellow-400 text-gray-900"
                                  : "bg-white/30 text-white"
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>PRÓXIMA</span>
                            </div>
                          )}
                        </div>
                        {isImminent && (
                          <div className="flex items-center gap-2 text-yellow-200 text-sm font-bold">
                            <AlertTriangle className="w-5 h-5" />
                            <span>IMINENTE</span>
                          </div>
                        )}
                      </div>

                      {/* Conteúdo principal */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-6 h-6 text-white" />
                            <div className="text-white text-3xl font-bold">
                              {res.name}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5" />
                              <span className="text-lg font-medium">
                                {formatTime(res.startTime)} -{" "}
                                {formatTime(res.endTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="w-5 h-5" />
                              <span className="text-lg font-medium">
                                {res.licensePlate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Countdown */}
                        <div className="flex flex-col items-end">
                          <div
                            className={`text-5xl font-black ${
                              isImminent
                                ? "text-yellow-200"
                                : isStartingSoon
                                  ? "text-orange-200"
                                  : "text-white"
                            }`}
                          >
                            {timeUntil}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra inferior para reservas iminentes */}
                    {isImminent && (
                      <div className="h-1.5 bg-yellow-400 w-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Animação CSS customizada */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
