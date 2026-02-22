import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import axios from 'axios';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', (session.user as any).id)
            .single();

        const instanceName = profile ? `wa_${profile.tenant_id.split('-')[0]}` : null;
        let evolutionWebhookDetails = null;

        if (instanceName) {
            try {
                const response = await axios.get(`${process.env.EVOLUTION_API_URL}/webhook/find/${instanceName}`, {
                    headers: { 'apikey': process.env.EVOLUTION_API_KEY }
                });
                evolutionWebhookDetails = response.data;
            } catch (e: any) {
                evolutionWebhookDetails = { error: e.message, details: e.response?.data };
            }
        }

        const envs = {
            APP_URL: process.env.APP_URL ? 'Configured ✅' : 'Missing ❌',
            EVOLUTION_API_URL: process.env.EVOLUTION_API_URL ? 'Configured ✅' : 'Missing ❌',
            EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ? 'Present ✅' : 'Missing ❌',
            DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? 'Present ✅' : 'Missing ❌',
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured ✅' : 'Missing ❌',
            SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present ✅' : 'Missing ❌',
        };

        return NextResponse.json({
            status: 'Diagnostic Report',
            timestamp: new Date().toISOString(),
            environment: envs,
            appUrlValue: process.env.APP_URL || 'not-set',
            instance: instanceName,
            evolutionWebhook: evolutionWebhookDetails
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
