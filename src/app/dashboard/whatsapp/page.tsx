'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSession } from 'next-auth/react';

export default function WhatsAppManager() {
    const { data: session, status: sessionStatus } = useSession();
    const [status, setStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const [syncing, setSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);

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
        <div className="max-w-4xl mx-auto animate-fade-up">
            <div className="glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Conexão WhatsApp</h1>
                        <p className="text-slate-400 mt-2">Conecte seu número para ativar o agente automático.</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className={`flex items-center px-4 py-2 rounded-2xl border ${status === 'connected' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            <span className={`relative flex h-2 w-2 mr-3`}>
                                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'connected' ? 'animate-ping bg-emerald-400' : 'bg-rose-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest">{status === 'connected' ? 'Ativo' : 'Desconectado'}</span>
                        </div>

                        {status === 'connected' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={syncSettings}
                                    disabled={syncing}
                                    className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors"
                                >
                                    {syncing ? 'Sincronizando...' : syncSuccess ? '✓ Webhook OK' : '⚙ Sincronizar Webhook'}
                                </button>
                                <button
                                    onClick={disconnectWhatsApp}
                                    disabled={loading}
                                    className="text-[10px] font-bold text-rose-500/50 hover:text-rose-500 uppercase tracking-widest transition-colors"
                                >
                                    {loading ? '...' : 'Desconectar'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[2rem] mb-10 group">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl">⚠️</span>
                            <h4 className="font-bold text-rose-400">Erro de Conexão</h4>
                        </div>
                        <p className="text-rose-400/80 text-sm leading-relaxed mb-6">
                            {error}
                        </p>
                        <div className="p-4 bg-black/20 rounded-2xl border border-rose-500/5">
                            <p className="text-[10px] uppercase tracking-[.2em] text-rose-400/40 font-bold mb-2">Logs do Sistema</p>
                            <code className="text-xs text-rose-400/60 font-mono break-all">{error}</code>
                        </div>
                    </div>
                )}

                {status !== 'connected' && (
                    <div className="p-16 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/5 text-center flex flex-col items-center">
                        {qrCode ? (
                            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
                                <p className="mb-8 text-slate-300 font-medium">Aponte a câmera do WhatsApp para o código:</p>
                                <div className="p-8 bg-white rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                                    <QRCodeSVG value={qrCode} size={220} />
                                </div>
                                <button
                                    onClick={() => setQrCode(null)}
                                    className="mt-8 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Gerar Novo Código
                                </button>
                            </div>
                        ) : (
                            <div className="max-w-sm flex flex-col items-center">
                                <div className="w-24 h-24 bg-indigo-600/10 rounded-[2rem] border border-indigo-500/20 flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">
                                    📱
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Vincular Celular</h3>
                                <p className="text-slate-500 mb-8 text-sm leading-relaxed">Conecte seu número para que a Beautfy.ai possa atender seus clientes 24h por dia.</p>
                                <button
                                    onClick={connectWhatsApp}
                                    disabled={loading || sessionStatus === 'loading'}
                                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 tracking-tight"
                                >
                                    {loading ? 'Iniciando Conexão...' : 'Conectar Agora'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span className="text-indigo-400">💡</span> Dica
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Para melhores resultados, utilize um número exclusivo para o atendimento do seu salão e mantenha o aparelho carregado.
                        </p>
                    </div>
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span className="text-indigo-400">🔒</span> Segurança
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Suas mensagens são processadas em tempo real e não são armazenadas permanentemente em nossos servidores.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
