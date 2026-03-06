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
    const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

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
        <div className="max-w-6xl mx-auto pb-20 space-y-6 pt-24 lg:pt-12 p-6 lg:p-12">
            <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Agenda</h1>
                    <p className="text-sm text-white/50 mt-1">Clique em um dia para ver e gerenciar os agendamentos.</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00e676] text-black font-black text-sm rounded-xl shadow-lg shadow-[#00e676]/20 hover:bg-[#00c864] transition-all active:scale-95"
                >
                    <Plus size={18} /> Novo Agendamento
                </button>
            </header>

            <div className="flex flex-col gap-8">
                {/* CALENDAR */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                            <ChevronLeft size={18} className="text-white/40" />
                        </button>
                        <h2 className="text-base font-bold text-white capitalize">
                            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                            <ChevronRight size={18} className="text-white/40" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01]">
                        {WEEK_DAYS.map(d => (
                            <div key={d} className="py-3 text-center text-[10px] font-black text-white/30 uppercase tracking-widest">
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
                                isSelected && hasAppts ? 'bg-[#00e676]/10' :
                                    hasAppts ? 'bg-[#00e676]/5 hover:bg-[#00e676]/10' :
                                        isSelected ? 'bg-white/5' :
                                            'hover:bg-white/[0.02]';

                            const numClass =
                                isSelected && hasAppts ? 'bg-[#00e676] text-black shadow-md shadow-[#00e676]/40 font-black' :
                                    hasAppts && !isSelected ? 'ring-2 ring-[#00e676]/50 text-[#00e676] font-bold' :
                                        isSelected && isTodays ? 'bg-white text-black font-black' :
                                            isSelected ? 'bg-white/20 text-white font-bold' :
                                                isTodays ? 'ring-1 ring-white/30 text-white font-bold' :
                                                    'text-white/40';

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDayClick(day)}
                                    className={`
                                        relative flex flex-col items-center pt-3 pb-4 min-h-[72px] transition-all border-b border-r border-white/5
                                        ${bgClass}
                                        ${!isCurrentMonth ? 'opacity-10' : ''}
                                    `}
                                >
                                    {isTodays && (
                                        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-[#00e676] uppercase tracking-widest">
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
                                            ${isSelected ? 'bg-[#00e676]/20 text-[#00e676]' : 'bg-[#00e676]/10 text-[#00e676]'}
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
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl min-h-[600px]">
                    <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-xs font-black text-[#00e676]/50 uppercase tracking-widest mb-1">
                            {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "EEEE", { locale: ptBR })}
                        </p>
                        <h3 className="text-2xl font-bold text-white">
                            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                        </h3>
                        <p className="text-xs text-white/40 mt-1 font-medium">
                            {appointments.length === 0 ? 'Nenhum agendamento' : `${appointments.length} agendamento(s)`}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-black/20 relative">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-7 h-7 border-2 border-[#00e676] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="relative min-h-full py-4">
                                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(hour => (
                                    <div key={hour} className="flex group border-b border-white/[0.03] h-20 items-start relative">
                                        <div className="w-16 flex-shrink-0 text-center -mt-2">
                                            <span className="text-[10px] font-bold text-white/20 group-hover:text-white/40 transition-colors">
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
                                    const heightPos = Math.max(54, (duration * 80 / 60) - 4);
                                    const isShort = duration < 45;

                                    return (
                                        <div
                                            key={app.id}
                                            onClick={() => setSelectedApp(app)}
                                            style={{ top: `${topPos}px`, height: `${heightPos}px` }}
                                            className={`
                                                absolute left-16 right-4 rounded-xl border-l-4 p-2.5 transition-all cursor-pointer group hover:z-20
                                                shadow-xl flex flex-col justify-center backdrop-blur-sm
                                                ${app.status === 'cancelled' ? 'bg-white/5 border-white/20 opacity-40' :
                                                    app.status === 'completed' ? 'bg-[#00e676]/10 border-[#00e676]/60 shadow-[#00e676]/5' :
                                                        'bg-white/[0.07] border-white/30 hover:bg-white/[0.12] hover:border-[#00e676]/50'}
                                            `}
                                        >
                                            <div className="flex items-start justify-between gap-2 overflow-hidden h-full w-full">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">
                                                            {format(dateObj, 'HH:mm')}
                                                        </span>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${st.dot === 'bg-emerald-500' ? 'bg-[#00e676]' : st.dot}`} />
                                                        {isShort && (
                                                            <span className="text-[12px] font-bold text-white truncate flex-1">
                                                                {app.customer_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!isShort && (
                                                        <h4 className="text-[13px] font-bold text-white leading-tight truncate">
                                                            {app.customer_name}
                                                        </h4>
                                                    )}
                                                    <p className="text-[10px] font-bold text-[#00e676]/70 truncate uppercase tracking-tighter">
                                                        {app.service?.name} {isShort ? '' : `(${duration}m)`}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col gap-1 items-end flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'completed'); }} title="Finalizar" className="p-1.5 bg-[#00e676]/20 text-[#00e676] rounded-lg hover:bg-[#00e676] hover:text-black transition-all">
                                                        <Check size={12} strokeWidth={3} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }} title="Excluir" className="p-1.5 bg-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all">
                                                        <Trash2 size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {appointments.length === 0 && (
                                    <div className="absolute inset-x-16 inset-y-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center opacity-10">
                                            <Clock size={48} className="mx-auto mb-3 text-white" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Horários Livres</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DETAILS MODAL */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="bg-white/5 p-8 border-b border-white/5 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white">Detalhes do Agendamento</h2>
                                <p className="text-[10px] text-[#00e676] font-black uppercase tracking-widest mt-1">Status: {STATUS_MAP[selectedApp.status]?.label || selectedApp.status}</p>
                            </div>
                            <button onClick={() => setSelectedApp(null)} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#00e676]">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Cliente</p>
                                        <p className="text-base font-bold text-white">{selectedApp.customer_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#00e676]">
                                        <Phone size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Telefone</p>
                                        <p className="text-base font-bold text-white">{selectedApp.customer_phone || 'Não informado'}</p>
                                    </div>
                                    {selectedApp.customer_phone && (
                                        <button
                                            onClick={() => navigator.clipboard.writeText(selectedApp.customer_phone)}
                                            className="px-3 py-1.5 bg-[#00e676]/10 text-[#00e676] text-[10px] font-black rounded-lg hover:bg-[#00e676]/20 transition-all uppercase"
                                        >
                                            COPIAR
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#00e676]">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Horário</p>
                                        <p className="text-base font-bold text-white uppercase tabular-nums">
                                            {format(parseISO(selectedApp.start_time), "HH:mm")} — {format(parseISO(selectedApp.end_time), "HH:mm")}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                    <p className="text-[10px] font-black text-[#00e676] uppercase tracking-widest mb-3">Serviço solicitado</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm font-bold text-white">{selectedApp.service?.name}</p>
                                            <p className="text-xs text-white/40">{selectedApp.service?.duration} minutos</p>
                                        </div>
                                        <p className="text-lg font-black text-[#00e676] tabular-nums">R$ {selectedApp.service?.price}</p>
                                    </div>
                                </div>

                                {selectedApp.notes && (
                                    <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 border-dashed">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Observações</p>
                                        <p className="text-xs text-white/70 italic leading-relaxed">"{selectedApp.notes}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => { handleDelete(selectedApp.id); setSelectedApp(null); }}
                                    className="flex-1 py-4 bg-rose-500/10 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2 border border-rose-500/10"
                                >
                                    <Trash2 size={14} /> Excluir
                                </button>
                                {selectedApp.status !== 'completed' && (
                                    <button
                                        onClick={() => { handleStatus(selectedApp.id, 'completed'); setSelectedApp(null); }}
                                        className="flex-[2] py-4 bg-[#00e676] text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#00e676]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} /> Finalizar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW APPOINTMENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="bg-white/5 p-8 border-b border-white/5 flex justify-between items-start text-white">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 bg-[#00e676] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,230,118,0.3)]"><Plus size={16} className="text-black" /></div>
                                    <h2 className="text-xl font-bold">Novo Agendamento</h2>
                                </div>
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Registrar atendimento manual</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest">Serviço</label>
                                <select required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00e676]/50 transition-all font-medium appearance-none" value={formData.service_id} onChange={e => setFormData({ ...formData, service_id: e.target.value })}>
                                    <option value="" className="bg-[#1a1a1a]">Selecione um serviço...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id} className="bg-[#1a1a1a]">{s.name} — R$ {s.price} ({s.duration} min)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest">Nome do Cliente</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                        <input required type="text" placeholder="Ex: Maria Silva" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00e676]/50 placeholder:text-white/10 transition-all" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest">Telefone</label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                        <input type="text" placeholder="(11) 99999-9999" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00e676]/50 placeholder:text-white/10 transition-all" value={formData.customer_phone} onChange={e => setFormData({ ...formData, customer_phone: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest">Data</label>
                                    <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00e676]/50 transition-all [color-scheme:dark]" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-widest">Horário</label>
                                    <input required type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00e676]/50 transition-all [color-scheme:dark]" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 text-white/60 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Cancelar</button>
                                <button type="submit" disabled={saving} className="flex-[2] py-4 bg-[#00e676] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-[#00e676]/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                                    {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Save size={15} /> Confirmar Agendamento</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
