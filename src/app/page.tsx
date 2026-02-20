import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 bg-opacity-80 backdrop-blur-md">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-20">
            <a href="#" className="text-2xl font-bold text-gray-900">
              Agendamento<span className="text-purple-600">IA</span>
            </a>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="font-semibold text-gray-600 hover:text-purple-600">Funcionalidades</a>
              <a href="#pricing" className="font-semibold text-gray-600 hover:text-purple-600">Preços</a>
              <a href="/login" className="font-semibold text-gray-600 hover:text-purple-600">Login</a>
              <a href="/register" className="px-6 py-2 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700">
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
