import React from 'react';
import Link from 'next/link';

const menuItems = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "🤖", label: "Agente IA", href: "/dashboard/agent" },
    { icon: "💬", label: "Conversas", href: "/dashboard/chats" },
    { icon: "📅", label: "Agenda", href: "/dashboard/calendar" },
    { icon: "🛠️", label: "Serviços", href: "/dashboard/services" },
];

export const Sidebar = () => {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center">
                <span className="text-xl font-bold text-white">Agendamento<span className="text-purple-500">IA</span></span>
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.href}
                                className="flex items-center p-3 text-gray-400 hover:bg-purple-900/20 hover:text-purple-400 rounded-lg transition-colors group"
                            >
                                <span className="mr-3 text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-white/5 italic text-xs text-gray-600">
                v1.0.0
            </div>
        </aside>
    );
};
