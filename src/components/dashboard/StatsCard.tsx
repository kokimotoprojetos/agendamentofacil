import React from 'react';

interface StatsCardProps {
    label: string;
    value: string;
    icon: string;
    color: string;
}

export const StatsCard = ({ label, value, icon, color }: StatsCardProps) => {
    const colorMap: { [key: string]: string } = {
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        pink: 'bg-pink-100 text-pink-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className={`w-12 h-12 rounded-lg ${colorMap[color] || 'bg-gray-100 text-gray-600'} flex items-center justify-center text-2xl mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );
};
