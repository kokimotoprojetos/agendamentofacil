import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const userId = (session.user as any).id;
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

        const { data: services, error } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
            .order('name');

        if (error) throw error;
        return NextResponse.json(services);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const body = await req.json();
        const userId = (session.user as any).id;

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

        const { data: service, error } = await supabaseAdmin
            .from('services')
            .insert({
                tenant_id: profile.tenant_id,
                name: body.name,
                price: parseFloat(body.price),
                duration: parseInt(body.duration),
                description: body.description || ''
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(service);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const userId = (session.user as any).id;
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });

        const { error } = await supabaseAdmin
            .from('services')
            .delete()
            .eq('id', id)
            .eq('tenant_id', profile.tenant_id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const userId = (session.user as any).id;
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

        const body = await req.json();
        const { id, name, price, duration, description } = body;

        if (!id) return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });

        const { data: service, error } = await supabaseAdmin
            .from('services')
            .update({
                name,
                price: parseFloat(price),
                duration: parseInt(duration),
                description: description || ''
            })
            .eq('id', id)
            .eq('tenant_id', profile.tenant_id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(service);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
