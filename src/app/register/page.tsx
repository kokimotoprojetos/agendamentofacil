'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';

const registerSchema = z.object({
    name: z.string().min(2, 'Nome muito curto'),
    email: z.string().email('Email inválido'),
    businessName: z.string().min(2, 'Nome do negócio muito curto'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        // Para simplificar, usamos o mesmo fluxo de email do NextAuth
        // Em um sistema real, você salvaria os dados do negócio antes
        console.log('Registering:', data);
        await signIn('email', { email: data.email, callbackUrl: '/dashboard' });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#050505] px-4 font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-[#0f0f0f] rounded-2xl shadow-2xl border border-white/5">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-white">Agendamento<span className="text-purple-500">IA</span></h1>
                    <p className="mt-2 text-sm text-gray-400">Crie sua conta e comece a automatizar seus agendamentos</p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Seu Nome</label>
                        <input
                            {...register('name')}
                            type="text"
                            className={`mt-1 block w-full px-4 py-3 bg-[#1a1a1a] border ${errors.name ? 'border-red-500' : 'border-white/10'} text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder:text-gray-600`}
                            placeholder="João Silva"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Nome do Negócio</label>
                        <input
                            {...register('businessName')}
                            type="text"
                            className={`mt-1 block w-full px-4 py-3 bg-[#1a1a1a] border ${errors.businessName ? 'border-red-500' : 'border-white/10'} text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder:text-gray-600`}
                            placeholder="Barbearia Imperial"
                        />
                        {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email Profissional</label>
                        <input
                            {...register('email')}
                            type="email"
                            className={`mt-1 block w-full px-4 py-3 bg-[#1a1a1a] border ${errors.email ? 'border-red-500' : 'border-white/10'} text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder:text-gray-600`}
                            placeholder="contato@empresa.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Criando conta...' : 'Criar Conta Grátis'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    Já tem uma conta? <a href="/login" className="font-bold text-purple-500 hover:underline">Entre aqui</a>
                </p>
            </div>
        </div>
    );
}
