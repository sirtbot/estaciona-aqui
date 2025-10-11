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

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spotNumber: number;
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
  onConfirm,
}: ReservationDialogProps) {
  const [name, setName] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [reserveNow, setReserveNow] = useState(true);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [duration, setDuration] = useState("2");

  const now = new Date();
  const maxDate = addDays(now, 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const actualStartTime = reserveNow ? new Date() : startTime;
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
    setReserveNow(true);
    setStartTime(new Date());
    setDuration("2");
  };

  const durations = [
    { value: "0.5", label: "30 min", popular: false },
    { value: "1", label: "1h", popular: false },
    { value: "2", label: "2h", popular: true },
    { value: "3", label: "3h", popular: true },
    { value: "4", label: "4h", popular: true },
    { value: "6", label: "6h", popular: false },
    { value: "8", label: "8h", popular: false },
    { value: "12", label: "12h", popular: false },
    { value: "24", label: "24h", popular: false },
  ];

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
            Preencha seus dados para reservar (até 48h de antecedência)
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

            {!reserveNow && (
              <DateTimePicker
                label="Início da Reserva"
                value={startTime}
                onChange={setStartTime}
                minDate={now}
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
                {durations.map((d) => (
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
                    {reserveNow
                      ? "Agora"
                      : startTime.toLocaleString("pt-PT", {
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
                      reserveNow ? new Date() : startTime,
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
