import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex text-foreground">
            <Sidebar />
            <main className="flex-1 ml-20 lg:ml-72 min-h-screen bg-background transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
