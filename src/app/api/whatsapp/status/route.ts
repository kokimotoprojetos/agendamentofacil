import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { whatsappService } from '@/services/whatsapp.service';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
        }

        const instanceName = `wa_${profile.tenant_id.split('-')[0]}`;
        const data = await whatsappService.getConnectionStatus(instanceName);

        // Map Evolution API response to a simpler status
        const state = data.instance?.state || 'disconnected';

        return NextResponse.json({
            status: state,
            details: data
        });
    } catch (error: any) {
        console.error('WhatsApp Status API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
