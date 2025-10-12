"use client";

import { useState } from "react";
import { addHours, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/date-time-picker";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BUFFER_HOURS_BETWEEN_RESERVATIONS,
  MAX_ADVANCE_DAYS,
  AVAILABLE_DURATIONS,
  DEFAULT_DURATION,
} from "@/lib/reservation-config";

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spotNumber: number;
  existingReservations: Array<{
    startTime: Date | string;
    endTime: Date | string;
  }>;
  onConfirm: (data: {
    name: string;
    licensePlate: string;
    startTime: Date;
    endTime: Date;
  }) => void;
}

export function ReservationDialog({
  open,
  onOpenChange,
  spotNumber,
  existingReservations,
  onConfirm,
}: ReservationDialogProps) {
  const [name, setName] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  const now = new Date();
  const maxDate = addDays(now, MAX_ADVANCE_DAYS);

  // Calcular o horário mínimo baseado nas reservas existentes
  const getMinStartTime = () => {
    const futureReservations = existingReservations
      .map((r) => new Date(r.endTime))
      .filter((endTime) => endTime > now)
      .sort((a, b) => a.getTime() - b.getTime());

    if (futureReservations.length > 0) {
      // Adicionar margem de segurança após a última reserva
      return addHours(
        futureReservations[futureReservations.length - 1],
        BUFFER_HOURS_BETWEEN_RESERVATIONS,
      );
    }

    return now;
  };

  const minStartTime = getMinStartTime();
  const hasActiveReservation = minStartTime > now;

  const [reserveNow, setReserveNow] = useState(!hasActiveReservation);
  const [startTime, setStartTime] = useState<Date>(
    hasActiveReservation ? minStartTime : new Date(),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const actualStartTime =
      reserveNow && !hasActiveReservation
        ? new Date()
        : startTime < minStartTime
          ? minStartTime
          : startTime;
    const endTime = addHours(actualStartTime, parseFloat(duration));

    onConfirm({
      name,
      licensePlate: licensePlate.toUpperCase(),
      startTime: actualStartTime,
      endTime,
    });

    // Reset form
    setName("");
    setLicensePlate("");
    setReserveNow(!hasActiveReservation);
    setStartTime(hasActiveReservation ? minStartTime : new Date());
    setDuration(DEFAULT_DURATION);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-30"></div>
              <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-lg">
                {spotNumber}
              </div>
            </div>
            <span className="font-bold">Reservar Vaga</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            {hasActiveReservation ? (
              <span className="flex items-center gap-2 mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
                <span className="text-orange-700 dark:text-orange-300">
                  Vaga ocupada. Disponível a partir de{" "}
                  <strong>
                    {minStartTime.toLocaleString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </span>
              </span>
            ) : (
              "Preencha seus dados para reservar (até 48h de antecedência)"
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Nome Completo
              </Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 text-base border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500"
                autoComplete="name"
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="licensePlate"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Matrícula do Veículo
              </Label>
              <Input
                id="licensePlate"
                placeholder="AB-12-CD"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                required
                className="uppercase h-12 text-base border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500"
                maxLength={8}
              />
            </div>

            {!hasActiveReservation && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReserveNow(true)}
                  className={`
                    relative p-4 rounded-xl border-2 font-semibold transition-all
                    ${
                      reserveNow
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-blue-400"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm">Agora</span>
                  </div>
                  {reserveNow && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setReserveNow(false)}
                  className={`
                    relative p-4 rounded-xl border-2 font-semibold transition-all
                    ${
                      !reserveNow
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-blue-400"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm">Agendar</span>
                  </div>
                  {!reserveNow && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              </div>
            )}

            {(!reserveNow || hasActiveReservation) && (
              <DateTimePicker
                label="Início da Reserva"
                value={startTime < minStartTime ? minStartTime : startTime}
                onChange={setStartTime}
                minDate={minStartTime}
                maxDate={maxDate}
              />
            )}

            <div className="grid gap-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duração
              </Label>

              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={`
                      relative py-3.5 px-2 rounded-xl border-2 font-bold text-sm transition-all
                      ${
                        duration === d.value
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg scale-105"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
                      }
                    `}
                  >
                    {d.label}
                    {d.popular && duration !== d.value && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0 bg-amber-400 text-amber-900 border-0 font-semibold"
                      >
                        Popular
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview da reserva */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wide">
                Resumo da Reserva
              </div>
              <div className="text-sm text-slate-900 dark:text-slate-100 space-y-2">
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <span className="font-medium">Início:</span>
                  <span className="font-semibold">
                    {reserveNow && !hasActiveReservation
                      ? "Agora"
                      : (startTime < minStartTime
                          ? minStartTime
                          : startTime
                        ).toLocaleString("pt-PT", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <span className="font-medium">Término:</span>
                  <span className="font-semibold">
                    {addHours(
                      reserveNow && !hasActiveReservation
                        ? new Date()
                        : startTime < minStartTime
                          ? minStartTime
                          : startTime,
                      parseFloat(duration),
                    ).toLocaleString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-12 text-base font-semibold border-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name || !licensePlate}
              className="w-full sm:w-auto h-12 text-base font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Reserva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
