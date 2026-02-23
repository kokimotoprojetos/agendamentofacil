'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    MessageSquare,
    Calendar,
    Settings,
    Users,
    HelpCircle,
    Scissors,
    Smartphone
} from 'lucide-react';

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: MessageSquare, label: 'Conversas', href: '/dashboard/chats' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/calendar' },
    { icon: Scissors, label: 'Serviços', href: '/dashboard/services' },
    { icon: Users, label: 'Agente IA', href: '/dashboard/agent' },
    { icon: Smartphone, label: 'WhatsApp', href: '/dashboard/whatsapp' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-[#020617] border-r border-white/5 flex flex-col z-50 overflow-hidden">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-600/20">
                        B
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Beautfy.ai</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-600/10 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/5 bg-[#020617]">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Versão</p>
                    <p className="text-xs font-medium text-slate-300">v1.3.0 Professional</p>
                </div>
            </div>
        </aside>
    );
}
