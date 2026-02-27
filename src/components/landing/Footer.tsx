import React from 'react';
import { BrandLogo } from '@/components/ui/BrandLogo';

export const Footer = () => {
    return (
        <footer className="py-20 border-t border-slate-200 bg-white/50">
            <div className="container px-4 mx-auto">
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full px-4 mb-12 lg:w-1/2 lg:mb-0">
                        <div className="mb-6">
                            <BrandLogo size="sm" showTagline />
                        </div>

                        <p className="max-w-sm text-slate-500 leading-relaxed">
                            A tecnologia de inteligência artificial que humaniza o atendimento do seu salão e escala seu faturamento no piloto automático.
                        </p>
                    </div>
                    <div className="w-full px-4 mb-12 lg:w-1/4 lg:mb-0">
                        <h4 className="mb-6 text-sm font-bold text-slate-900 tracking-widest uppercase">Produto</h4>
                        <ul className="text-slate-500 space-y-4">
                            <li><a href="#features" className="hover:text-indigo-600 transition-colors">Funcionalidades</a></li>
                            <li><a href="#pricing" className="hover:text-indigo-600 transition-colors">Preços</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Demonstração</a></li>
                        </ul>
                    </div>
                    <div className="w-full px-4 lg:w-1/4">
                        <h4 className="mb-6 text-sm font-bold text-slate-900 tracking-widest uppercase">Legal</h4>
                        <ul className="text-slate-500 space-y-4">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacidade</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">LGPD</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-12 mt-12 border-t border-slate-200 text-center">
                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} Beautfy.ai. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};
