import React, { useState } from 'react';
import Link from 'next/link';

const menuItems = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "🤖", label: "Agente IA", href: "/dashboard/agent" },
    { icon: "💬", label: "Conversas", href: "/dashboard/chats" },
    { icon: "📅", label: "Agenda", href: "/dashboard/calendar" },
    { icon: "🛠️", label: "Serviços", href: "/dashboard/services" },
    { icon: "🔌", label: "WhatsApp", href: "/dashboard/whatsapp" },
];

export const Sidebar = () => {
    return (
        <>
            <aside className="fixed left-4 top-4 bottom-4 w-64 glass rounded-[2rem] flex flex-col z-50 transition-all hidden lg:flex border-white/5 shadow-2xl">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                        B
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        Beautfy<span className="text-indigo-500">.ai</span>
                    </span>
                </div>

                <nav className="flex-1 px-4 py-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
                                >
                                    <span className="mr-3 text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-6 border-t border-white/5">
                    <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Versão</p>
                        <p className="text-xs text-white">v1.2.0 Premium</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Header - Placeholder transition to real mobile nav later */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass z-40 flex items-center justify-between px-6 border-b border-white/5">
                <span className="text-lg font-bold text-white">Beautfy<span className="text-indigo-500">.ai</span></span>
                <button className="text-white text-2xl">☰</button>
            </div>
        </>
    );
};
