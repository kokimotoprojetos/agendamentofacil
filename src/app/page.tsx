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
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0" style={{ width: '38px', height: '38px' }}>
              <div className="absolute inset-0 rounded-[11px] bg-gradient-to-br from-indigo-500 to-violet-600 opacity-40 blur-[4px]" />
              <div className="relative w-full h-full rounded-[11px] overflow-hidden flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#9333ea 100%)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                <svg viewBox="0 0 20 20" style={{ width: '18px', height: '18px' }} fill="none" className="relative z-10">
                  <circle cx="4.5" cy="4.5" r="2.8" stroke="white" strokeWidth="1.5" fill="none" />
                  <circle cx="4.5" cy="15.5" r="2.8" stroke="white" strokeWidth="1.5" fill="none" />
                  <line x1="6.8" y1="6" x2="17" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="6.8" y1="14" x2="17" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="10.5" cy="10" r="1" fill="white" opacity="0.9" />
                </svg>
                <span className="absolute top-[6px] right-[6px] w-[4px] h-[4px] bg-white rounded-full opacity-95" />
              </div>
            </div>
            <a href="#" className="flex items-baseline">
              <span className="font-black text-white tracking-tight" style={{ fontSize: '19px', letterSpacing: '-0.3px' }}>Beautfy</span>
              <span className="font-black tracking-tight" style={{ fontSize: '19px', letterSpacing: '-0.3px', background: 'linear-gradient(90deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.ai</span>
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
