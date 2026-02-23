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
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const selectedConv = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 animate-fade-up">
            {/* Sidebar de Conversas */}
            <div className="w-80 glass rounded-[2rem] border-white/5 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Conversas</h2>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm italic">
                            Nenhuma conversa ativa.
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedId(conv.id)}
                                className={`w-full p-4 flex items-center gap-4 rounded-2xl transition-all group ${selectedId === conv.id ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105 ${selectedId === conv.id ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-white/5 text-indigo-400 border-white/10'}`}>
                                    {conv.customer_phone.substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-bold text-white truncate text-sm">
                                            {conv.customer_phone}
                                        </p>
                                        <span className="text-[10px] text-slate-500">
                                            {conv.last_message_at ? format(new Date(conv.last_message_at), 'HH:mm', { locale: ptBR }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">Clique para visualizar o chat</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Janela de Chat */}
            <div className="flex-1 glass rounded-[2rem] border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
                {!selectedId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <div className="w-20 h-20 bg-indigo-600/5 rounded-full flex items-center justify-center text-4xl mb-6">💬</div>
                        <p className="text-sm font-medium">Selecione uma conversa para começar</p>
                    </div>
                ) : (
                    <>
                        {/* Header do Chat */}
                        <div className="px-8 py-6 border-b border-white/5 bg-slate-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
                                    {selectedConv?.customer_phone.substring(0, 2)}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{selectedConv?.customer_phone}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">IA Monitorando</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Área de Mensagens */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-950/20">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-5 py-4 rounded-3xl text-sm shadow-xl ${msg.direction === 'outbound'
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                                                }`}
                                        >
                                            <p className="leading-relaxed">{msg.content}</p>
                                            <div className={`mt-2 flex items-center gap-2 opacity-50 text-[10px] font-medium ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                                {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                                                {msg.direction === 'outbound' && <span>✓✓</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Banner de Status */}
                        <div className="px-6 py-4 bg-indigo-600/5 border-t border-white/5 text-center">
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[.2em]">O Agente IA está respondendo estas mensagens em tempo real</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
