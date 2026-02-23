import React from 'react';

interface StatsCardProps {
    label: string;
    value: string;
    icon: string;
    color: string;
}

export const StatsCard = ({ label, value, icon, color }: StatsCardProps) => {
    const colorMap: { [key: string]: string } = {
        purple: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20',
        blue: 'bg-blue-600/20 text-blue-400 border-blue-500/20',
        green: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/20',
        pink: 'bg-rose-600/20 text-rose-400 border-rose-500/20',
    };

    return (
        <div className="glass p-8 rounded-[2rem] border-white/5 flex items-center transition-all hover:scale-[1.02] hover:border-indigo-500/30 group">
            <div className={`w-14 h-14 rounded-2xl ${colorMap[color] || 'bg-slate-800 text-slate-400'} border flex items-center justify-center text-2xl mr-5 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-white tabular-nums">{value}</h3>
            </div>
        </div>
    );
};
