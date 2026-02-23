'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, MoreVertical, Smartphone, User } from 'lucide-react';

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
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const selectedConv = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex h-[calc(100vh-140px)] gap-4 animate-fade-up">
            {/* Sidebar de Conversas */}
            <div className="w-80 glass rounded-2xl border-white/5 flex flex-col overflow-hidden">
                <header className="p-4 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white mb-4">Conversas</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar contato..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversations.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 px-4">
                            <p className="text-sm font-medium">Nenhuma conversa encontrada</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedId(conv.id)}
                                className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all ${selectedId === conv.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${selectedId === conv.id ? 'bg-primary text-white' : 'bg-white/5 text-slate-400'}`}>
                                    {conv.customer_phone.substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <p className={`font-semibold truncate text-sm ${selectedId === conv.id ? 'text-white' : 'text-slate-300'}`}>
                                            {conv.customer_phone}
                                        </p>
                                        <span className="text-[10px] text-slate-500 font-medium">
                                            {conv.last_message_at ? format(new Date(conv.last_message_at), 'HH:mm') : ''}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate">Atividade recente</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Janela de Chat */}
            <div className="flex-1 glass rounded-2xl border-white/5 flex flex-col overflow-hidden">
                {!selectedId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl mb-4 border border-white/5 opacity-50">💬</div>
                        <h3 className="text-lg font-bold text-white mb-2">Suas Conversas</h3>
                        <p className="text-slate-500 text-sm max-w-xs">Selecione uma conversa para ver o histórico de mensagens.</p>
                    </div>
                ) : (
                    <>
                        <header className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                                    {selectedConv?.customer_phone.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white leading-none mb-1">{selectedConv?.customer_phone}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Atendido pela IA</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-white transition-all">
                                <MoreVertical size={20} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] ${msg.direction === 'outbound' ? 'text-right' : 'text-left'}`}>
                                            <div
                                                className={`px-4 py-2 text-sm rounded-2xl inline-block ${msg.direction === 'outbound'
                                                    ? 'bg-primary text-white rounded-tr-none'
                                                    : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <div className="mt-1 flex items-center gap-1.5 px-1 opacity-40 text-[10px] font-medium text-slate-400">
                                                {format(new Date(msg.created_at), 'HH:mm')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <footer className="px-6 py-3 bg-white/[0.01] border-t border-white/5">
                            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                                <span className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                </span>
                                <span className="font-medium uppercase tracking-wider">Monitoramento de IA Ativo</span>
                            </div>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}
