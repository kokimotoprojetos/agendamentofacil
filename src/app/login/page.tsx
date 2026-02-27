'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrandLogo } from '@/components/ui/BrandLogo';

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
        <div
            className="flex items-center justify-center min-h-screen px-4"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}
        >
            <div className="relative w-full max-w-md">
                {/* Card */}
                <div
                    className="p-8 space-y-7 rounded-3xl shadow-xl"
                    style={{
                        background: 'white',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Logo */}
                    <div className="text-center pb-2">
                        <div className="flex justify-center mb-4">
                            <BrandLogo size="md" />
                        </div>
                        <p className="text-sm text-slate-500">Entre na sua conta para gerenciar seus agendamentos</p>
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="flex items-center justify-center w-full py-3.5 px-4 font-semibold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            background: '#f8fafc',
                            color: '#0f172a',
                            border: '1px solid rgba(0,0,0,0.08)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            gap: '10px',
                        }}
                    >
                        <GoogleIcon />
                        {googleLoading ? 'Redirecionando...' : 'Continuar com Google'}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center">
                        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />
                        <span className="px-4 text-xs text-slate-400 font-medium">ou entre com email</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />
                    </div>

                    {/* Email / Password form */}
                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="block w-full px-4 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                                style={{
                                    background: '#f8fafc',
                                    border: `1.5px solid ${errors.email ? '#ef4444' : 'rgba(0,0,0,0.08)'}`,
                                }}
                                placeholder="seu@email.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="block w-full px-4 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                                style={{
                                    background: '#f8fafc',
                                    border: `1.5px solid ${errors.password ? '#ef4444' : 'rgba(0,0,0,0.08)'}`,
                                }}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 px-4 font-bold text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                boxShadow: '0 8px 24px rgba(124,58,237,0.25)',
                            }}
                        >
                            {isSubmitting ? 'Entrando...' : 'Entrar na Conta'}
                        </button>
                    </form>

                    {/* Footer link */}
                    <p className="text-center text-sm text-slate-500">
                        Não tem uma conta?{' '}
                        <a href="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Cadastre-se
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
