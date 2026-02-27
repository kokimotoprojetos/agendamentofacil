'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Trash2, Clock, User, Phone,
    ChevronLeft, ChevronRight, X, Save, Check
} from 'lucide-react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, addDays, isSameMonth, isToday,
    isSameDay, parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Appointment = {
    id: string;
    customer_name: string;
    customer_phone: string;
    start_time: string;
    end_time: string;
    status: string;
    notes?: string;
    service: { name: string; duration: number; price: number };
};

type Service = { id: string; name: string; duration: number; price: number };

const STATUS_MAP: Record<string, { label: string; dot: string; badge: string }> = {
    scheduled: {
        label: 'Confirmado',
        dot: 'bg-emerald-500',
        badge: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    pending: {
        label: 'Pendente',
        dot: 'bg-amber-400',
        badge: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    completed: {
        label: 'Concluído',
        dot: 'bg-blue-400',
        badge: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    cancelled: {
        label: 'Cancelado',
        dot: 'bg-slate-400',
        badge: 'text-slate-600 bg-slate-50 border-slate-200'
    },
};

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function AgendaPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [monthCounts, setMonthCounts] = useState<Record<string, number>>({});
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        service_id: '', customer_name: '', customer_phone: '',
        date: format(new Date(), 'yyyy-MM-dd'), time: '09:00',
    });

    useEffect(() => {
        fetch('/api/services').then(r => r.json()).then(d => {
            if (Array.isArray(d)) setServices(d);
        });
    }, []);

    const fetchMonthCounts = useCallback(async (month: Date) => {
        const y = month.getFullYear();
        const m = month.getMonth() + 1;
        const res = await fetch(`/api/appointments/month?year=${y}&month=${m}`);
        const data = await res.json();
        setMonthCounts(data || {});
    }, []);

    useEffect(() => { fetchMonthCounts(currentMonth); }, [currentMonth, fetchMonthCounts]);

    const fetchDayAppointments = useCallback(async (date: Date) => {
        setLoading(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const res = await fetch(`/api/appointments?date=${dateStr}`);
            const data = await res.json();
            setAppointments(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDayAppointments(selectedDate); }, [selectedDate, fetchDayAppointments]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchDayAppointments(selectedDate);
            fetchMonthCounts(currentMonth);
        }, 30_000);
        return () => clearInterval(interval);
    }, [selectedDate, currentMonth, fetchDayAppointments, fetchMonthCounts]);

    const prevMonth = () => setCurrentMonth(m => subMonths(m, 1));
    const nextMonth = () => setCurrentMonth(m => addMonths(m, 1));

    const calendarDays: Date[] = [];
    const gridStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    let cursor = gridStart;
    while (cursor <= gridEnd) {
        calendarDays.push(cursor);
        cursor = addDays(cursor, 1);
    }

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        if (!isSameMonth(day, currentMonth)) setCurrentMonth(day);
    };

    const handleOpenModal = () => {
        setFormData({
            service_id: services[0]?.id || '',
            customer_name: '',
            customer_phone: '',
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: '09:00',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, start_time: `${formData.date}T${formData.time}:00` }),
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchDayAppointments(selectedDate);
                fetchMonthCounts(currentMonth);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleStatus = async (id: string, status: string) => {
        await fetch('/api/appointments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
        });
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        fetchMonthCounts(currentMonth);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este agendamento?')) return;
        await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
        fetchDayAppointments(selectedDate);
        fetchMonthCounts(currentMonth);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-6">
            <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Agenda</h1>
                    <p className="text-sm text-slate-600 mt-1">Clique em um dia para ver e gerenciar os agendamentos.</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
                >
                    <Plus size={18} /> Novo Agendamento
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                {/* CALENDAR */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                            <ChevronLeft size={18} className="text-slate-600" />
                        </button>
                        <h2 className="text-base font-bold text-slate-900 capitalize">
                            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                            <ChevronRight size={18} className="text-slate-600" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 border-b border-slate-100">
                        {WEEK_DAYS.map(d => (
                            <div key={d} className="py-3 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, i) => {
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const count = monthCounts[dayStr] || 0;
                            const hasAppts = count > 0;
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isTodays = isToday(day);

                            const bgClass =
                                isSelected && hasAppts ? 'bg-emerald-50' :
                                    hasAppts ? 'bg-emerald-50/50 hover:bg-emerald-50' :
                                        isSelected ? 'bg-indigo-50' :
                                            'hover:bg-slate-50';

                            const numClass =
                                isSelected && hasAppts ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40' :
                                    hasAppts && !isSelected ? 'ring-2 ring-emerald-500 text-emerald-700' :
                                        isSelected && isTodays ? 'bg-indigo-600 text-white font-black' :
                                            isSelected ? 'bg-indigo-600 text-white font-bold' :
                                                isTodays ? 'ring-1 ring-indigo-400 text-indigo-700 font-bold' :
                                                    'text-slate-600';

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDayClick(day)}
                                    className={`
                                        relative flex flex-col items-center pt-3 pb-4 min-h-[72px] transition-all border-b border-r border-slate-50
                                        ${bgClass}
                                        ${!isCurrentMonth ? 'opacity-25' : ''}
                                    `}
                                >
                                    {isTodays && (
                                        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                                            hoje
                                        </span>
                                    )}

                                    <span className={`
                                        w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all mt-1
                                        ${numClass}
                                    `}>
                                        {format(day, 'd')}
                                    </span>

                                    {hasAppts && (
                                        <span className={`
                                            mt-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black
                                            ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600'}
                                        `}>
                                            {count} {count === 1 ? 'horário' : 'horários'}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* DAY PANEL */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                            {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "EEEE", { locale: ptBR })}
                        </p>
                        <h3 className="text-2xl font-bold text-slate-900">
                            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            {appointments.length === 0 ? 'Nenhum agendamento' : `${appointments.length} agendamento(s)`}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="relative min-h-full py-4">
                                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(hour => (
                                    <div key={hour} className="flex group border-b border-slate-100 h-20 items-start relative">
                                        <div className="w-16 flex-shrink-0 text-center -mt-2">
                                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-600 transition-colors">
                                                {String(hour).padStart(2, '0')}:00
                                            </span>
                                        </div>
                                        <div className="flex-1" />
                                    </div>
                                ))}

                                {appointments.map(app => {
                                    const st = STATUS_MAP[app.status] || STATUS_MAP.pending;
                                    const dateObj = parseISO(app.start_time);
                                    const hour = dateObj.getHours();
                                    const minutes = dateObj.getMinutes();
                                    const startHourIdx = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].indexOf(hour);

                                    if (startHourIdx === -1) return null;

                                    const topPos = (startHourIdx * 80) + (minutes * 80 / 60) + 16;
                                    const duration = app.service?.duration || 60;
                                    const heightPos = (duration * 80 / 60) - 4;

                                    return (
                                        <div
                                            key={app.id}
                                            style={{ top: `${topPos}px`, height: `${heightPos}px` }}
                                            className={`
                                                absolute left-16 right-4 rounded-xl border-l-4 p-3 transition-all cursor-pointer group hover:z-20
                                                shadow-sm
                                                ${app.status === 'cancelled' ? 'bg-slate-100 border-slate-300 opacity-60' :
                                                    app.status === 'completed' ? 'bg-emerald-50 border-emerald-400' :
                                                        'bg-indigo-50 border-indigo-400 hover:bg-indigo-100'}
                                            `}
                                        >
                                            <div className="flex items-start justify-between gap-2 overflow-hidden h-full">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                                            {format(dateObj, 'HH:mm')}
                                                        </span>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                                    </div>
                                                    <h4 className="text-[13px] font-bold text-slate-900 leading-tight truncate">
                                                        {app.customer_name}
                                                    </h4>
                                                    <p className="text-[10px] font-medium text-slate-600 truncate opacity-80">
                                                        {app.service?.name} ({duration}m)
                                                    </p>
                                                </div>

                                                <div className="flex flex-col gap-1 items-end flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'completed'); }} title="Finalizar" className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                                                        <Check size={12} strokeWidth={3} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }} title="Excluir" className="p-1.5 bg-rose-100 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all">
                                                        <Trash2 size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {appointments.length === 0 && (
                                    <div className="absolute inset-x-16 inset-y-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center opacity-30">
                                            <Clock size={40} className="mx-auto mb-2 text-slate-500" />
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Horários Livres</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* NEW APPOINTMENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-br from-indigo-50 to-transparent p-8 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center"><Plus size={14} className="text-white" /></div>
                                    <h2 className="text-xl font-bold text-slate-900">Novo Agendamento</h2>
                                </div>
                                <p className="text-[11px] text-slate-500 uppercase tracking-widest">Registrar atendimento</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Serviço</label>
                                <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-400" value={formData.service_id} onChange={e => setFormData({ ...formData, service_id: e.target.value })}>
                                    <option value="">Selecione...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} — R$ {s.price} ({s.duration} min)</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Nome do Cliente</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input required type="text" placeholder="Ex: Maria Silva" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-400" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Telefone</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="text" placeholder="(11) 99999-9999" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-400" value={formData.customer_phone} onChange={e => setFormData({ ...formData, customer_phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Data</label>
                                    <input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-400" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Horário</label>
                                    <input required type="time" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-400" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Cancelar</button>
                                <button type="submit" disabled={saving} className="flex-[2] py-4 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={15} /> Agendar</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
