"use client";

import { cn } from "@/lib/utils";
import { ParkingSpot as ParkingSpotType } from "@/lib/types";

interface ParkingSpotProps {
  spot: ParkingSpotType;
  isReserved: boolean;
  onClick: () => void;
  reservationInfo?: {
    name: string;
    endTime: Date;
  };
}

export function ParkingSpot({
  spot,
  isReserved,
  onClick,
  reservationInfo,
}: ParkingSpotProps) {
  return (
    <div
      className={cn(
        "absolute cursor-pointer transition-all duration-300 border-2 rounded-lg flex items-center justify-center font-bold text-sm active:scale-95 touch-manipulation",
        isReserved
          ? "bg-red-500 border-red-700 text-white hover:bg-red-600 active:bg-red-700 shadow-lg"
          : "bg-green-500 border-green-700 text-white hover:bg-green-600 active:bg-green-700 shadow-md hover:shadow-lg",
      )}
      style={{
        left: `${spot.x}px`,
        top: `${spot.y}px`,
        width: `${spot.width}px`,
        height: `${spot.height}px`,
        transform: spot.rotation ? `rotate(${spot.rotation}deg)` : undefined,
      }}
      onClick={onClick}
      title={
        isReserved && reservationInfo
          ? `Reservado: ${reservationInfo.name} até ${reservationInfo.endTime.toLocaleString()}`
          : `Vaga ${spot.number} - Disponível`
      }
    >
      <div className="text-center pointer-events-none">
        <div className="text-xl font-black">{spot.number}</div>
        {isReserved && reservationInfo && (
          <div className="text-[10px] opacity-90 font-semibold mt-0.5">
            {reservationInfo.endTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
