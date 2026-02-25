import React from 'react';

export const Footer = () => {
    return (
        <footer className="py-20 border-t border-white/5 bg-slate-950/30">
            <div className="container px-4 mx-auto">
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full px-4 mb-12 lg:w-1/2 lg:mb-0">
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40 overflow-hidden flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700" />
                                <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }} className="text-white relative z-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="6" cy="6" r="3" />
                                    <circle cx="6" cy="18" r="3" />
                                    <line x1="20" y1="4" x2="8.12" y2="15.88" />
                                    <line x1="14.47" y1="14.48" x2="20" y2="20" />
                                    <line x1="8.12" y1="8.12" x2="12" y2="12" />
                                </svg>
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tight">
                                Beautfy<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">.ai</span>
                            </span>
                        </div>
                        <p className="max-w-sm text-slate-400 leading-relaxed">
                            A tecnologia de inteligência artificial que humaniza o atendimento do seu salão e escala seu faturamento no piloto automático.
                        </p>
                    </div>
                    <div className="w-full px-4 mb-12 lg:w-1/4 lg:mb-0">
                        <h4 className="mb-6 text-sm font-bold text-white tracking-widest uppercase">Produto</h4>
                        <ul className="text-slate-400 space-y-4">
                            <li><a href="#features" className="hover:text-indigo-400 transition-colors">Funcionalidades</a></li>
                            <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Preços</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Demonstração</a></li>
                        </ul>
                    </div>
                    <div className="w-full px-4 lg:w-1/4">
                        <h4 className="mb-6 text-sm font-bold text-white tracking-widest uppercase">Legal</h4>
                        <ul className="text-slate-400 space-y-4">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacidade</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">LGPD</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-12 mt-12 border-t border-white/5 text-center">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} Beautfy.ai. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};
