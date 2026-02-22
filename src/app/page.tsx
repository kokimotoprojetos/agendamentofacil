import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 border-b border-white/5 backdrop-blur-md">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-20">
            <a href="#" className="text-2xl font-bold text-white">
              Agendamento<span className="text-purple-500">IA</span>
            </a>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="font-semibold text-gray-400 hover:text-purple-500 transition-colors">Funcionalidades</a>
              <a href="#pricing" className="font-semibold text-gray-400 hover:text-purple-500 transition-colors">Preços</a>
              <a href="/login" className="font-semibold text-gray-400 hover:text-purple-500 transition-colors">Login</a>
              <a href="/register" className="px-6 py-2 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-900/20 transition-all">
                Começar
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-20">
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
