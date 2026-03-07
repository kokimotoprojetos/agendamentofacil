import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', session.user.id)
            .single();

        if (!profile?.tenant_id) {
            return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
        }

        const { data: professionals, error } = await supabaseAdmin
            .from('professionals')
            .select(`
                *,
                professional_services (
                    service_id
                )
            `)
            .eq('tenant_id', profile.tenant_id)
            .order('name');

        if (error) throw error;

        // Formata os dados para facilitar no frontend
        const formattedProfessionals = professionals.map(prof => ({
            ...prof,
            service_ids: prof.professional_services.map((ps: any) => ps.service_id)
        }));

        return NextResponse.json(formattedProfessionals);
    } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', session.user.id)
            .single();

        if (!profile?.tenant_id) {
            return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
        }

        const { name, email, phone, service_ids } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
        }

        const { data: professional, error } = await supabaseAdmin
            .from('professionals')
            .insert([{ tenant_id: profile.tenant_id, name, email, phone }])
            .select()
            .single();

        if (error) throw error;

        // Insere os vínculos de serviço, se houver
        if (service_ids && service_ids.length > 0) {
            const serviceLinks = service_ids.map((service_id: string) => ({
                professional_id: professional.id,
                service_id
            }));

            const { error: linkError } = await supabaseAdmin
                .from('professional_services')
                .insert(serviceLinks);

            if (linkError) throw linkError;
        }

        return NextResponse.json(professional);
    } catch (error) {
        console.error('Erro ao criar profissional:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { id, name, email, phone, service_ids } = await req.json();

        if (!id || !name) {
            return NextResponse.json({ error: 'ID e Nome são obrigatórios' }, { status: 400 });
        }

        // 1. Atualiza dados do profissional
        const { error } = await supabaseAdmin
            .from('professionals')
            .update({ name, email, phone })
            .eq('id', id);

        if (error) throw error;

        // 2. Remove vínculos antigos
        await supabaseAdmin
            .from('professional_services')
            .delete()
            .eq('professional_id', id);

        // 3. Adiciona novos vínculos
        if (service_ids && service_ids.length > 0) {
            const serviceLinks = service_ids.map((service_id: string) => ({
                professional_id: id,
                service_id
            }));

            const { error: linkError } = await supabaseAdmin
                .from('professional_services')
                .insert(serviceLinks);

            if (linkError) throw linkError;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar profissional:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
        }

        // Relação ON DELETE CASCADE na tabela resolverá os professional_services automaticamente
        const { error } = await supabaseAdmin
            .from('professionals')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir profissional:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
