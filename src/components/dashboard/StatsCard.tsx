import React from 'react';

interface StatsCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    trend?: {
        value: string;
        positive: boolean;
    };
}

export const StatsCard = ({ label, value, icon, color, trend }: StatsCardProps) => {
    const colorMap: { [key: string]: string } = {
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    };

    return (
        <div className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between transition-all duration-500 hover:border-indigo-500/30 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <div className="scale-[2.5] transform">{icon}</div>
            </div>

            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 ${colorMap[color] || 'text-slate-400 bg-slate-800/10'}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span>{trend.positive ? '▲' : '▼'}</span>
                            <span>{trend.value}</span>
                            <span className="text-slate-600 ml-1 font-medium italic">vs mês anterior</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-3xl font-black text-white tabular-nums tracking-tighter">
                    {value}
                </h3>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
};
