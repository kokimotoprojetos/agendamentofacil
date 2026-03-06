'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface RevenueChartProps {
    data: { day: string; revenue: number }[];
}

export function RevenueBarChart({ data }: RevenueChartProps) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Receita da Semana</h3>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Última semana</span>
            </div>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                            tickFormatter={(value) => `${value > 0 ? value / 1000 + 'k' : 0}`}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="var(--primary)"
                            radius={[8, 8, 0, 0]}
                            barSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

interface ServicesChartProps {
    data: { name: string; percentage: number }[];
}

const COLORS = ['#f46025', '#fb923c', '#475569', '#94a3b8', '#cbd5e1'];

export function ServicesDonutChart({ data }: ServicesChartProps) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 h-full min-h-[400px]">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-8">Serviços Agendados</h3>
            <div className="flex flex-col xl:flex-row items-center gap-8">
                <div className="h-[240px] w-full max-w-[240px] aspect-square flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="percentage"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-4">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-sm font-bold text-slate-700">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{item.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
