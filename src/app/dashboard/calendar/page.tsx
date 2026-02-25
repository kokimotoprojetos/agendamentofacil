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
        badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    pending: {
        label: 'Pendente',
        dot: 'bg-amber-400',
        badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    completed: {
        label: 'Concluído',
        dot: 'bg-blue-400',
        badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    cancelled: {
        label: 'Cancelado',
        dot: 'bg-slate-600',
        badge: 'text-slate-400 bg-slate-500/10 border-slate-500/20'
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

    // ── Fetch services (once) ──────────────────────────────────────────────────
    useEffect(() => {
        fetch('/api/services').then(r => r.json()).then(d => {
            if (Array.isArray(d)) setServices(d);
        });
    }, []);

    // ── Fetch appointment counts for the month (for calendar dots) ─────────────
    const fetchMonthCounts = useCallback(async (month: Date) => {
        const y = month.getFullYear();
        const m = month.getMonth() + 1;
        const res = await fetch(`/api/appointments/month?year=${y}&month=${m}`);
        const data = await res.json();
        setMonthCounts(data || {});
    }, []);

    useEffect(() => { fetchMonthCounts(currentMonth); }, [currentMonth, fetchMonthCounts]);

    // ── Fetch appointments for the selected day ────────────────────────────────
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

    // ── Auto-refresh every 30s — picks up AI-made changes (bookings/cancellations) ──
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDayAppointments(selectedDate);
            fetchMonthCounts(currentMonth);
        }, 30_000);
        return () => clearInterval(interval);
    }, [selectedDate, currentMonth, fetchDayAppointments, fetchMonthCounts]);

    // ── Month navigation ──────────────────────────────────────────────────────
    const prevMonth = () => setCurrentMonth(m => subMonths(m, 1));
    const nextMonth = () => setCurrentMonth(m => addMonths(m, 1));

    // ── Build calendar grid ───────────────────────────────────────────────────
    const calendarDays: Date[] = [];
    const gridStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    let cursor = gridStart;
    while (cursor <= gridEnd) {
        calendarDays.push(cursor);
        cursor = addDays(cursor, 1);
    }

    // ── Handlers ──────────────────────────────────────────────────────────────
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
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Agenda</h1>
                    <p className="text-sm text-slate-500 mt-1">Clique em um dia para ver e gerenciar os agendamentos.</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
                >
                    <Plus size={18} /> Novo Agendamento
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                {/* ── CALENDAR ────────────────────────────────────────────────── */}
                <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                            <ChevronLeft size={18} className="text-slate-400" />
                        </button>
                        <h2 className="text-base font-bold text-white capitalize">
                            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                            <ChevronRight size={18} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Week day headers */}
                    <div className="grid grid-cols-7 border-b border-white/5">
                        {WEEK_DAYS.map(d => (
                            <div key={d} className="py-3 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, i) => {
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const count = monthCounts[dayStr] || 0;
                            const hasAppts = count > 0;
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isTodays = isToday(day);

                            // Background color priority: selected+appts > appts > selected > today > default
                            const bgClass =
                                isSelected && hasAppts ? 'bg-emerald-600/20' :
                                    hasAppts ? 'bg-emerald-500/8 hover:bg-emerald-500/15' :
                                        isSelected ? 'bg-white/8' :
                                            'hover:bg-white/[0.04]';

                            // Number circle priority: selected+appts > appts > selected > today > default
                            const numClass =
                                isSelected && hasAppts ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40' :
                                    hasAppts && !isSelected ? 'ring-2 ring-emerald-500 text-emerald-300' :
                                        isSelected && isTodays ? 'bg-white text-slate-900 font-black' :
                                            isSelected ? 'bg-white/90 text-slate-900 font-bold' :
                                                isTodays ? 'ring-1 ring-white/50 text-white font-bold' :
                                                    'text-slate-400';

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDayClick(day)}
                                    className={`
                                        relative flex flex-col items-center pt-3 pb-4 min-h-[72px] transition-all border-b border-r border-white/[0.03]
                                        ${bgClass}
                                        ${!isCurrentMonth ? 'opacity-25' : ''}
                                    `}
                                >
                                    {/* Today label */}
                                    {isTodays && (
                                        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                                            hoje
                                        </span>
                                    )}

                                    {/* Day number */}
                                    <span className={`
                                        w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all mt-1
                                        ${numClass}
                                    `}>
                                        {format(day, 'd')}
                                    </span>

                                    {/* Appointment count badge */}
                                    {hasAppts && (
                                        <span className={`
                                            mt-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black
                                            ${isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-500/20 text-emerald-400'}
                                        `}>
                                            {count} {count === 1 ? 'horário' : 'horários'}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── DAY PANEL ────────────────────────────────────────────────── */}
                <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                    {/* Day panel header */}
                    <div className="px-6 py-5 border-b border-white/5">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                            {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "EEEE", { locale: ptBR })}
                        </p>
                        <h3 className="text-2xl font-bold text-white">
                            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            {appointments.length === 0 ? 'Nenhum agendamento' : `${appointments.length} agendamento(s)`}
                        </p>
                    </div>

                    {/* Timeline view */}
                    <div className="flex-1 overflow-y-auto bg-slate-900/40 relative">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="relative min-h-full py-4">
                                {/* Hour Lines */}
                                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(hour => (
                                    <div key={hour} className="flex group border-b border-white/[0.03] h-20 items-start relative">
                                        <div className="w-16 flex-shrink-0 text-center -mt-2">
                                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
                                                {String(hour).padStart(2, '0')}:00
                                            </span>
                                        </div>
                                        <div className="flex-1" />
                                    </div>
                                ))}

                                {/* Appointments positioned on timeline */}
                                {appointments.map(app => {
                                    const st = STATUS_MAP[app.status] || STATUS_MAP.pending;
                                    const dateObj = parseISO(app.start_time);
                                    const hour = dateObj.getHours();
                                    const minutes = dateObj.getMinutes();
                                    const startHourIdx = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].indexOf(hour);

                                    if (startHourIdx === -1) return null; // Outside display range

                                    const topPos = (startHourIdx * 80) + (minutes * 80 / 60) + 16;
                                    const duration = app.service?.duration || 60;
                                    const heightPos = (duration * 80 / 60) - 4; // -4 for spacing

                                    const initials = app.customer_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                                    return (
                                        <div
                                            key={app.id}
                                            style={{ top: `${topPos}px`, height: `${heightPos}px` }}
                                            className={`
                                                absolute left-16 right-4 rounded-xl border-l-4 p-3 transition-all cursor-pointer group hover:z-20
                                                shadow-xl shadow-black/20 backdrop-blur-sm
                                                ${app.status === 'cancelled' ? 'bg-slate-800/40 border-slate-600 opacity-60' :
                                                    app.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/50' :
                                                        'bg-indigo-500/10 border-indigo-500/50 hover:bg-indigo-500/20'}
                                            `}
                                        >
                                            <div className="flex items-start justify-between gap-2 overflow-hidden h-full">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none">
                                                            {format(dateObj, 'HH:mm')}
                                                        </span>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                                    </div>
                                                    <h4 className="text-[13px] font-bold text-white leading-tight truncate">
                                                        {app.customer_name}
                                                    </h4>
                                                    <p className="text-[10px] font-medium text-slate-400 truncate opacity-80">
                                                        {app.service?.name} ({duration}m)
                                                    </p>
                                                </div>

                                                <div className="flex flex-col gap-1 items-end flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={(e) => { e.stopPropagation(); handleStatus(app.id, 'completed'); }} title="Finalizar" className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                                                        <Check size={12} strokeWidth={3} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }} title="Excluir" className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all">
                                                        <Trash2 size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Empty state if no appointments */}
                                {appointments.length === 0 && (
                                    <div className="absolute inset-x-16 inset-y-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center opacity-20">
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

            {/* ── NEW APPOINTMENT MODAL ────────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-br from-indigo-600/10 to-transparent p-8 border-b border-white/5 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center"><Plus size={14} className="text-white" /></div>
                                    <h2 className="text-xl font-bold text-white">Novo Agendamento</h2>
                                </div>
                                <p className="text-[11px] text-slate-500 uppercase tracking-widest">Registrar atendimento</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            {/* Service */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Serviço</label>
                                <select required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50" value={formData.service_id} onChange={e => setFormData({ ...formData, service_id: e.target.value })}>
                                    <option value="" className="bg-slate-900">Selecione...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id} className="bg-slate-900">{s.name} — R$ {s.price} ({s.duration} min)</option>
                                    ))}
                                </select>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Nome do Cliente</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input required type="text" placeholder="Ex: Maria Silva" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Telefone</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="text" placeholder="(11) 99999-9999" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50" value={formData.customer_phone} onChange={e => setFormData({ ...formData, customer_phone: e.target.value })} />
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Data</label>
                                    <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Horário</label>
                                    <input required type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Cancelar</button>
                                <button type="submit" disabled={saving} className="flex-[2] py-4 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
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
