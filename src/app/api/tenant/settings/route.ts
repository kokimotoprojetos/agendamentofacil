import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', session.user.id)
            .single();

        if (!profile?.tenant_id) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

        const { data: tenant, error } = await supabaseAdmin
            .from('tenants')
            .select('settings')
            .eq('id', profile.tenant_id)
            .single();

        if (error) throw error;
        return NextResponse.json(tenant?.settings || {});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const body = await req.json();

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', session.user.id)
            .single();

        if (!profile?.tenant_id) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

        // Fetch current settings to merge
        const { data: tenant } = await supabaseAdmin
            .from('tenants')
            .select('settings')
            .eq('id', profile.tenant_id)
            .single();

        const updatedSettings = {
            ...(tenant?.settings || {}),
            personality: body.personality,
            workingHours: body.workingHours,
            location: body.location,
            workingDays: body.workingDays
        };

        const { error } = await supabaseAdmin
            .from('tenants')
            .update({ settings: updatedSettings })
            .eq('id', profile.tenant_id);

        if (error) throw error;
        return NextResponse.json({ success: true, settings: updatedSettings });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
