'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
        <div className="flex items-center justify-center min-h-screen bg-[#050505] px-4 font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-[#0f0f0f] rounded-2xl shadow-2xl border border-white/5">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-white">Agendamento<span className="text-purple-500">IA</span></h1>
                    <p className="mt-2 text-sm text-gray-400">Entre na sua conta para gerenciar seus agendamentos</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className={`mt-1 block w-full px-4 py-3 bg-[#1a1a1a] border ${errors.email ? 'border-red-500' : 'border-white/10'} text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder:text-gray-600`}
                            placeholder="seu@email.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
                        <input
                            {...register('password')}
                            type="password"
                            className={`mt-1 block w-full px-4 py-3 bg-[#1a1a1a] border ${errors.password ? 'border-red-500' : 'border-white/10'} text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder:text-gray-600`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar na Conta'}
                    </button>
                </form>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#0f0f0f] text-gray-500">Ou continue com</span>
                    </div>
                </div>

                <button
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                    className="flex items-center justify-center w-full py-3 px-4 bg-[#1a1a1a] border border-white/10 text-white font-semibold rounded-xl hover:bg-[#252525] transition-all shadow-sm"
                >
                    <img className="w-5 h-5 mr-2" src="https://www.google.com/favicon.ico" alt="Google" />
                    Entrar com Google
                </button>

                <p className="text-center text-sm text-gray-400">
                    Não tem uma conta? <a href="/register" className="font-bold text-purple-500 hover:underline">Cadastre-se</a>
                </p>
            </div>
        </div>
    );
}
