import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { whatsappService } from '@/services/whatsapp.service';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
    try {

        // 1. Strict Validation of Environment Variables
        const requiredVars = {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
            EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
            EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY
        };

        const missingOrPlaceholder = Object.entries(requiredVars).filter(([key, value]) => {
            return !value || value.includes('your-') || value.includes('placeholder');
        });

        if (missingOrPlaceholder.length > 0) {
            const fieldNames = missingOrPlaceholder.map(([key]) => key).join(', ');
            console.error('Environment variables are not configured:', fieldNames);
            return NextResponse.json({
                error: `Configuração incompleta. Você precisa preencher os campos [${fieldNames}] no seu arquivo .env.local com valores reais.`
            }, { status: 500 });
        }

        // 2. Session Validation
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            console.warn('WhatsApp Connection API: No valid session found');
            return NextResponse.json({ error: 'Sessão expirada. Por favor, saia do sistema e entre novamente.' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // 3. Get tenant ID
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.error('Profile fetch error:', profileError);
            return NextResponse.json({ error: 'Configuração de negócio não encontrada no banco de dados.' }, { status: 404 });
        }

        const instanceName = `wa_${profile.tenant_id.split('-')[0]}`;

        // 4. Check if instance exists, create if not
        const exists = await whatsappService.instanceExists(instanceName);
        if (!exists) {
            await whatsappService.createInstance(instanceName);
            // Wait for instance to be ready
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Always Update/Sync Webhook to ensure reachable URL is correct
        try {
            const webhookResult = await whatsappService.setWebhook(instanceName);
            await supabaseAdmin.from('agent_logs').insert({
                tenant_id: profile.tenant_id,
                event_type: 'webhook_sync_success',
                description: `Webhook sincronizado para ${instanceName} com URL: ${process.env.APP_URL}`,
                metadata: { webhookResult, appUrl: process.env.APP_URL }
            });
        } catch (webhookError: any) {
            console.error('Webhook sync failed:', webhookError);
            await supabaseAdmin.from('agent_logs').insert({
                tenant_id: profile.tenant_id,
                event_type: 'webhook_sync_error',
                description: `Falha ao sincronizar webhook para ${instanceName}: ${webhookError.message}`,
                metadata: {
                    error: webhookError.response?.data || webhookError.message,
                    appUrl: process.env.APP_URL
                }
            });
        }

        // 4.2 Persist connection in DB for webhook lookup
        const { error: upsertError } = await supabaseAdmin
            .from('whatsapp_connections')
            .upsert({
                tenant_id: profile.tenant_id,
                instance_name: instanceName,
                status: 'connected',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'instance_name'
            });

        await supabaseAdmin.from('agent_logs').insert({
            tenant_id: profile.tenant_id,
            event_type: 'whatsapp_connect_attempt',
            description: `Tentativa de conexão para ${instanceName}. Erro upsert: ${upsertError?.message || 'nenhum'}`,
            metadata: { instanceName, upsertError }
        });

        if (upsertError) {
            console.error('Error persisting WhatsApp connection:', upsertError);
        }

        // 5. Get QR Code
        const data = await whatsappService.getQrCode(instanceName);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('WhatsApp Connection API Root Error:', error);

        let errorMessage = error.message || 'Erro interno ao conectar WhatsApp';
        let errorDetails = error.response?.data || null;

        if (error.response) {
            console.error('Evolution API Error Response:', {
                status: error.response.status,
                data: error.response.data
            });

            // If the error data is an object with a message or error field, use it
            const detailMsg = error.response.data?.message || error.response.data?.error || error.response.data?.err;

            if (Array.isArray(detailMsg)) {
                errorMessage = detailMsg.join(', ');
            } else if (typeof detailMsg === 'string') {
                errorMessage = detailMsg;
            } else if (typeof error.response.data === 'object') {
                errorMessage = JSON.stringify(error.response.data);
            }
        }

        return NextResponse.json({
            error: errorMessage,
            details: errorDetails
        }, { status: error.response?.status || 500 });
    }
}
