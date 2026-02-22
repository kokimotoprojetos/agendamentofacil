import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { whatsappService } from '@/services/whatsapp.service';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
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

        console.log('WhatsApp Disconnect API: Logging out and deleting instance:', instanceName);

        // 1. Logout and Delete from Evolution API
        await whatsappService.logout(instanceName);
        await whatsappService.deleteInstance(instanceName);

        // 2. Remove from database
        await supabaseAdmin
            .from('whatsapp_connections')
            .delete()
            .eq('instance_name', instanceName);

        // 3. Log the event
        await supabaseAdmin.from('agent_logs').insert({
            tenant_id: profile.tenant_id,
            event_type: 'whatsapp_disconnected',
            description: `Instância ${instanceName} desconectada pelo usuário.`
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('WhatsApp Disconnect API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
