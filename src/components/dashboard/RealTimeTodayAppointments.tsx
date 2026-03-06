'use client';

import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Appointment {
    id: string;
    name: string;
    service: string;
    timeRange: string;
    startTime: string;
}

interface Props {
    initialAppointments: Appointment[];
    tenantId: string;
}

export function RealTimeTodayAppointments({ initialAppointments, tenantId }: Props) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

    useEffect(() => {
        // Subscribe to changes in the appointments table for this tenant
        const channel = supabase
            .channel(`today-appointments-${tenantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                    filter: `tenant_id=eq.${tenantId}`
                },
                async (payload) => {
                    console.log('Real-time update received:', payload);

                    // Since we need joined data (service name), we fetch the specific updated/new row
                    // or just refresh the whole list for simplicity and consistency with the service logic
                    refreshAppointments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tenantId]);

    const refreshAppointments = async () => {
        try {
            const res = await fetch(`/api/dashboard/today?tenant_id=${tenantId}`);
            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error('Error refreshing appointments:', error);
        }
    };

    return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Agendamentos de Hoje</h3>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Ao vivo"></span>
                    <button className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-500">
                        <MoreHorizontal size={24} />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {appointments.length > 0 ? (
                    appointments.map((app, index) => (
                        <div
                            key={app.id}
                            className={`flex items-start gap-6 p-6 rounded-[2rem] transition-all hover:bg-slate-50 group border-l-4 ${index % 2 === 0 ? 'border-[var(--primary)] bg-slate-50/30' : 'border-slate-900'}`}
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Clock size={16} />
                                    <span className="text-sm font-bold">{app.timeRange}</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 leading-tight">
                                    {app.service}
                                </h4>
                                <p className="text-sm font-bold text-slate-600">
                                    {app.name}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-slate-600 font-bold text-lg">Nenhum agendamento para hoje.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
