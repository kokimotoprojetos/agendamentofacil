import React from 'react';

interface StatsCardProps {
    label: string;
    value: string;
    icon: string;
    color: string;
}

export const StatsCard = ({ label, value, icon, color }: StatsCardProps) => {
    const colorMap: { [key: string]: string } = {
        purple: 'bg-purple-900/30 text-purple-400 border-purple-500/20',
        blue: 'bg-blue-900/30 text-blue-400 border-blue-500/20',
        green: 'bg-green-900/30 text-green-400 border-green-500/20',
        pink: 'bg-pink-900/30 text-pink-400 border-pink-500/20',
    };

    return (
        <div className="bg-[#0f0f0f] p-6 rounded-2xl shadow-sm border border-white/5 flex items-center transition-all hover:border-white/10">
            <div className={`w-12 h-12 rounded-lg ${colorMap[color] || 'bg-gray-800 text-gray-400'} border flex items-center justify-center text-2xl mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
        </div>
    );
};
