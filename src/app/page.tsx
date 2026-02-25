import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-indigo-500/30">
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl shadow-indigo-500/10">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40 overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700" />
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white relative z-10" style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                <line x1="8.12" y1="8.12" x2="12" y2="12" />
              </svg>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
            </div>
            <a href="#" className="text-xl font-black tracking-tight">
              Beautfy<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">.ai</span>
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Preços</a>
            <a href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</a>
            <a href="/register" className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
              Começar Agora
            </a>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}
