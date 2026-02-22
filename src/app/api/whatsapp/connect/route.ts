import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { whatsappService } from '@/services/whatsapp.service';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
    try {
        console.log('WhatsApp Connection API: POST request received');

        // Debug: Check environment variables
        console.log('Environment Check:', {
            EVOLUTION_API_URL: process.env.EVOLUTION_API_URL ? 'Defined' : 'UNDEFINED',
            EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ? 'Defined' : 'UNDEFINED',
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Defined' : 'UNDEFINED',
        });

        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            console.warn('WhatsApp Connection API: No valid session found');
            return NextResponse.json({ error: 'Não autorizado. Por favor, faça login novamente.' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        console.log('WhatsApp Connection API: Authenticated User ID:', userId);

        // 1. Get tenant ID
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.error('Profile fetch error:', profileError);
            return NextResponse.json({ error: 'Perfil ou negócio não encontrado.' }, { status: 404 });
        }

        const instanceName = `tenant-${profile.tenant_id}`;
        console.log('WhatsApp Connection API: Instance Name:', instanceName);

        // 2. Check if instance exists, create if not
        const exists = await whatsappService.instanceExists(instanceName);
        if (!exists) {
            console.log('WhatsApp Connection API: Creating new instance:', instanceName);
            await whatsappService.createInstance(instanceName);
            // Wait for instance to be ready
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // 3. Get QR Code
        console.log('WhatsApp Connection API: Fetching QR Code for:', instanceName);
        const data = await whatsappService.getQrCode(instanceName);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('WhatsApp Connection API Root Error:', error);

        // Provide more detailed error info if it's an axios error
        const errorMessage = error.response?.data?.message || error.message || 'Erro interno ao conectar WhatsApp';
        const errorDetails = error.response?.data || null;

        return NextResponse.json({
            error: errorMessage,
            details: errorDetails
        }, { status: 500 });
    }
}
