'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function DateSelector() {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
    const days = [
        { day: 8, label: 'Ter' },
        { day: 9, label: 'Qua', active: true },
        { day: 10, label: 'Qui' },
        { day: 11, label: 'Sex' },
        { day: 12, label: 'Sáb' },
        { day: 13, label: 'Dom' },
        { day: 14, label: 'Seg' },
    ];

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 mb-8">
            <div className="flex items-center justify-between mb-8 overflow-x-auto">
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <ChevronLeft size={20} className="text-slate-500" />
                    </button>
                    <div className="flex items-center gap-6 px-4">
                        {months.map((month) => (
                            <span
                                key={month}
                                className={`text-sm font-semibold cursor-pointer whitespace-nowrap ${month === 'Abr' ? 'text-slate-900 border-b-2 border-slate-900 pb-1' : 'text-slate-500'}`}
                            >
                                {month}
                            </span>
                        ))}
                    </div>
                    <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <ChevronRight size={20} className="text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4">
                {days.map((day) => (
                    <div
                        key={day.day}
                        className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all cursor-pointer ${day.active
                            ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20 scale-110'
                            : 'hover:bg-slate-50 text-slate-500'
                            }`}
                    >
                        <span className="text-lg font-bold mb-1">{day.day}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{day.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
