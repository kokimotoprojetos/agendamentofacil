import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { whatsappService } from '@/services/whatsapp.service';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // 1. Get tenant ID
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.error('Profile fetch error:', profileError);
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
        }

        const instanceName = `tenant-${profile.tenant_id}`;

        // 2. Check if instance exists, create if not
        const exists = await whatsappService.instanceExists(instanceName);
        if (!exists) {
            await whatsappService.createInstance(instanceName);
            // Wait for instance to be ready
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // 3. Get QR Code
        const data = await whatsappService.getQrCode(instanceName);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('WhatsApp Connection API Error:', error);
        return NextResponse.json({
            error: error.message || 'Erro interno ao conectar WhatsApp',
            details: error.response?.data || null
        }, { status: 500 });
    }
}
