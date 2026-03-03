'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft } from 'lucide-react';

type Conversation = {
    id: string;
    remote_jid: string;
    customer_name: string;
    customer_phone: string;
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
        <div className="max-w-7xl mx-auto pb-10">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">Conversas</h1>
                <p className="text-sm text-white/50 mt-1">Acompanhe as interações do agente IA com seus clientes.</p>
            </div>

            <div className="bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl" style={{ height: 'calc(100vh - 200px)' }}>
                <div className="flex h-full">
                    {/* Conversation list */}
                    <div className={`${selectedConvo ? 'hidden md:flex' : 'flex'} flex-col border-r border-white/5 w-full md:w-[360px]`}>
                        <div className="p-4 border-b border-white/5">
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Buscar conversa..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#00e676]/50 placeholder:text-white/30 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-6 h-6 border-2 border-[#00e676] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-16 px-8">
                                    <p className="text-sm text-white/30">Nenhuma conversa ainda</p>
                                </div>
                            ) : (
                                filtered.map(convo => (
                                    <button
                                        key={convo.id}
                                        onClick={() => setSelectedConvo(convo)}
                                        className={`w-full text-left px-4 py-4 border-b border-white/5 transition-all ${selectedConvo?.id === convo.id ? 'bg-[#00e676]/10 border-l-4 border-l-[#00e676]' : 'hover:bg-white/[0.03]'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-bold text-[#00e676]">
                                                    {(convo.customer_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <h4 className="text-sm font-bold text-white truncate">{convo.customer_name || convo.customer_phone || 'Desconhecido'}</h4>
                                                    <span className="text-[10px] text-white/30 flex-shrink-0">{formatTime(convo.last_message_at)}</span>
                                                </div>
                                                <p className="text-xs text-white/50 truncate">{convo.last_message}</p>
                                            </div>
                                            {convo.unread_count > 0 && (
                                                <span className="w-5 h-5 bg-[#00e676] text-black text-[10px] font-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(0,230,118,0.3)]">
                                                    {convo.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className={`${selectedConvo ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-[#070905]`}>
                        {selectedConvo ? (
                            <>
                                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4 bg-[#0a0a0a]/50 backdrop-blur-md">
                                    <button
                                        onClick={() => setSelectedConvo(null)}
                                        className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-all"
                                    >
                                        <ArrowLeft size={18} className="text-white/60" />
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center">
                                        <span className="text-sm font-bold text-[#00e676]">
                                            {(selectedConvo.customer_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">{selectedConvo.customer_name || 'Desconhecido'}</h3>
                                        <p className="text-[10px] text-[#00e676]/70 font-medium">{formatPhone(selectedConvo.remote_jid || selectedConvo.customer_phone || '')}</p>
                                    </div>
                                </div>

                                <div ref={messagesRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {messagesLoading && messages.length === 0 ? (
                                        <div className="flex justify-center py-12">
                                            <div className="w-6 h-6 border-2 border-[#00e676] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.direction === 'outbound'
                                                        ? 'bg-[#00e676] text-black font-medium rounded-br-none shadow-[0_4px_12px_rgba(0,230,118,0.15)]'
                                                        : 'bg-white/5 text-white/90 border border-white/10 rounded-bl-none'
                                                        }`}
                                                >
                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    <p className={`text-[9px] mt-1.5 font-bold uppercase tracking-wider ${msg.direction === 'outbound' ? 'text-black/60' : 'text-white/30'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="px-6 py-4 border-t border-white/5 bg-[#0a0a0a]/50">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/10 border-dashed">
                                        <div className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
                                        <span className="text-[11px] text-white/40 font-bold uppercase tracking-widest">Respostas gerenciadas pelo Agente IA</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center max-w-xs">
                                    <div className="w-20 h-20 bg-[#00e676]/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#00e676]/10">
                                        <Search size={32} className="text-[#00e676]/40" />
                                    </div>
                                    <h3 className="font-bold text-white text-lg mb-2">Selecione uma conversa</h3>
                                    <p className="text-xs text-white/40 leading-relaxed font-medium">Escolha uma conversa para ver o histórico completo de interações e o acompanhamento da IA.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
