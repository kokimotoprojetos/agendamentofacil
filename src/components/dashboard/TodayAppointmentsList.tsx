'use client';

import React from 'react';
import { MoreHorizontal, Clock } from 'lucide-react';

interface Appointment {
    id: string;
    name: string;
    service: string;
    timeRange: string;
    startTime: string;
}

interface Props {
    appointments: Appointment[];
}

export function TodayAppointmentsList({ appointments }: Props) {
    return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Agendamentos de Hoje</h3>
                <button className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-500">
                    <MoreHorizontal size={24} />
                </button>
            </div>

            <div className="space-y-6">
                {appointments.length > 0 ? (
                    appointments.map((app, index) => (
                        <div
                            key={app.id}
                            className={`flex items-start gap-6 p-6 rounded-[2rem] transition-all hover:bg-slate-50 group border-l-4 ${index % 2 === 0 ? 'border-[var(--primary)] bg-slate-50/30' : 'border-slate-900'}`}
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Clock size={16} />
                                    <span className="text-sm font-bold">{app.timeRange}</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 leading-tight">
                                    {app.service}
                                </h4>
                                <p className="text-sm font-medium text-slate-500">
                                    {app.name}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 font-medium">Nenhum agendamento para hoje.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
