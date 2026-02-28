import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo";

export default function TestGlowPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
            <div className="max-w-6xl w-full">
                <h1 className="text-3xl font-bold mb-8 text-center text-slate-900">Glowing Effect Showcase</h1>
                <GlowingEffectDemo />
            </div>
        </div>
    );
}
