'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        await signIn('email', { email: data.email, callbackUrl: '/dashboard' });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Agendamento<span className="text-purple-600">IA</span></h1>
                    <p className="mt-2 text-sm text-gray-600">Entre na sua conta para gerenciar seus agendamentos</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className={`mt-1 block w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none`}
                            placeholder="seu@email.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar com Email'}
                    </button>
                </form>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                    </div>
                </div>

                <button
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                    className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                >
                    <img className="w-5 h-5 mr-2" src="https://www.google.com/favicon.ico" alt="Google" />
                    Entrar com Google
                </button>

                <p className="text-center text-sm text-gray-600">
                    Não tem uma conta? <a href="/register" className="font-bold text-purple-600 hover:underline">Cadastre-se</a>
                </p>
            </div>
        </div>
    );
}
