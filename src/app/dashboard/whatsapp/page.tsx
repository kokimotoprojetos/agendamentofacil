'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSession } from 'next-auth/react';
import { Shield, Clock, Zap, AlertCircle, RefreshCw, LogOut } from 'lucide-react';

const WhatsAppIcon = ({ size = 20, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

export default function WhatsAppManager() {
    const { data: session, status: sessionStatus } = useSession();
    const [status, setStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);

    const checkStatus = async () => {
        try {
            const response = await fetch('/api/whatsapp/status');
            const data = await response.json();

            if (data.status === 'open') {
                setStatus('connected');
                setQrCode(null);
            } else {
                setStatus('disconnected');
            }
        } catch (error) {
            console.error('Error checking status:', error);
        }
    };

    const syncSettings = async () => {
        setSyncing(true);
        setSyncSuccess(false);
        setError(null);
        try {
            const response = await fetch('/api/debug/env', {
                method: 'POST',
            });

            const data = await response.json();
            if (response.ok) {
                setSyncSuccess(true);
                setTimeout(() => setSyncSuccess(false), 3000);
            } else {
                throw new Error(data.error || 'Falha na sincronização');
            }
        } catch (error: any) {
            console.error('Sync error:', error);
            setError('Erro ao sincronizar: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    const connectWhatsApp = async () => {
        if (sessionStatus === 'loading') return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/whatsapp/connect', {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.details?.message || data.error || 'Erro ao conectar ao WhatsApp';
                throw new Error(errorMsg);
            }

            if (data.code) {
                setQrCode(data.code);
            } else if (data.status === 'open' || data.instance?.state === 'open') {
                setStatus('connected');
            } else {
                throw new Error('Não foi possível gerar o QR Code. Tente novamente.');
            }
        } catch (error: any) {
            console.error('Failed to connect:', error);
            setError(error.message || 'Erro ao conectar ao WhatsApp. Verifique as configurações da API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(() => {
            if (status !== 'connected') {
                checkStatus();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [status]);

    const disconnectWhatsApp = async () => {
        if (!confirm('Tem certeza que deseja desconectar o WhatsApp? Isso interromperá o atendimento automático.')) return;

        setLoading(true);
        try {
            const response = await fetch('/api/whatsapp/disconnect', {
                method: 'POST',
            });

            if (response.ok) {
                setStatus('disconnected');
                setQrCode(null);
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao desconectar');
            }
        } catch (error: any) {
            console.error('Failed to disconnect:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-32 animate-fade-up">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Conectividade WhatsApp</h1>
                    <p className="text-slate-500 font-medium">Estabeleça a ponte de comunicação entre sua empresa e seus clientes.</p>
                </div>

                <div className={`flex items-center px-6 py-3 rounded-2xl border transition-all duration-500 ${status === 'connected' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}>
                    <span className={`relative flex h-2.5 w-2.5 mr-4`}>
                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'connected' ? 'animate-ping bg-emerald-400' : 'bg-rose-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{status === 'connected' ? 'Sistema Online' : 'Sistema Offline'}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <section className="glass p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden premium-glow">
                        {error && (
                            <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-3xl mb-12 animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500">
                                        <AlertCircle size={18} />
                                    </div>
                                    <h4 className="font-black text-rose-400 tracking-tight">Ocorrência de Rede</h4>
                                </div>
                                <p className="text-rose-400/80 text-xs font-medium leading-relaxed mb-6">{error}</p>
                                <div className="p-4 bg-black/40 rounded-2xl border border-rose-500/5">
                                    <p className="text-[9px] uppercase tracking-[.2em] text-rose-400/30 font-black mb-2">Internal Payload Error</p>
                                    <code className="text-[10px] text-rose-400/50 font-mono break-all leading-tight block">{error}</code>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col items-center py-6 text-center">
                            {status !== 'connected' ? (
                                qrCode ? (
                                    <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center">
                                        <div className="p-12 bg-white rounded-[3.5rem] shadow-[0_0_80px_rgba(255,255,255,0.1)] relative">
                                            <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full translate-y-10"></div>
                                            <QRCodeSVG value={qrCode} size={260} className="relative z-10" />
                                        </div>
                                        <p className="mt-12 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Escaneie com seu dispositivo</p>
                                        <button
                                            onClick={() => setQrCode(null)}
                                            className="mt-6 text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-all"
                                        >
                                            Solicitar Novo Sync-Code
                                        </button>
                                    </div>
                                ) : (
                                    <div className="max-w-md flex flex-col items-center">
                                        <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-10 group-hover:scale-110 transition-transform">
                                            <WhatsAppIcon size={48} />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">Vincular Instância Digital</h3>
                                        <p className="text-slate-500 mb-12 text-sm font-medium leading-relaxed">Para automatizar o agendamento, você deve autenticar seu número oficial com o núcleo cognitivo da Beautfy.ai.</p>
                                        <button
                                            onClick={connectWhatsApp}
                                            disabled={loading}
                                            className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {loading ? 'Inicializando Protocolo...' : 'Autorizar Conexão'}
                                        </button>
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center py-10 animate-in fade-in zoom-in-95 duration-1000">
                                    <div className="w-32 h-32 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center relative mb-10">
                                        <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping opacity-20"></div>
                                        <WhatsAppIcon size={48} className="text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">Instância Operacional</h3>
                                    <p className="text-slate-500 font-medium mb-12">Seu agendamento automático está ativo e respondendo aos clientes.</p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={syncSettings}
                                            disabled={syncing}
                                            className="px-8 py-3 bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-xl hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                        >
                                            {syncing ? 'Sincronizando...' : syncSuccess ? '✓ Sincronizado' : '⚙ Forçar Sync'}
                                        </button>
                                        <button
                                            onClick={disconnectWhatsApp}
                                            disabled={loading}
                                            className="px-8 py-3 bg-rose-500/10 border border-rose-500/10 text-[10px] font-black text-rose-400 uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <LogOut size={14} />
                                            Interromper Serviço
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <aside className="space-y-10">
                    <section className="glass p-10 rounded-[3rem] border-white/5 premium-glow">
                        <h4 className="text-white font-black text-lg tracking-tight mb-8">Arquitetura de Atendimento</h4>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex shrink-0 items-center justify-center text-indigo-400 border border-indigo-500/10">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-tight mb-1">Respostas Instantâneas</p>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">O Agente IA processa e responde mensagens em frações de segundo.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex shrink-0 items-center justify-center text-emerald-400 border border-emerald-500/10">
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-tight mb-1">Conexão Segura</p>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Sua comunicação é protegida pelo protocolo SSL e criptografia de ponta a ponta.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="glass p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white tracking-tight mb-3 italic">"Inteligência que converte"</h3>
                            <p className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">A conexão estável garante uma taxa de conversão 40% maior em horários de pico.</p>
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px]" />
                    </section>
                </aside>
            </div>
        </div>
    );
}
