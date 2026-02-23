'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
        ),
        label: "Dashboard",
        href: "/dashboard"
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
        ),
        label: "Agente IA",
        href: "/dashboard/agent"
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        ),
        label: "Conversas",
        href: "/dashboard/chats"
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
        ),
        label: "Agenda",
        href: "/dashboard/calendar"
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /><path d="m9.01 13 4-4" /></svg>
        ),
        label: "Serviços",
        href: "/dashboard/services"
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
        ),
        label: "WhatsApp",
        href: "/dashboard/whatsapp"
    },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <>
            <aside className="fixed left-6 top-6 bottom-6 w-64 glass-dark rounded-[2.5rem] flex flex-col z-50 transition-all hidden lg:flex border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="p-10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                        B
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter">
                        Beautfy<span className="text-indigo-500">.ai</span>
                    </span>
                </div>

                <nav className="flex-1 px-6 py-2 overflow-y-auto">
                    <ul className="space-y-3">
                        {menuItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={index}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                                                ? 'bg-indigo-600/10 text-white shadow-[inset_0_0_20px_rgba(99,102,241,0.05)] border border-indigo-500/20'
                                                : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                        )}
                                        <span className={`mr-4 transition-all duration-300 ${isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400 group-hover:scale-110'}`}>
                                            {item.icon}
                                        </span>
                                        <span className={`text-sm font-bold tracking-tight transition-all ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-8">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-indigo-600/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Workspace</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 text-xs font-bold border border-indigo-500/20">
                                P
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white uppercase tracking-tight">Premium</p>
                                <p className="text-[9px] text-slate-500 font-medium">v1.2.5 Executive</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header - Elevated */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 glass-dark z-40 flex items-center justify-between px-8 border-b border-white/5 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">B</div>
                    <span className="text-lg font-black text-white tracking-tighter">Beautfy<span className="text-indigo-500">.ai</span></span>
                </div>
                <button className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                </button>
            </div>
        </>
    );
};
