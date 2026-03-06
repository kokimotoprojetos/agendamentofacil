'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft } from 'lucide-react';

type Conversation = {
    id: string;
    remote_jid: string;
    customer_name: string;
    customer_phone: string;
    customer_picture?: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
};

type Message = {
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    created_at: string;
    sender_name?: string;
};

export default function ChatsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [search, setSearch] = useState('');
    const messagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 15_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedConvo) {
            fetchMessages(selectedConvo.id);
            const interval = setInterval(() => fetchMessages(selectedConvo.id), 10_000);
            return () => clearInterval(interval);
        }
    }, [selectedConvo]);

    useEffect(() => {
        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/conversations');
            const data = await res.json();
            if (Array.isArray(data)) setConversations(data);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        setMessagesLoading(true);
        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages`);
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } finally {
            setMessagesLoading(false);
        }
    };

    const filtered = conversations.filter(c =>
        (c.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.customer_phone || '').includes(search) ||
        (c.remote_jid || '').includes(search)
    );

    const formatPhone = (jid: string) => jid.replace('@s.whatsapp.net', '');

    const formatTime = (ts: string) => {
        const date = new Date(ts);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="max-w-full mx-auto pb-4 px-4 md:px-8">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Conversas</h1>
                    <p className="text-xs text-white/40">Interações em tempo real com seus clientes.</p>
                </div>
            </div>

            <div className="bg-[#0c0c0c] rounded-3xl overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]" style={{ height: 'calc(100vh - 160px)' }}>
                <div className="flex h-full">
                    {/* Conversation list */}
                    <div className={`${selectedConvo ? 'hidden md:flex' : 'flex'} flex-col border-r border-white/5 w-full md:w-[320px] lg:w-[350px] bg-[#0f0f0f]`}>
                        <div className="p-4 bg-[#0f0f0f]/80 backdrop-blur-xl sticky top-0 z-20">
                            <div className="relative group">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00e676]/50 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Procurar ou começar uma nova conversa"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 pl-11 pr-4 py-3 rounded-2xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00e676]/30 focus:bg-white/[0.05] placeholder:text-white/20 transition-all font-medium mb-1"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-8 h-8 border-2 border-[#00e676]/30 border-t-[#00e676] rounded-full animate-spin" />
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Carregando conversas</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-20 px-10">
                                    <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                        <Search size={24} className="text-white/10" />
                                    </div>
                                    <p className="text-xs text-white/30 font-medium">Nenhuma conversa encontrada</p>
                                </div>
                            ) : (
                                filtered.map(convo => (
                                    <button
                                        key={convo.id}
                                        onClick={() => setSelectedConvo(convo)}
                                        className={`w-full text-left px-5 py-4 border-b border-white/[0.02] transition-all relative ${selectedConvo?.id === convo.id ? 'bg-[#00e676]/5 active-convo' : 'hover:bg-white/[0.02]'}`}
                                    >
                                        {selectedConvo?.id === convo.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00e676] shadow-[0_0_15px_rgba(0,230,118,0.5)]" />
                                        )}
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex-shrink-0">
                                                {convo.customer_picture ? (
                                                    <img
                                                        src={convo.customer_picture}
                                                        alt={convo.customer_name}
                                                        className="w-12 h-12 rounded-full object-cover border border-white/10 ring-2 ring-transparent group-hover:ring-[#00e676]/20 transition-all"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00e676]/20 to-[#00e676]/5 border border-[#00e676]/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                                                        <span className="text-sm font-black text-[#00e676] tracking-tighter">
                                                            {(convo.customer_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00e676] border-2 border-[#0f0f0f] rounded-full shadow-lg" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className={`text-[14px] font-bold truncate transition-colors ${selectedConvo?.id === convo.id ? 'text-[#00e676]' : 'text-white/90'}`}>
                                                        {convo.customer_name || formatPhone(convo.customer_phone || convo.remote_jid || '')}
                                                    </h4>
                                                    <span className="text-[10px] text-white/30 font-medium whitespace-nowrap ml-2">
                                                        {formatTime(convo.last_message_at)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-[12px] truncate font-medium ${convo.unread_count > 0 ? 'text-white font-bold' : 'text-white/40'}`}>
                                                        {convo.last_message || 'Iniciando conversa...'}
                                                    </p>
                                                    {convo.unread_count > 0 && (
                                                        <span className="min-w-[18px] h-[18px] px-1 bg-[#00e676] text-black text-[9px] font-black rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,230,118,0.4)] animate-bounce-subtle">
                                                            {convo.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className={`${selectedConvo ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-[#090909] relative`}>
                        {/* WhatsApp Background Pattern Overlay (Subtle) */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://w0.peakpx.com/wallpaper/508/606/HD-wallpaper-whatsapp-dark-ststus-background-whatsapp-dark-mode.jpg')] bg-repeat" />

                        {selectedConvo ? (
                            <>
                                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0f0f0f]/80 backdrop-blur-xl z-20 sticky top-0">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setSelectedConvo(null)}
                                            className="md:hidden p-2 hover:bg-white/5 rounded-full transition-all"
                                        >
                                            <ArrowLeft size={18} className="text-white/60" />
                                        </button>
                                        <div className="relative cursor-pointer">
                                            {selectedConvo.customer_picture ? (
                                                <img
                                                    src={selectedConvo.customer_picture}
                                                    alt={selectedConvo.customer_name}
                                                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                                                />
                                            ) : (
                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00e676]/20 to-[#00e676]/5 border border-[#00e676]/20 flex items-center justify-center">
                                                    <span className="text-sm font-black text-[#00e676] tracking-tighter">
                                                        {(selectedConvo.customer_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-[15px] font-bold text-white truncate max-w-[200px] md:max-w-md">
                                                {selectedConvo.customer_name || formatPhone(selectedConvo.customer_phone || selectedConvo.remote_jid || '')}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse shadow-[0_0_8px_rgba(0,230,118,0.5)]" />
                                                <p className="text-[10px] text-[#00e676] font-bold uppercase tracking-widest opacity-90">Agente Online</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <div className="p-2.5 hover:bg-white/5 rounded-full text-white/30 cursor-pointer transition-colors">
                                            <Search size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 relative z-10 custom-scrollbar">
                                    <div className="flex justify-center mb-6">
                                        <span className="px-3 py-1 bg-white/[0.04] text-[10px] font-bold text-white/40 rounded-lg border border-white/5 uppercase tracking-[0.2em] shadow-sm">Hoje</span>
                                    </div>

                                    {messagesLoading && messages.length === 0 ? (
                                        <div className="flex items-center justify-center py-20">
                                            <div className="w-6 h-6 border-2 border-[#00e676]/20 border-t-[#00e676] rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`relative max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-lg transition-all hover:translate-y-[-1px] ${msg.direction === 'outbound'
                                                        ? 'bg-[#005c4b] text-white font-medium rounded-tr-none border border-[#005c4b]'
                                                        : 'bg-[#202c33] text-white/95 rounded-tl-none border border-white/[0.03]'
                                                        }`}
                                                >
                                                    {/* Message Tail */}
                                                    <div className={`absolute top-0 w-2.5 h-2.5 ${msg.direction === 'outbound'
                                                        ? 'right-[-7px] border-l-[10px] border-l-[#005c4b] border-b-[10px] border-b-transparent'
                                                        : 'left-[-7px] border-r-[10px] border-r-[#202c33] border-b-[10px] border-b-transparent'}`}
                                                    />

                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    <div className={`flex items-center justify-end gap-1.5 mt-1 opacity-50`}>
                                                        <span className="text-[9px] font-bold">
                                                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {msg.direction === 'outbound' && (
                                                            <div className="flex -space-x-1.5">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-[-8px]"><path d="M20 6 9 17l-5-5" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="px-6 py-4 border-t border-white/5 bg-[#0f0f0f]/80 backdrop-blur-xl z-20">
                                    <div className="flex items-center gap-3 px-5 py-3.5 bg-white/[0.03] rounded-2xl border border-white/5 group transition-all focus-within:bg-white/[0.05] focus-within:border-[#00e676]/20">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#00e676] animate-pulse shadow-[0_0_8px_rgba(0,230,118,0.5)]" />
                                        <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] group-focus-within:text-[#00e676]/50 transition-colors">
                                            IA AGENTE: Monitorando Conversa em Tempo Real
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 relative z-10 text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-[#00e676]/10 to-transparent rounded-[2.5rem] flex items-center justify-center mb-8 border border-[#00e676]/10 shadow-[0_20px_50px_rgba(0,230,118,0.05)] rotate-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                                </div>
                                <h3 className="font-black text-white text-xl mb-3 tracking-tight">WhatsApp Web AI</h3>
                                <p className="text-sm text-white/30 leading-relaxed font-medium max-w-sm mx-auto">
                                    Conecte-se com seus clientes em uma interface moderna e inteligente.
                                    Suas conversas são gerenciadas automaticamente pelo Agente IA.
                                </p>

                                <div className="mt-12 pt-12 border-t border-white/5 w-full max-w-xs">
                                    <div className="flex items-center justify-center gap-2 opacity-20">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Criptografia de ponta a ponta</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
