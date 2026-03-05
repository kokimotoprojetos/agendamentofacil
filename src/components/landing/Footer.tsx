import React from 'react';
import { BrandLogo } from '@/components/ui/BrandLogo';

export const Footer = () => {
    return (
        <footer className="py-24 border-t border-slate-100 bg-background relative z-10">
            <div className="container px-4 mx-auto">
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full px-4 mb-16 lg:w-1/2 lg:mb-0">
                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Beautfy</span>
                                <span className="text-2xl font-bebas text-[var(--primary)] tracking-wider">.ai</span>
                            </div>
                        </div>

                        <p className="max-w-sm text-slate-700 leading-relaxed font-medium text-lg">
                            A tecnologia de inteligência artificial que humaniza o atendimento do seu salão e escala seu faturamento no piloto automático.
                        </p>
                    </div>
                    <div className="w-full px-4 mb-12 lg:w-1/4 lg:mb-0">
                        <h3 className="mb-8 text-sm font-black text-primary tracking-[0.2em] uppercase">Produto</h3>
                        <ul className="text-slate-600 space-y-4 font-medium">
                            <li><a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                            <li><a href="#pricing" className="hover:text-primary transition-colors">Preços</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Demonstração</a></li>
                        </ul>
                    </div>
                    <div className="w-full px-4 lg:w-1/4">
                        <h3 className="mb-8 text-sm font-black text-primary tracking-[0.2em] uppercase">Legal</h3>
                        <ul className="text-slate-600 space-y-4 font-medium">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">LGPD</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-12 mt-16 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                        © {new Date().getFullYear()} Beautfy.ai. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};
