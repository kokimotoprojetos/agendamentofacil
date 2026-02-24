'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Clock, User, Phone, ChevronLeft, ChevronRight, X, Save, Check } from 'lucide-react';
import { format, addDays, subDays, parseISO, startOfWeek, endOfWeek, isToday, startOfDay } from 'date-fns';
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

type Service = {
    id: string;
    name: string;
    duration: number;
    price: number;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    scheduled: { label: 'Confirmado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    pending: { label: 'Pendente', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    completed: { label: 'Concluído', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    cancelled: { label: 'Cancelado', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

export default function AgendaPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        service_id: '',
        customer_name: '',
        customer_phone: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        notes: '',
    });

    const fetchAppointments = useCallback(async (date: Date) => {
        setLoading(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const res = await fetch(`/api/appointments?date=${dateStr}`);
            const data = await res.json();
            if (Array.isArray(data)) setAppointments(data);
        } catch (e) {
            console.error('Erro ao buscar agendamentos:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services');
            const data = await res.json();
            if (Array.isArray(data)) setServices(data);
        } catch (e) {
            console.error('Erro ao buscar serviços:', e);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        fetchAppointments(selectedDate);
    }, [selectedDate, fetchAppointments]);

    const prevDay = () => setSelectedDate(d => subDays(d, 1));
    const nextDay = () => setSelectedDate(d => addDays(d, 1));
    const goToday = () => setSelectedDate(new Date());

    const handleOpenModal = (defaultTime?: string) => {
        setFormData({
            service_id: services[0]?.id || '',
            customer_name: '',
            customer_phone: '',
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: defaultTime || '09:00',
            notes: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const start_time = `${formData.date}T${formData.time}:00`;
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: formData.service_id,
                    customer_name: formData.customer_name,
                    customer_phone: formData.customer_phone,
                    start_time,
                    notes: formData.notes,
                }),
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchAppointments(selectedDate);
            }
        } catch (e) {
            console.error('Erro ao criar agendamento:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await fetch('/api/appointments', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        } catch (e) {
            console.error('Erro ao atualizar status:', e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este agendamento?')) return;
        try {
            await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
            setAppointments(prev => prev.filter(a => a.id !== id));
        } catch (e) {
            console.error('Erro ao excluir agendamento:', e);
        }
    };

    // Build week days for the mini-week nav
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-up">
            <header className="mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Agenda</h1>
                    <p className="text-sm text-slate-400">Gerencie todos os seus agendamentos em um só lugar.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Novo Agendamento
                </button>
            </header>

            {/* Week Nav */}
            <div className="glass p-4 rounded-2xl border-white/5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevDay} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                        <ChevronLeft size={18} className="text-slate-400" />
                    </button>
                    <div className="text-center">
                        <p className="text-base font-bold text-white capitalize">
                            {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        {!isToday(selectedDate) && (
                            <button onClick={goToday} className="text-[11px] text-indigo-400 font-semibold hover:underline mt-0.5">
                                Ir para Hoje
                            </button>
                        )}
                    </div>
                    <button onClick={nextDay} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                        <ChevronRight size={18} className="text-slate-400" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(day => {
                        const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={`flex flex-col items-center py-2 rounded-xl transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                            >
                                <span className="text-[10px] font-bold uppercase">
                                    {format(day, 'EEE', { locale: ptBR })}
                                </span>
                                <span className={`text-sm font-bold mt-0.5 ${isToday(day) && !isSelected ? 'text-indigo-400' : ''}`}>
                                    {format(day, 'd')}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Appointment List */}
            <section className="glass p-6 rounded-3xl border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">
                        {appointments.length > 0 ? `${appointments.length} agendamento(s)` : 'Nenhum agendamento'}
                    </h2>
                    <span className="text-xs text-slate-500 capitalize">
                        {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Clock size={28} className="text-indigo-400" />
                        </div>
                        <p className="text-slate-400 font-medium mb-1">Nenhum agendamento para este dia</p>
                        <p className="text-slate-600 text-xs mb-6">Que tal criar o primeiro?</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-all"
                        >
                            Novo Agendamento
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {appointments.map(app => {
                            const st = STATUS_MAP[app.status] || STATUS_MAP.pending;
                            const startHour = format(parseISO(app.start_time), 'HH:mm');
                            const endHour = format(parseISO(app.end_time), 'HH:mm');
                            const initials = app.customer_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                            return (
                                <div key={app.id} className="flex items-stretch gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 transition-all group">
                                    {/* Time column */}
                                    <div className="flex flex-col items-center min-w-[56px] text-center justify-center border-r border-white/5 pr-4">
                                        <span className="text-sm font-bold text-white">{startHour}</span>
                                        <span className="text-[10px] text-slate-500 mt-0.5">{endHour}</span>
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                                        {initials}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{app.customer_name}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{app.service?.name}</p>
                                        {app.customer_phone && (
                                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                                                <Phone size={10} /> {app.customer_phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Right side */}
                                    <div className="flex flex-col items-end justify-between gap-2">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${st.color}`}>
                                            {st.label}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            {app.status !== 'completed' && (
                                                <button
                                                    onClick={() => handleStatusChange(app.id, 'completed')}
                                                    className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                    title="Marcar como Concluído"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            {app.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleStatusChange(app.id, 'cancelled')}
                                                    className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                                                    title="Cancelar"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(app.id)}
                                                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* NEW APPOINTMENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-br from-indigo-600/10 to-transparent p-8 border-b border-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                                            <Plus size={16} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white tracking-tight">Novo Agendamento</h2>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">Cadastro de atendimento</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-all bg-white/5 rounded-xl">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            {/* Service */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Serviço</label>
                                <select
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                                    value={formData.service_id}
                                    onChange={e => setFormData({ ...formData, service_id: e.target.value })}
                                >
                                    <option value="" className="bg-slate-900">Selecione um serviço...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id} className="bg-slate-900">
                                            {s.name} — R$ {s.price} ({s.duration} min)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Customer Name */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Nome do Cliente</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Maria Silva"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                                        value={formData.customer_name}
                                        onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Customer Phone */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Telefone / WhatsApp</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="(11) 99999-9999"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                                        value={formData.customer_phone}
                                        onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Data</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Horário</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-white/5 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] py-4 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Agendar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
