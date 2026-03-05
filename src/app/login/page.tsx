'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;



export default function LoginPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
                callbackUrl: '/dashboard',
            });

            if (result?.error) {
                alert('Erro ao entrar: ' + (result.error === 'CredentialsSignin' ? 'Email ou senha incorretos' : result.error));
                return;
            }

            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Login error:', error);
            alert('Erro ao realizar login. Tente novamente.');
        }
    };



    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-white relative overflow-hidden font-inter">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Card */}
                <div className="relative p-10 space-y-8 rounded-[2.5rem] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-2xl overflow-hidden group">
                    <GlowingEffect
                        spread={60}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={2}
                    />

                    {/* Logo content */}
                    <div className="text-center relative">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">Beautfy</span>
                                <span className="text-3xl font-bebas text-[var(--primary)] tracking-wider">.ai</span>
                            </div>
                        </div>
                        <p className="text-slate-600 font-semibold tracking-tight mt-2">Identidade e Agendamento para Salões</p>
                    </div>



                    {/* Email / Password form */}
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Profissional</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="block w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary/50 transition-all font-bold"
                                placeholder="seu@email.com"
                            />
                            {errors.email && <p className="mt-2 text-xs text-rose-600 font-bold">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Senha de Acesso</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="block w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary/50 transition-all font-bold"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-2 text-xs text-rose-600 font-bold">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 px-4 font-black text-black bg-primary rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_0_30px_rgba(219,237,23,0.2)] uppercase tracking-tight text-lg"
                        >
                            {isSubmitting ? 'Verificando...' : 'ENTRAR NA CONTA'}
                        </button>
                    </form>

                    {/* Footer link */}
                    <p className="text-center text-sm text-slate-600 font-semibold relative">
                        Novo por aqui?{' '}
                        <a href="/register" className="font-bold text-[var(--primary)] hover:underline transition-all">
                            Cadastre seu salão agora
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
