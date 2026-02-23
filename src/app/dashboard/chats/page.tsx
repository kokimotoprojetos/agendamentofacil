'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
    id: string;
    conversation_id: string;
    direction: 'inbound' | 'outbound';
    content: string;
    created_at: string;
}

interface Conversation {
    id: string;
    customer_phone: string;
    last_message_at: string;
    messages?: Message[];
}

export default function ChatsPage() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (session?.user) {
            fetchConversations();
        }
    }, [session]);

    useEffect(() => {
        if (selectedId) {
            fetchMessages(selectedId);
        }
    }, [selectedId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/conversations');
            if (!response.ok) throw new Error('Falha ao buscar conversas');
            const convs = await response.json();

            setConversations(convs || []);
            if (convs && convs.length > 0 && !selectedId) {
                setSelectedId(convs[0].id);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (convId: string) => {
        setLoadingMessages(true);
        try {
            const response = await fetch(`/api/conversations/${convId}/messages`);
            if (!response.ok) throw new Error('Falha ao buscar mensagens');
            const msgs = await response.json();
            setMessages(msgs || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            fetchConversations();
            if (selectedId) fetchMessages(selectedId);
        }, 10000);
        return () => clearInterval(interval);
    }, [selectedId]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-140px)] items-center justify-center">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"></div>
                </div>
            </div>
        );
    }

    const selectedConv = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex h-[calc(100vh-140px)] gap-8 animate-fade-up">
            {/* Sidebar de Conversas */}
            <div className="w-[380px] glass rounded-[3rem] border-white/5 flex flex-col overflow-hidden premium-glow bg-[#0a0a0a]/40">
                <header className="px-10 py-8 border-b border-white/5">
                    <h2 className="text-2xl font-black text-white tracking-tighter">Fluxo de Diálogo</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Interações em Tempo Real</p>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4 scrollbar-hide">
                    {conversations.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 opacity-20">🔇</div>
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Nenhuma Atividade</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedId(conv.id)}
                                className={`w-full p-6 flex items-center gap-5 rounded-[2rem] transition-all group relative overflow-hidden ${selectedId === conv.id ? 'bg-indigo-600/10 border border-indigo-500/20 shadow-inner' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-black text-xs shrink-0 transition-all duration-500 ${selectedId === conv.id ? 'bg-indigo-600 text-white border-indigo-400 scale-105 shadow-xl shadow-indigo-600/20' : 'bg-white/5 text-slate-500 border-white/10 group-hover:border-indigo-500/30 group-hover:text-indigo-400'}`}>
                                    {conv.customer_phone.substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className={`font-black tracking-tight truncate text-base transition-colors ${selectedId === conv.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {conv.customer_phone}
                                        </p>
                                        <span className="text-[9px] text-slate-600 font-black uppercase tabular-nums">
                                            {conv.last_message_at ? format(new Date(conv.last_message_at), 'HH:mm', { locale: ptBR }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">Visualizar Histórico</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Janela de Chat */}
            <div className="flex-1 glass rounded-[3rem] border-white/5 flex flex-col overflow-hidden premium-glow relative bg-[#0a0a0a]/20">
                {!selectedId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-32 h-32 bg-indigo-600/5 rounded-[2.5rem] flex items-center justify-center text-5xl mb-10 border border-indigo-500/10 opacity-50">🛰️</div>
                        <h3 className="text-2xl font-black text-white tracking-tighter mb-4">Central de Inteligência</h3>
                        <p className="text-slate-600 text-sm max-w-sm font-medium leading-relaxed">Selecione uma transmissão ativa na barra lateral para monitorar o processamento da Linguagem Natural em tempo real.</p>
                    </div>
                ) : (
                    <>
                        {/* Header do Chat */}
                        <header className="px-12 py-10 border-b border-white/5 bg-slate-900/10 backdrop-blur-md flex items-center justify-between z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-2xl shadow-indigo-600/30">
                                    {selectedConv?.customer_phone.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter">{selectedConv?.customer_phone}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em]">IA Ativa</span>
                                        </div>
                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Monitoramento de Protocolo</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Área de Mensagens */}
                        <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="relative w-10 h-10">
                                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
                                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"></div>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                                    >
                                        <div
                                            className={`max-w-[65%] group relative ${msg.direction === 'outbound' ? 'text-right' : 'text-left'}`}
                                        >
                                            <div
                                                className={`px-8 py-5 rounded-[2.5rem] text-sm font-medium leading-relaxed tracking-tight shadow-2xl ${msg.direction === 'outbound'
                                                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/10'
                                                    : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <div className={`mt-3 flex items-center gap-3 opacity-30 text-[9px] font-black uppercase tracking-widest ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                                {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                                                {msg.direction === 'outbound' && (
                                                    <span className="text-indigo-400 text-xs">✓✓</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Banner de Processamento */}
                        <footer className="px-10 py-6 bg-indigo-600/5 border-t border-white/5">
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                                </div>
                                <p className="text-[10px] text-indigo-400/60 font-black uppercase tracking-[0.3em] py-1">O Agente IA Beautfy.ai está autogerenciando esta transmissão</p>
                            </div>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}
