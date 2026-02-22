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

    useEffect(() => {
        console.log('WhatsApp Manager - Session Status:', sessionStatus);
        console.log('WhatsApp Manager - Session Data:', session);
    }, [session, sessionStatus]);

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
            } else if (data.instance?.state === 'open' || data.status === 'open') {
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Conectar WhatsApp</h1>
                        <p className="text-gray-600">Conecte seu número para começar a automatizar os agendamentos.</p>
                    </div>
                    <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="font-medium text-gray-700 capitalize">{status === 'connected' ? 'Conectado' : 'Desconectado'}</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {status !== 'connected' && (
                    <div className="p-12 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                        {qrCode ? (
                            <div className="flex flex-col items-center">
                                <p className="mb-6 font-medium text-gray-900">Escaneie o QR Code abaixo com seu WhatsApp:</p>
                                <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <QRCodeSVG value={qrCode} size={256} />
                                </div>
                                <button
                                    onClick={() => setQrCode(null)}
                                    className="mt-6 text-sm text-gray-500 hover:text-purple-600"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div className="max-w-xs mx-auto">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                                    📱
                                </div>
                                <h3 className="text-lg font-bold mb-2">Conectar novo número</h3>
                                <p className="text-gray-500 mb-6">Configure seu WhatsApp em instantes para começar a atender seus clientes.</p>
                                <button
                                    onClick={connectWhatsApp}
                                    disabled={loading || sessionStatus === 'loading'}
                                    className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50"
                                >
                                    {sessionStatus === 'loading' ? 'Verificando acesso...' : loading ? 'Gerando QR Code...' : 'Gerar QR Code'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-xl">
                        <h4 className="font-bold mb-2">💡 Dica</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Mantenha seu celular conectado à internet para garantir que o robô responda seus clientes instantaneamente.
                        </p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-xl">
                        <h4 className="font-bold mb-2">🔒 Segurança</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Não salvamos suas mensagens. A integração é feita via API oficial e segue todos os protocolos de segurança.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
