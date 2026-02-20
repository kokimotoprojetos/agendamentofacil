import React from 'react';

export const Footer = () => {
    return (
        <footer className="py-12 bg-gray-900">
            <div className="container px-4 mx-auto">
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full px-4 mb-8 lg:w-1/3 lg:mb-0">
                        <a href="#" className="inline-block mb-6 text-2xl font-bold text-white">
                            Agendamento<span className="text-purple-600">IA</span>
                        </a>
                        <p className="max-w-xs text-gray-400">
                            Transformando o atendimento de pequenos negócios através de Inteligência Artificial no WhatsApp.
                        </p>
                    </div>
                    <div className="w-full px-4 mb-8 md:w-1/2 lg:w-1/6 lg:mb-0">
                        <h4 className="mb-6 font-bold text-white uppercase tracking-widest text-xs">Produto</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#features" className="hover:text-white">Funcionalidades</a></li>
                            <li><a href="#pricing" className="hover:text-white">Preços</a></li>
                            <li><a href="#" className="hover:text-white">Demonstração</a></li>
                        </ul>
                    </div>
                    <div className="w-full px-4 mb-8 md:w-1/2 lg:w-1/6 lg:mb-0">
                        <h4 className="mb-6 font-bold text-white uppercase tracking-widest text-xs">Empresa</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-white">Sobre</a></li>
                            <li><a href="#" className="hover:text-white">Contato</a></li>
                            <li><a href="#" className="hover:text-white">Blog</a></li>
                        </ul>
                    </div>
                    <div className="w-full px-4 lg:w-1/3">
                        <h4 className="mb-6 font-bold text-white uppercase tracking-widest text-xs">Newsletter</h4>
                        <div className="flex flex-wrap items-center">
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                className="w-full px-4 py-3 mb-4 mr-4 text-white bg-gray-800 border border-gray-700 rounded-lg lg:w-auto lg:mb-0 focus:outline-none focus:border-purple-600"
                            />
                            <button className="px-6 py-3 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700">
                                Assinar
                            </button>
                        </div>
                    </div>
                </div>
                <div className="pt-12 mt-12 border-t border-gray-800 text-center">
                    <p className="text-gray-500">&copy; 2024 AgendamentoIA. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};
