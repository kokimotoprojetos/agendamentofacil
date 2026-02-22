import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { aiAgentService } from '@/services/ai.service';
import { whatsappService } from '@/services/whatsapp.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received WhatsApp Webhook:', JSON.stringify(body, null, 2));

    // 0. Diagnostic Logging
    await supabaseAdmin.from('agent_logs').insert({
      event_type: 'webhook_hit',
      description: `Webhook received: ${body.event || 'unknown event'}`,
      metadata: body
    });

    // Handle MESSAGES_UPSERT event from Evolution API
    const isUpsert = body.event === 'messages.upsert' ||
      body.event === 'MESSAGES_UPSERT' ||
      body.type === 'messages.upsert';

    if (isUpsert) {
      const { instance, data } = body;

      // Evolution API v2 payload structure can vary
      const messageObj = data.message || data;
      const key = data.key || messageObj?.key;

      // Basic validation: ignore if it's from the bot itself (sent by us)
      if (key?.fromMe) {
        return NextResponse.json({ status: 'ignored', reason: 'own_message' });
      }

      const customerPhone = key?.remoteJid;
      const messageText = messageObj?.conversation ||
        messageObj?.extendedTextMessage?.text ||
        messageObj?.text ||
        messageObj?.message?.conversation ||
        "";

      if (!messageText || !customerPhone) {
        await supabaseAdmin.from('agent_logs').insert({
          event_type: 'webhook_ignored',
          description: `Payload inválido ou vazio de ${instance}`,
          metadata: { body }
        });
        return NextResponse.json({ status: 'ignored', reason: 'invalid_payload' });
      }

      // 1. Resolve Tenant from Instance Name
      const { data: connection, error: connError } = await supabaseAdmin
        .from('whatsapp_connections')
        .select('tenant_id')
        .eq('instance_name', instance)
        .single();

      if (connError || !connection) {
        console.error('Tenant not found for instance:', instance);
        await supabaseAdmin.from('agent_logs').insert({
          event_type: 'webhook_error',
          description: `Tenant não encontrado para a instância: ${instance}`,
          metadata: { instance, body }
        });
        return NextResponse.json({ status: 'error', message: 'Tenant not found' }, { status: 404 });
      }

      const tenantId = connection.tenant_id;

      // 2. Fetch Tenant Context
      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      const { data: services } = await supabaseAdmin
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId);

      const context = {
        businessName: tenant?.business_name || "Nosso Salão",
        personality: tenant?.settings?.personality || "Amigável e profissional",
        workingHours: tenant?.settings?.workingHours || { start: "09:00", end: "18:00" },
        services: services || [],
        history: [] // History will be handled inside aiAgentService.processResponse
      };

      // 3. Process with AI
      const aiResponse = await aiAgentService.processResponse(tenantId, customerPhone, messageText, context);

      // 4. Send Response via WhatsApp (mocked or real call)
      // Note: evolutionApi.post('/message/sendText/{{instance}}', ...)
      await whatsappService.sendMessage(instance, customerPhone, aiResponse);

      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper to handle GET requests for webhook validation if needed by some providers
export async function GET() {
  return new NextResponse('Webhook Operational');
}
