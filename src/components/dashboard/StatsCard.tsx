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
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 transition-all duration-300 hover:border-slate-300 hover:shadow-md group">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color] || 'text-slate-600 bg-slate-50'}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <span>{trend.positive ? '▲' : '▼'}</span>
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>

            <div>
                <p className="text-xs text-slate-600 font-medium mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                    {value}
                </h3>
            </div>
        </div>
    );
};
