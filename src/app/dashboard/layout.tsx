import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex text-foreground">
            <Sidebar />
            <main className="flex-1 ml-20 lg:ml-72 p-6 lg:p-12 pt-24 lg:pt-12 min-h-screen bg-background transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
