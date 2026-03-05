'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: 'indigo' | 'blue' | 'emerald' | 'rose' | 'orange';
    trend?: {
        value: string;
        positive: boolean;
    };
}

export const StatsCard = ({ label, value, icon, color, trend }: StatsCardProps) => {
    const colorConfigs = {
        indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
        blue: 'bg-blue-50 border-blue-100 text-blue-600',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
        rose: 'bg-rose-50 border-rose-100 text-rose-600',
        orange: 'bg-orange-50 border-orange-100 text-orange-600',
    };

    const iconBg = {
        indigo: 'bg-indigo-500/10',
        blue: 'bg-blue-500/10',
        emerald: 'bg-emerald-500/10',
        rose: 'bg-rose-500/10',
        orange: 'bg-orange-500/10',
    };

    return (
        <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border-slate-200`}>
            <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg[color] || 'bg-slate-50'} ${colorConfigs[color].split(' ')[2]}`}>
                    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 28 }) : icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{trend.positive ? '+' : ''}{trend.value}</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                    {value}
                </h3>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
};
