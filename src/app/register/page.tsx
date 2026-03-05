'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const registerSchema = z.object({
    name: z.string().min(2, 'Nome muito curto'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    businessName: z.string().min(2, 'Nome do negócio muito curto'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to register');
            }

            const signInResult = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
                callbackUrl: '/dashboard'
            });

            if (signInResult?.error) {
                throw new Error(signInResult.error);
            }

            window.location.href = '/dashboard';
        } catch (error: any) {
            console.error('Registration error:', error);
            alert(error.message || 'Erro ao criar conta. Tente novamente.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-[#070905] relative overflow-hidden font-inter">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Card */}
                <div className="relative p-10 space-y-8 rounded-[2.5rem] border border-white/10 glass shadow-2xl overflow-hidden group">
                    <GlowingEffect
                        spread={60}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={2}
                    />

                    {/* Logo content */}
                    <div className="relative text-center">
                        <div className="flex justify-center mb-6">
                            <BrandLogo size="lg" />
                        </div>
                        <p className="text-slate-400 font-medium tracking-tight mt-2">Crie sua conta e comece a automatizar</p>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-xs font-black text-primary uppercase tracking-widest mb-2">Seu Nome</label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    className={`block w-full px-5 py-4 rounded-2xl bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} text-white placeholder:text-slate-600 outline-none focus:border-primary/50 transition-all font-medium`}
                                    placeholder="João Silva"
                                />
                                {errors.name && <p className="mt-2 text-xs text-red-500 font-bold">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-primary uppercase tracking-widest mb-2">Nome do Negócio</label>
                                <input
                                    {...register('businessName')}
                                    type="text"
                                    className={`block w-full px-5 py-4 rounded-2xl bg-white/5 border ${errors.businessName ? 'border-red-500' : 'border-white/10'} text-white placeholder:text-slate-600 outline-none focus:border-primary/50 transition-all font-medium`}
                                    placeholder="Barbearia Imperial"
                                />
                                {errors.businessName && <p className="mt-2 text-xs text-red-500 font-bold">{errors.businessName.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-primary uppercase tracking-widest mb-2">Email Profissional</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`block w-full px-5 py-4 rounded-2xl bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} text-white placeholder:text-slate-600 outline-none focus:border-primary/50 transition-all font-medium`}
                                    placeholder="contato@empresa.com"
                                />
                                {errors.email && <p className="mt-2 text-xs text-red-500 font-bold">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-primary uppercase tracking-widest mb-2">Senha</label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className={`block w-full px-5 py-4 rounded-2xl bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} text-white placeholder:text-slate-600 outline-none focus:border-primary/50 transition-all font-medium`}
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="mt-2 text-xs text-red-500 font-bold">{errors.password.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 px-4 font-black text-black bg-primary rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_0_30px_rgba(219,237,23,0.2)] uppercase tracking-tight text-lg mt-4"
                        >
                            {isSubmitting ? 'CRIANDO CONTA...' : 'CRIAR CONTA GRÁTIS'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400 font-medium">
                        Já tem uma conta? <a href="/login" className="font-bold text-primary hover:underline transition-all">Entre aqui</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
