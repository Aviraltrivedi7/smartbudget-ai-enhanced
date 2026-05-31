
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MonthYearPickerProps {
    value: string; // format: "month-year" e.g. "january-2025"
    onChange: (value: string) => void;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ value, onChange }) => {
    const { t, currentLanguage } = useLanguage();
    const [selectedMonth, selectedYear] = value.split('-');

    const months = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];

    const years = Array.from({ length: 2050 - 2026 + 1 }, (_, i) => (2026 + i).toString());

    const handleMonthSelect = (month: string) => {
        onChange(`${month}-${selectedYear}`);
    };

    const handleYearChange = (year: string) => {
        onChange(`${selectedMonth}-${year}`);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-[240px] justify-start text-left font-normal glass-effect hover:bg-white/20 transition-all duration-300",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {t(selectedMonth)} {selectedYear}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 glass-effect border-0 shadow-2xl animate-scaleIn backdrop-blur-xl bg-white/90">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Select value={selectedYear} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[120px] h-8 text-xs bg-white/50 border-0">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="max-h-48">
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                    const currentYear = parseInt(selectedYear);
                                    if (currentYear > 2026) handleYearChange((currentYear - 1).toString());
                                }}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                    const currentYear = parseInt(selectedYear);
                                    if (currentYear < 2050) handleYearChange((currentYear + 1).toString());
                                }}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {months.map((month) => (
                            <Button
                                key={month}
                                variant={selectedMonth === month ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-9 text-xs font-medium transition-all duration-200",
                                    selectedMonth === month
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105"
                                        : "hover:bg-blue-50 text-gray-600"
                                )}
                                onClick={() => handleMonthSelect(month)}
                            >
                                {t(month).substring(0, 3)}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default MonthYearPicker;
