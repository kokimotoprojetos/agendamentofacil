import { GlowingEffect } from '@/components/ui/glowing-effect';

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
        emerald: 'text-[#00e676] bg-[#00e676]/10 border-[#00e676]/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    };

    return (
        <div className="relative bg-white/5 p-6 rounded-3xl border border-white/5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.07] group">
            <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
            />
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color] || 'text-white/60 bg-white/5'}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${trend.positive ? 'bg-[#00e676]/10 text-[#00e676]' : 'bg-rose-500/10 text-rose-400'}`}>
                        <span>{trend.positive ? '▲' : '▼'}</span>
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-xs text-white/40 font-medium mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-white tabular-nums tracking-tight">
                    {value}
                </h3>
            </div>
        </div>
    );
};
