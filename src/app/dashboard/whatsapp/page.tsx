'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, RefreshCw, Power, Wifi, WifiOff, Loader2 } from 'lucide-react';

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

type ConnectionState = 'open' | 'close' | 'connecting' | 'unknown';
type InstanceInfo = {
    instanceName: string;
    owner: string;
    profileName: string;
    profilePictureUrl?: string;
    state: ConnectionState;
} | null;

export default function WhatsAppPage() {
    const [instanceInfo, setInstanceInfo] = useState<InstanceInfo>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/whatsapp/status');
            const data = await res.json();

            if (res.ok) {
                // API returns { status: "open"|"close"|..., details: { instance: {...} } }
                const details = data.details?.instance || {};
                setInstanceInfo({
                    instanceName: details.instanceName || '',
                    owner: details.owner || '',
                    profileName: details.profileName || details.profilePicUrl ? details.profileName : '',
                    profilePictureUrl: details.profilePicUrl || undefined,
                    state: (data.status || 'unknown') as ConnectionState,
                });
                setError(null);
                if (data.status === 'open') setQrCode(null);
            } else {
                setError(data.error || 'Erro ao buscar status');
            }
        } catch {
            setError('Erro de conexão');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10_000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const handleConnect = async () => {
        setActionLoading('connect');
        setError(null);
        try {
            const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
            const data = await res.json();
            if (data.qrcode) {
                setQrCode(data.qrcode);
            } else if (data.error) {
                setError(data.error);
            }
        } catch {
            setError('Erro ao gerar QR Code');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Deseja desconectar o WhatsApp?')) return;
        setActionLoading('disconnect');
        try {
            await fetch('/api/whatsapp/disconnect', { method: 'POST' });
            setInstanceInfo(prev => prev ? { ...prev, state: 'close' } : null);
            setQrCode(null);
        } catch {
            setError('Erro ao desconectar');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRestart = async () => {
        setActionLoading('restart');
        try {
            await fetch('/api/whatsapp/restart', { method: 'POST' });
            setTimeout(fetchStatus, 3000);
        } catch {
            setError('Erro ao reiniciar');
        } finally {
            setTimeout(() => setActionLoading(null), 3000);
        }
    };

    const getStateConfig = (state: ConnectionState) => {
        switch (state) {
            case 'open': return {
                label: 'Conectado',
                color: 'text-emerald-700',
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                dot: 'bg-emerald-500',
                icon: Wifi,
            };
            case 'connecting': return {
                label: 'Conectando...',
                color: 'text-amber-700',
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                dot: 'bg-amber-400',
                icon: Loader2,
            };
            default: return {
                label: 'Desconectado',
                color: 'text-slate-600',
                bg: 'bg-slate-50',
                border: 'border-slate-200',
                dot: 'bg-slate-400',
                icon: WifiOff,
            };
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const state = instanceInfo?.state || 'unknown';
    const stateConfig = getStateConfig(state);
    const StateIcon = stateConfig.icon;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg border border-emerald-100">
                        <WhatsAppIcon size={22} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">WhatsApp</h1>
                </div>
                <p className="text-sm text-slate-600">Gerencie a conexão do seu número com o agente de IA.</p>
            </header>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
                    <span className="text-rose-500">⚠️</span>
                    <p className="text-sm text-rose-700 font-medium">{error}</p>
                </div>
            )}

            {/* Status Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden mb-6">
                <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
                                <Smartphone size={28} className="text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    WhatsApp Business
                                </h3>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${stateConfig.bg} ${stateConfig.color} ${stateConfig.border}`}>
                                    <span className={`w-2 h-2 rounded-full ${stateConfig.dot} ${state === 'connecting' ? 'animate-pulse' : ''}`}></span>
                                    <StateIcon size={12} className={state === 'connecting' ? 'animate-spin' : ''} />
                                    {stateConfig.label}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {state === 'open' ? (
                                <>
                                    <button
                                        onClick={handleRestart}
                                        disabled={!!actionLoading}
                                        className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 border border-slate-200"
                                    >
                                        <RefreshCw size={16} className={actionLoading === 'restart' ? 'animate-spin' : ''} />
                                        Reconectar
                                    </button>
                                    <button
                                        onClick={handleDisconnect}
                                        disabled={!!actionLoading}
                                        className="flex items-center gap-2 px-5 py-3 bg-rose-50 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-100 transition-all disabled:opacity-50 border border-rose-200"
                                    >
                                        <Power size={16} />
                                        Desconectar
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleConnect}
                                    disabled={!!actionLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {actionLoading === 'connect' ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <WhatsAppIcon size={16} />
                                    )}
                                    Gerar QR Code
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code */}
            {qrCode && (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden mb-6">
                    <div className="p-8 text-center">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Escaneie o QR Code</h3>
                        <p className="text-sm text-slate-600 mb-8">Abra o WhatsApp → Menu (⋮) → Aparelhos Conectados → Conectar.</p>
                        <div className="inline-block p-4 bg-white rounded-2xl border border-slate-200 shadow-lg">
                            <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64" />
                        </div>
                        <p className="text-xs text-slate-500 mt-6">O QR Code expira em 60 segundos. Gere outro se necessário.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
