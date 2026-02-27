'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { BrandLogo } from '@/components/ui/BrandLogo';

const registerSchema = z.object({
    name: z.string().min(2, 'Nome muito curto'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
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
        <div className="flex items-center justify-center min-h-screen px-4 font-sans"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl"
                style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <BrandLogo size="md" />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Crie sua conta e comece a automatizar seus agendamentos</p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Seu Nome</label>
                        <input
                            {...register('name')}
                            type="text"
                            className={`mt-1 block w-full px-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-400' : 'border-slate-200'} text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder:text-slate-400`}
                            placeholder="João Silva"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nome do Negócio</label>
                        <input
                            {...register('businessName')}
                            type="text"
                            className={`mt-1 block w-full px-4 py-3 bg-slate-50 border ${errors.businessName ? 'border-red-400' : 'border-slate-200'} text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder:text-slate-400`}
                            placeholder="Barbearia Imperial"
                        />
                        {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email Profissional</label>
                        <input
                            {...register('email')}
                            type="email"
                            className={`mt-1 block w-full px-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-400' : 'border-slate-200'} text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder:text-slate-400`}
                            placeholder="contato@empresa.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Senha</label>
                        <input
                            {...register('password')}
                            type="password"
                            className={`mt-1 block w-full px-4 py-3 bg-slate-50 border ${errors.password ? 'border-red-400' : 'border-slate-200'} text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder:text-slate-400`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                    >
                        {isSubmitting ? 'Criando conta...' : 'Criar Conta Grátis'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500">
                    Já tem uma conta? <a href="/login" className="font-bold text-indigo-600 hover:underline">Entre aqui</a>
                </p>
            </div>
        </div>
    );
}
