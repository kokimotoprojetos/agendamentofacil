import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { aiAgentService } from '@/services/ai.service';
import { whatsappService } from '@/services/whatsapp.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 0. Diagnostic Logging
    await supabaseAdmin.from('agent_logs').insert({
      event_type: 'WEBHOOK_V3_LIVE',
      description: `Webhook v3 received: ${body.event || 'unknown'}`,
      metadata: { instance: body.instance, event: body.event }
    });

    // Handle MESSAGES_UPSERT event from Evolution API
    const isUpsert = body.event === 'messages.upsert' ||
      body.event === 'MESSAGES_UPSERT' ||
      body.type === 'messages.upsert';

    if (!isUpsert) {
      return NextResponse.json({ status: 'received', reason: 'not_a_message_event' });
    }

    const { instance, data } = body;

    // Evolution API v2: key and message are directly under data
    const key = data?.key;

    // Ignore messages sent by the bot itself
    if (key?.fromMe) {
      return NextResponse.json({ status: 'ignored', reason: 'own_message' });
    }

    const customerPhone = key?.remoteJid;
    // In this Evolution API version, message text is under data.message.conversation
    const messageText = data?.message?.conversation ||
      data?.message?.extendedTextMessage?.text ||
      data?.conversation ||
      data?.text ||
      "";

    await supabaseAdmin.from('agent_logs').insert({
      event_type: 'webhook_parsed',
      description: `Mensagem recebida de ${customerPhone}: "${messageText.substring(0, 50)}"`,
      metadata: { customerPhone, messageText, instance }
    });

    if (!messageText || !customerPhone) {
      return NextResponse.json({ status: 'ignored', reason: 'invalid_payload' });
    }

    // 1. Resolve Tenant from Instance Name
    const { data: connection, error: connError } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('tenant_id')
      .eq('instance_name', instance)
      .single();

    if (connError || !connection) {
      await supabaseAdmin.from('agent_logs').insert({
        event_type: 'webhook_error',
        description: `Tenant não encontrado para a instância: ${instance}`,
        metadata: { instance, connError }
      });
      return NextResponse.json({ status: 'error', message: 'Tenant not found' }, { status: 404 });
    }

    const tenantId = String(connection.tenant_id);

    // 2. Fetch Tenant Context
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    const { data: services, error: servicesError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId);

    const context = {
      businessName: tenant?.business_name || "Nosso Salão",
      personality: tenant?.settings?.personality || "Amigável e profissional",
      location: tenant?.settings?.location || tenant?.settings?.address || "Endereço sob consulta",
      workingHours: tenant?.settings?.workingHours || { start: "09:00", end: "18:00" },
      services: services || [],
      history: []
    };

    // Log contextual debug info
    await supabaseAdmin.from('agent_logs').insert({
      tenant_id: tenantId,
      event_type: 'debug_context_v3',
      description: `V3: ${services?.length || 0} serviços. Local: ${context.location}`,
      metadata: {
        tenantId,
        serviceCount: services?.length || 0,
        location: context.location,
        services: services?.map((s: any) => s.name)
      }
    });

    // 3. Process with AI
    let aiResponse: string;
    try {
      aiResponse = await aiAgentService.processResponse(tenantId, customerPhone, messageText, context);
      await supabaseAdmin.from('agent_logs').insert({
        tenant_id: tenantId,
        event_type: 'ai_response_generated',
        description: `Resposta IA gerada: "${aiResponse.substring(0, 100)}"`,
        metadata: { customerPhone, aiResponse }
      });
    } catch (aiError: any) {
      await supabaseAdmin.from('agent_logs').insert({
        tenant_id: tenantId,
        event_type: 'ai_response_error',
        description: `Falha ao gerar resposta da IA: ${aiError.message}`,
        metadata: { error: aiError.message, customerPhone }
      });
      return NextResponse.json({ status: 'error', message: 'AI processing failed' }, { status: 500 });
    }

    // 4. Send Response via WhatsApp
    try {
      await whatsappService.sendMessage(instance, customerPhone, aiResponse);
      await supabaseAdmin.from('agent_logs').insert({
        tenant_id: tenantId,
        event_type: 'message_sent',
        description: `Mensagem enviada para ${customerPhone}`,
        metadata: { customerPhone, instance }
      });
    } catch (sendError: any) {
      const errorDetails = sendError.response?.data || sendError.message;
      const statusCode = sendError.response?.status || 500;

      await supabaseAdmin.from('agent_logs').insert({
        tenant_id: tenantId,
        event_type: 'message_send_error',
        description: `Falha ao enviar mensagem para ${customerPhone}: ${sendError.message}`,
        metadata: {
          error: sendError.message,
          errorBody: errorDetails,
          statusCode: statusCode,
          customerPhone,
          instance,
          payload: { number: customerPhone.replace('@s.whatsapp.net', '').replace('@g.us', ''), text: aiResponse.substring(0, 100) }
        }
      });
      return NextResponse.json({ status: 'error', message: 'Message send failed', details: errorDetails }, { status: 500 });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Webhook Root Error:', error);
    try {
      await supabaseAdmin.from('agent_logs').insert({
        event_type: 'webhook_fatal_error',
        description: `Erro fatal no webhook: ${error.message}`,
        metadata: { error: error.message }
      });
    } catch (_) { /* ignore logging errors */ }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Webhook Operational');
}
