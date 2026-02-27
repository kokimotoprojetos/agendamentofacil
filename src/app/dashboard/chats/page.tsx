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
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Conversas</h1>
                <p className="text-sm text-slate-500 mt-1">Acompanhe as interações do agente IA com seus clientes.</p>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 'calc(100vh - 200px)' }}>
                <div className="flex h-full">
                    {/* Conversation list */}
                    <div className={`${selectedConvo ? 'hidden md:flex' : 'flex'} flex-col border-r border-slate-200 w-full md:w-[360px]`}>
                        <div className="p-4 border-b border-slate-100">
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar conversa..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-400 placeholder:text-slate-400 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-16 px-8">
                                    <p className="text-sm text-slate-400">Nenhuma conversa ainda</p>
                                </div>
                            ) : (
                                filtered.map(convo => (
                                    <button
                                        key={convo.id}
                                        onClick={() => setSelectedConvo(convo)}
                                        className={`w-full text-left px-4 py-4 border-b border-slate-100 transition-all ${selectedConvo?.id === convo.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-bold text-indigo-700">
                                                    {(convo.customer_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <h4 className="text-sm font-bold text-slate-900 truncate">{convo.customer_name || convo.customer_phone || 'Desconhecido'}</h4>
                                                    <span className="text-[10px] text-slate-400 flex-shrink-0">{formatTime(convo.last_message_at)}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{convo.last_message}</p>
                                            </div>
                                            {convo.unread_count > 0 && (
                                                <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
                    <div className={`${selectedConvo ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
                        {selectedConvo ? (
                            <>
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedConvo(null)}
                                        className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-all"
                                    >
                                        <ArrowLeft size={18} className="text-slate-600" />
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                                        <span className="text-sm font-bold text-indigo-700">
                                            {(selectedConvo.customer_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">{selectedConvo.customer_name || 'Desconhecido'}</h3>
                                        <p className="text-[10px] text-slate-400">{formatPhone(selectedConvo.remote_jid || selectedConvo.customer_phone || '')}</p>
                                    </div>
                                </div>

                                <div ref={messagesRef} className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
                                    {messagesLoading && messages.length === 0 ? (
                                        <div className="flex justify-center py-12">
                                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.direction === 'outbound'
                                                        ? 'bg-indigo-600 text-white rounded-br-md'
                                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                                                        }`}
                                                >
                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    <p className={`text-[9px] mt-1 ${msg.direction === 'outbound' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="px-6 py-4 border-t border-slate-100 bg-white">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-xs text-slate-400 italic">Respostas gerenciadas pelo Agente IA</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/30">
                                <div className="text-center max-w-xs">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Search size={28} className="text-indigo-400" /></div>
                                    <h3 className="font-bold text-slate-700 mb-1">Selecione uma conversa</h3>
                                    <p className="text-xs text-slate-400">Escolha uma conversa para ver o histórico completo de interações.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
