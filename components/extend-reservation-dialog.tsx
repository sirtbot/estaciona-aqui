"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExtendReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spotNumber: number;
  currentEndTime: Date;
  onConfirm: (additionalHours: number) => void;
}

export function ExtendReservationDialog({
  open,
  onOpenChange,
  spotNumber,
  currentEndTime,
  onConfirm,
}: ExtendReservationDialogProps) {
  const [selectedHours, setSelectedHours] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedHours);
    onOpenChange(false);
    setSelectedHours(1);
  };

  const extensionOptions = [
    { hours: 0.5, label: "30 min", popular: false },
    { hours: 1, label: "1h", popular: true },
    { hours: 1.5, label: "1h 30min", popular: false },
    { hours: 2, label: "2h", popular: true },
    { hours: 3, label: "3h", popular: false },
    { hours: 4, label: "4h", popular: false },
  ];

  const newEndTime = new Date(
    currentEndTime.getTime() + selectedHours * 60 * 60 * 1000,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-30"></div>
              <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-lg">
                {spotNumber}
              </div>
            </div>
            <span className="font-bold">Prolongar Reserva</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Adicione mais tempo à sua reserva atual
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Tempo atual */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Término Atual
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {currentEndTime.toLocaleString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Opções de prolongamento */}
            <div className="grid gap-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Tempo
              </Label>

              <div className="grid grid-cols-3 gap-2">
                {extensionOptions.map((option) => (
                  <button
                    key={option.hours}
                    type="button"
                    onClick={() => setSelectedHours(option.hours)}
                    className={`
                      relative py-3.5 px-2 rounded-xl border-2 font-bold text-sm transition-all
                      ${
                        selectedHours === option.hours
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg scale-105"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
                      }
                    `}
                  >
                    +{option.label}
                    {option.popular && selectedHours !== option.hours && (
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

            {/* Novo horário de término */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-green-200 dark:border-green-800 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">
                  Novo Término
                </div>
              </div>
              <div className="text-lg font-bold text-green-900 dark:text-green-100">
                {newEndTime.toLocaleString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                +
                {selectedHours >= 1
                  ? `${selectedHours}h`
                  : `${selectedHours * 60} min`}{" "}
                adicionais
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
              className="w-full sm:w-auto h-12 text-base font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
            >
              Confirmar Prolongamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
