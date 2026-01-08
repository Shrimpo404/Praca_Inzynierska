import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isBefore,
    startOfDay
} from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "./utils";

const Calendar = ({ selected, onSelect, disabled }) => {
    const [viewDate, setViewDate] = useState(selected || new Date());

    const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
    const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

    // Generowanie dni do wyświetlenia
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Tydzień zaczyna się od Niedzieli (jak na obrazku: Su)
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
        <div className="p-3 w-[280px] bg-white">
            {/* Header: Miesiąc, Rok i Nawigacja */}
            <div className="flex items-center justify-between mb-4 px-2">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>

                <h2 className="font-semibold text-gray-900">
                    {format(viewDate, "LLLL yyyy", { locale: pl })}
                </h2>

                <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
            </div>

            {/* Dni tygodnia */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm text-gray-400 font-medium py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Siatka dni */}
            <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map((day, idx) => {
                    const isSelected = selected && isSameDay(day, selected);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDisabled = disabled && disabled(day);

                    return (
                        <button
                            key={idx}
                            disabled={isDisabled}
                            onClick={() => onSelect(day)}
                            className={cn(
                                "h-9 w-9 flex items-center justify-center text-sm rounded-md transition-all relative",
                                isCurrentMonth ? "text-gray-900" : "text-gray-300",
                                isSelected && "bg-gray-100 font-bold",
                                !isSelected && !isDisabled && "hover:bg-gray-50 cursor-pointer",
                                isDisabled && "opacity-25 cursor-not-allowed"
                            )}
                        >
                            {format(day, "d")}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export { Calendar };