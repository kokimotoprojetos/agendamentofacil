import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen selection:bg-[#00e676]/30">
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
