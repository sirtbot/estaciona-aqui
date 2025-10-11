"use client";

import * as React from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  disabled,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(value);
  const [time, setTime] = React.useState<string>(
    `${value.getHours().toString().padStart(2, "0")}:${value.getMinutes().toString().padStart(2, "0")}`,
  );

  React.useEffect(() => {
    const [hours, minutes] = time.split(":").map(Number);
    if (
      !isNaN(hours) &&
      !isNaN(minutes) &&
      hours >= 0 &&
      hours < 24 &&
      minutes >= 0 &&
      minutes < 60
    ) {
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  }, [selectedDate, time]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:flex-1 justify-start text-left font-normal h-11",
                !selectedDate && "text-muted-foreground",
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP", { locale: pt })
              ) : (
                <span>Escolha a data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              initialFocus
              locale={pt}
            />
          </PopoverContent>
        </Popover>

        {/* Time Input - Native HTML5 */}
        <div className="relative w-full sm:w-40">
          <Input
            type="time"
            value={time}
            onChange={handleTimeChange}
            disabled={disabled}
            className="h-11 text-base"
          />
        </div>
      </div>
    </div>
  );
}
