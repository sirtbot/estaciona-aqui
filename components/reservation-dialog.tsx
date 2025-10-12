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
  spotId: string;
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
  spotId,
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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-lg font-bold">
              {spotNumber}
            </div>
            <span>Reservar Vaga</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            {hasActiveReservation ? (
              <div className="flex items-center gap-2 mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
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
              </div>
            ) : (
              "Preencha seus dados para reservar (até 48h de antecedência)"
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-base">
                Nome Completo
              </Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 text-base"
                autoComplete="name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="licensePlate" className="text-base">
                Matrícula do Veículo
              </Label>
              <Input
                id="licensePlate"
                placeholder="AB-12-CD"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                required
                className="uppercase h-12 text-base"
                maxLength={8}
              />
            </div>

            {!hasActiveReservation && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <Label htmlFor="reserve-now" className="cursor-pointer flex-1">
                  <div className="font-semibold text-blue-900 dark:text-blue-100">
                    Reservar Agora
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Começar imediatamente
                  </div>
                </Label>
                <Switch
                  id="reserve-now"
                  checked={reserveNow}
                  onCheckedChange={setReserveNow}
                />
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
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <Label className="text-base">Duração</Label>
              </div>

              {/* Grid de botões para mobile */}
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={`
                      relative py-3 px-2 rounded-lg border-2 font-semibold text-sm transition-all
                      ${
                        duration === d.value
                          ? "bg-blue-500 text-white border-blue-600 shadow-lg scale-105"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
                      }
                    `}
                  >
                    {d.label}
                    {d.popular && duration !== d.value && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-2 -right-2 text-[9px] px-1 py-0"
                      >
                        Popular
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview da reserva */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Resumo
              </div>
              <div className="text-sm text-slate-900 dark:text-slate-100">
                <div className="flex items-center justify-between">
                  <span>Início:</span>
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
                <div className="flex items-center justify-between mt-1">
                  <span>Término:</span>
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
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-12 text-base"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name || !licensePlate}
              className="w-full sm:w-auto h-12 text-base font-semibold"
            >
              Confirmar Reserva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
