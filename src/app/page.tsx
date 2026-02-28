import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';

export default function LandingPage() {
  return (
    <BackgroundGradientAnimation containerClassName="!h-auto !min-h-screen">
      <div className="relative z-50 selection:bg-primary/30">
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl">
          <div className="glass rounded-[1.5rem] px-8 py-5 flex items-center justify-between shadow-2xl border-white/10">
            <a href="#" className="hover:opacity-80 transition-opacity">
              <BrandLogo size="md" />
            </a>

            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-sm font-black text-slate-300 hover:text-primary tracking-widest uppercase transition-colors">Funcionalidades</a>
              <a href="/login" className="text-sm font-black text-slate-300 hover:text-primary tracking-widest uppercase transition-colors">Login</a>
              <a href="/register" className="px-7 py-3.5 text-sm font-black text-black bg-primary rounded-xl hover:bg-[#c5d615] shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-tight">
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
    </BackgroundGradientAnimation>
  );
}
