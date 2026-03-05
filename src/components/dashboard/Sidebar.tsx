'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import {
    LayoutDashboard,
    MessageSquare,
    Calendar,
    Settings,
    Users,
    HelpCircle,
    Scissors,
    Smartphone,
    MessageCircle,
    LogOut,
} from 'lucide-react';

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

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: MessageSquare, label: 'Conversas', href: '/dashboard/chats' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/calendar' },
    { icon: Scissors, label: 'Serviços', href: '/dashboard/services' },

    { icon: Users, label: 'Agente IA', href: '/dashboard/agent' },
    { icon: WhatsAppIcon, label: 'WhatsApp', href: '/dashboard/whatsapp' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-50 overflow-hidden transition-all duration-300">
            <div className="p-4 lg:p-8 flex justify-center lg:justify-start">
                <BrandLogo size="sm" hideText />
            </div>

            <nav className="flex-1 px-3 lg:px-4 space-y-2 overflow-y-auto scrollbar-hide py-4">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-2xl transition-all duration-200 group ${isActive
                                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={24} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                            <span className="hidden lg:block text-sm font-bold tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 lg:p-8 mt-auto flex justify-center lg:justify-start border-t border-slate-800/50">
                <button
                    onClick={() => {/* logout logic */ }}
                    className="flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all group w-full"
                >
                    <LogOut size={24} className="group-hover:translate-x-1 transition-transform" />
                    <span className="hidden lg:block text-sm font-bold tracking-tight">Sair</span>
                </button>
            </div>
        </aside>
    );
}
