import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { aiAgentService } from '@/services/ai.service';
import { whatsappService } from '@/services/whatsapp.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received WhatsApp Webhook:', JSON.stringify(body, null, 2));

    // Handle MESSAGES_UPSERT event from Evolution API
    if (body.event === 'messages.upsert') {
      const { instance, data } = body;
      const message = data.message;
      
      // Basic validation: ignore if it's from the bot itself (sent by us)
      if (data.key.fromMe) {
        return NextResponse.json({ status: 'ignored', reason: 'own_message' });
      }

      const customerPhone = data.key.remoteJid;
      const messageText = message?.conversation || message?.extendedTextMessage?.text || "";

      if (!messageText) {
        return NextResponse.json({ status: 'ignored', reason: 'empty_message' });
      }

      // 1. Resolve Tenant from Instance Name
      const { data: connection, error: connError } = await supabase
        .from('whatsapp_connections')
        .select('tenant_id')
        .eq('instance_name', instance)
        .single();

      if (connError || !connection) {
        console.error('Tenant not found for instance:', instance);
        return NextResponse.json({ status: 'error', message: 'Tenant not found' }, { status: 404 });
      }

      const tenantId = connection.tenant_id;

      // 2. Fetch Tenant Context
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      const { data: services } = await supabase
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
