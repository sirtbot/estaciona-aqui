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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-lg font-bold">
              {spotNumber}
            </div>
            <span>Prolongar Reserva</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Adicione mais tempo à sua reserva atual
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Tempo atual */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Término Atual
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <Label className="text-base">Adicionar Tempo</Label>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {extensionOptions.map((option) => (
                  <button
                    key={option.hours}
                    type="button"
                    onClick={() => setSelectedHours(option.hours)}
                    className={`
                      relative py-3 px-2 rounded-lg border-2 font-semibold text-sm transition-all
                      ${
                        selectedHours === option.hours
                          ? "bg-blue-500 text-white border-blue-600 shadow-lg scale-105"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
                      }
                    `}
                  >
                    +{option.label}
                    {option.popular && selectedHours !== option.hours && (
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

            {/* Novo horário de término */}
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div className="text-xs font-medium text-green-700 dark:text-green-400">
                  Novo Término
                </div>
              </div>
              <div className="text-base font-bold text-green-900 dark:text-green-100">
                {newEndTime.toLocaleString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                +{selectedHours >= 1 ? `${selectedHours}h` : `${selectedHours * 60} min`} adicionais
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
              className="w-full sm:w-auto h-12 text-base font-semibold"
            >
              Confirmar Prolongamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
