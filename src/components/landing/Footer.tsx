import React from 'react';

export const Footer = () => {
    return (
        <footer className="py-20 border-t border-white/5 bg-slate-950/30">
            <div className="container px-4 mx-auto">
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full px-4 mb-12 lg:w-1/2 lg:mb-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative flex-shrink-0" style={{ width: '38px', height: '38px' }}>
                                <div className="absolute inset-0 rounded-[11px] bg-gradient-to-br from-indigo-500 to-violet-600 opacity-40 blur-[4px]" />
                                <div className="relative w-full h-full rounded-[11px] overflow-hidden flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#9333ea 100%)' }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                                    <svg viewBox="0 0 20 20" style={{ width: '18px', height: '18px' }} fill="none" className="relative z-10">
                                        <circle cx="4.5" cy="4.5" r="2.8" stroke="white" strokeWidth="1.5" fill="none" />
                                        <circle cx="4.5" cy="15.5" r="2.8" stroke="white" strokeWidth="1.5" fill="none" />
                                        <line x1="6.8" y1="6" x2="17" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                        <line x1="6.8" y1="14" x2="17" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                        <circle cx="10.5" cy="10" r="1" fill="white" opacity="0.9" />
                                    </svg>
                                    <span className="absolute top-[6px] right-[6px] w-[4px] h-[4px] bg-white rounded-full opacity-95" />
                                </div>
                            </div>
                            <span className="flex items-baseline">
                                <span className="font-black text-white tracking-tight" style={{ fontSize: '19px', letterSpacing: '-0.3px' }}>Beautfy</span>
                                <span className="font-black tracking-tight" style={{ fontSize: '19px', letterSpacing: '-0.3px', background: 'linear-gradient(90deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.ai</span>
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
