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
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    };

    return (
        <div className="glass p-6 rounded-3xl border-white/5 transition-all duration-300 hover:border-white/10 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color] || 'text-slate-400 bg-slate-800/10'}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${trend.positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        <span>{trend.positive ? '▲' : '▼'}</span>
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>

            <div>
                <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-white tabular-nums tracking-tight">
                    {value}
                </h3>
            </div>
        </div>
    );
};
