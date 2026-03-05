import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen selection:bg-[var(--primary)]/30 text-foreground">
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
