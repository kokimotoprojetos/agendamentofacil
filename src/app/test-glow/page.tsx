"use client";

import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo";

export default function TestGlowPage() {
    return (
        <div className="min-h-screen bg-black p-8 md:p-24">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white">Glowing Effect Test</h1>
                    <p className="text-white/60">Testing the new GlowingEffect component and its demo.</p>
                </div>

                <div className="p-8 rounded-3xl border border-white/5 bg-white/5">
                    <GlowingEffectDemo />
                </div>
            </div>
        </div>
    );
}
