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

// Google "G" SVG icon
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
    </svg>
);

export default function LoginPage() {
    const [googleLoading, setGoogleLoading] = useState(false);
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

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            await signIn('google', { callbackUrl: '/dashboard' });
        } catch {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-[#070905] relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]" />
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
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <BrandLogo size="lg" />
                        </div>
                        <p className="text-slate-400 font-medium tracking-tight mt-2">Identidade e Agendamento para Salões</p>
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="flex items-center justify-center w-full py-4 px-4 font-bold rounded-2xl transition-all hover:bg-white/5 active:scale-95 disabled:opacity-60 border border-white/10 text-white gap-3"
                    >
                        <GoogleIcon />
                        {googleLoading ? 'Redirecionando...' : 'Entrar com Google'}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="px-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">ou use seu email</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Email / Password form */}
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label className="block text-xs font-black text-primary uppercase tracking-widest mb-2">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="block w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-primary/50 transition-all font-medium"
                                placeholder="seu@email.com"
                            />
                            {errors.email && <p className="mt-2 text-xs text-rose-500 font-bold">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-primary uppercase tracking-widest mb-2">Senha</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="block w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-primary/50 transition-all font-medium"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-2 text-xs text-rose-500 font-bold">{errors.password.message}</p>}
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
                    <p className="text-center text-sm text-slate-400 font-medium">
                        Novo por aqui?{' '}
                        <a href="/register" className="font-bold text-primary hover:underline transition-all">
                            Cadastre seu salão agora
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
