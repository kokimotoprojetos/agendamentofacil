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
            // 1. Get user profile and tenant
            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', (session?.user as any).id)
                .single();

            if (!profile) return;

            // 2. Get conversations
            const { data: convs, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('tenant_id', profile.tenant_id)
                .order('last_message_at', { ascending: false });

            if (error) throw error;
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
            const { data: msgs, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', convId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(msgs || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const selectedConv = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex h-[calc(100vh-160px)] gap-6 antialiased font-sans">
            {/* Sidebar de Conversas */}
            <div className="w-80 bg-[#0f0f0f] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white">Conversas</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            Nenhuma conversa encontrada.
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedId(conv.id)}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left ${selectedId === conv.id ? 'bg-purple-900/10 border-r-2 border-r-purple-500' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">
                                    {conv.customer_phone.substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white truncate text-sm">
                                        {conv.customer_phone}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {conv.last_message_at ? format(new Date(conv.last_message_at), 'HH:mm', { locale: ptBR }) : ''}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Janela de Chat */}
            <div className="flex-1 bg-[#0f0f0f] rounded-2xl border border-white/5 flex flex-col overflow-hidden relative">
                {!selectedId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <span className="text-5xl mb-4">💬</span>
                        <p>Selecione uma conversa para visualizar</p>
                    </div>
                ) : (
                    <>
                        {/* Header do Chat */}
                        <div className="p-4 border-b border-white/5 bg-[#141414] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                    {selectedConv?.customer_phone.substring(0, 2)}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{selectedConv?.customer_phone}</p>
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Área de Mensagens */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#050505]/30">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-xl ${msg.direction === 'outbound'
                                                    ? 'bg-purple-600 text-white rounded-tr-none'
                                                    : 'bg-[#1a1a1a] text-gray-200 border border-white/5 rounded-tl-none'
                                                }`}
                                        >
                                            <p className="leading-relaxed">{msg.content}</p>
                                            <p className={`text-[10px] mt-1.5 opacity-50 ${msg.direction === 'outbound' ? 'text-right' : 'text-left'}`}>
                                                {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input (Read-only por enquanto) */}
                        <div className="p-4 bg-[#141414] border-t border-white/5">
                            <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 text-gray-500 text-sm italic">
                                O Agente IA está respondendo estas mensagens automaticamente.
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
