import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-indigo-500/30">
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg shadow-black/5">
          <a href="#">
            <BrandLogo size="sm" />
          </a>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Funcionalidades</a>
            <a href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Login</a>
            <a href="/register" className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
              Começar Agora
            </a>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <Features />
      </main>

      <Footer />
    </div>
  );
}
