"use client";

import { ParkingSpot } from "./parking-spot";
import { ParkingLot, Reservation } from "@/lib/types";

interface ParkingGridProps {
  parkingLot: ParkingLot;
  reservations: Reservation[];
  onSpotClick: (spotId: string) => void;
}

export function ParkingGrid({
  parkingLot,
  reservations,
  onSpotClick,
}: ParkingGridProps) {
  const now = new Date();

  const getReservationForSpot = (spotId: string) => {
    return reservations.find(
      (r) =>
        r.spotId === spotId &&
        new Date(r.startTime) <= now &&
        new Date(r.endTime) > now,
    );
  };

  // Organizar spots por linhas para melhor responsividade
  const spotsByRow = parkingLot.spots.reduce(
    (acc, spot) => {
      const rowIndex = Math.floor(spot.y / 150); // Agrupa por linha baseado na posição Y
      if (!acc[rowIndex]) acc[rowIndex] = [];
      acc[rowIndex].push(spot);
      return acc;
    },
    {} as Record<number, typeof parkingLot.spots>,
  );

  // Ordenar spots dentro de cada linha pela posição X
  Object.values(spotsByRow).forEach((row) => {
    row.sort((a, b) => a.x - b.x);
  });

  const rows = Object.values(spotsByRow);

  return (
    <div className="w-full">
      {/* Vista Desktop - Grid Absoluto */}
      <div className="hidden md:block">
        <div
          className="relative bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-inner mx-auto"
          style={{
            width: `${parkingLot.width}px`,
            height: `${parkingLot.height}px`,
            maxWidth: "100%",
          }}
        >
          {parkingLot.spots.map((spot) => {
            const reservation = getReservationForSpot(spot.id);
            return (
              <ParkingSpot
                key={spot.id}
                spot={spot}
                isReserved={!!reservation}
                onClick={() => onSpotClick(spot.id)}
                reservationInfo={
                  reservation
                    ? {
                        name: reservation.name,
                        endTime: new Date(reservation.endTime),
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {/* Vista Mobile - Grid Responsivo */}
      <div className="md:hidden space-y-4">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="space-y-2">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2">
              Fila {rowIndex + 1}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {row.map((spot) => {
                const reservation = getReservationForSpot(spot.id);
                const isReserved = !!reservation;

                return (
                  <button
                    key={spot.id}
                    onClick={() => onSpotClick(spot.id)}
                    className={`
                      relative aspect-[3/2] rounded-lg border-2 transition-all duration-200
                      ${
                        isReserved
                          ? "bg-red-500 border-red-600 shadow-lg shadow-red-500/50"
                          : "bg-green-500 border-green-600 hover:bg-green-600 hover:scale-105 active:scale-95"
                      }
                    `}
                  >
                    {/* Número da Vaga */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                        {spot.number}
                      </span>
                    </div>

                    {/* Badge de Status */}
                    {isReserved && reservation && (
                      <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-red-300 dark:border-red-700 shadow">
                        Ocupado
                      </div>
                    )}

                    {/* Info de Reserva no Mobile */}
                    {isReserved && reservation && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded-b-md truncate">
                        {reservation.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legenda Mobile */}
      <div className="md:hidden mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-green-500 rounded border border-green-600"></div>
          <span className="text-slate-600 dark:text-slate-400">Livre</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-red-500 rounded border border-red-600"></div>
          <span className="text-slate-600 dark:text-slate-400">Ocupado</span>
        </div>
      </div>
    </div>
  );
}
