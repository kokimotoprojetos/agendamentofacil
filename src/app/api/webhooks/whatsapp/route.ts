import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { aiAgentService } from '@/services/ai.service';
import { whatsappService } from '@/services/whatsapp.service';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 0. Diagnostic Logging
    await supabaseAdmin.from('agent_logs').insert({
      event_type: 'WEBHOOK_V3_LIVE',
      description: `Webhook v3 received: ${body.event || 'unknown'}`,
      metadata: { fullBody: body }
    });

    const { instance, data } = body;
    const event = body.event || body.type || 'unknown';

    // ── 1. Resolve Tenant from Instance Name Early ───────────────────────────
    const { data: connection, error: connError } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('tenant_id')
      .eq('instance_name', instance)
      .single();

    const tenantId = connection?.tenant_id ? String(connection.tenant_id) : null;

    // ── 2. Handle Connection Updates (Status/QR) ─────────────────────────────
    if (event === 'connection.update' || event === 'CONNECTION_UPDATE') {
      const state = data?.state || data?.status;
      const statusReason = data?.statusReason;

      await supabaseAdmin.from('agent_logs').insert({
        tenant_id: tenantId,
        event_type: 'connection_update',
        description: `Conexão ${instance}: ${state} (Razão: ${statusReason})`,
        metadata: { instance, state, data }
      });

      if (state) {
        await supabaseAdmin.from('whatsapp_connections')
          .update({
            status: state === 'open' ? 'connected' : (state === 'connecting' ? 'connecting' : 'disconnected'),
            updated_at: new Date().toISOString()
          })
          .eq('instance_name', instance);
      }
      return NextResponse.json({ status: 'received' });
    }

    if (event === 'qrcode.updated' || event === 'QRCODE_UPDATED') {
      const qrcode = data?.qrcode?.code || data?.code;

      await supabaseAdmin.from('agent_logs').insert({
        tenant_id: tenantId,
        event_type: 'qrcode_updated',
        description: `QR Code atualizado para ${instance}`,
        metadata: { instance }
      });

      if (qrcode) {
        await supabaseAdmin.from('whatsapp_connections')
          .update({
            qr_code: qrcode,
            status: 'disconnected',
            updated_at: new Date().toISOString()
          })
          .eq('instance_name', instance);
      }
      return NextResponse.json({ status: 'received' });
    }

    // ── 3. Handle MESSAGES_UPSERT — Final Guard ──────────────────────────────
    const isUpsert = event === 'messages.upsert' || event === 'MESSAGES_UPSERT';

    if (!isUpsert) {
      return NextResponse.json({ status: 'received', reason: 'unhandled_event' });
    }

    // Evolution API v2: key and message are directly under data
    const key = data?.key;

    // Ignore messages sent by the bot itself
    if (key?.fromMe) {
      return NextResponse.json({ status: 'ignored', reason: 'own_message' });
    }

    const customerPhone = key?.remoteJid;

    // ── Detect message type ──────────────────────────────────────────────────
    const audioMessage = data?.message?.audioMessage;
    let messageText = '';
    let isAudio = false;

    if (audioMessage) {
      // Audio message — download and transcribe
      isAudio = true;
      try {
        const messageId = key?.id;
        const mimeType = audioMessage.mimetype || 'audio/ogg; codecs=opus';

        // Download audio from Evolution API base64 endpoint
        const evolutionUrl = process.env.EVOLUTION_API_URL;
        const evolutionKey = process.env.EVOLUTION_API_KEY;

        const mediaRes = await axios.post(
          `${evolutionUrl}/chat/getBase64FromMediaMessage/${instance}`,
          { message: { key, message: data.message } },
          { headers: { apikey: evolutionKey!, 'Content-Type': 'application/json' } }
        );

        const base64Data = mediaRes.data?.base64;
        if (base64Data) {
          const audioBuffer = Buffer.from(base64Data, 'base64');
          messageText = await aiAgentService.transcribeAudio(audioBuffer, mimeType);

          await supabaseAdmin.from('agent_logs').insert({
            tenant_id: tenantId,
            event_type: 'audio_transcribed',
            description: `Áudio de ${customerPhone} transcrito: "${messageText.substring(0, 80)}"`,
            metadata: { customerPhone, audioSize: audioBuffer.length, mimeType, transcription: messageText }
          });
        } else {
          await supabaseAdmin.from('agent_logs').insert({
            tenant_id: tenantId,
            event_type: 'audio_download_failed',
            description: `Falha ao baixar áudio de ${customerPhone} — sem base64`,
            metadata: { customerPhone, messageId }
          });
        }
      } catch (audioError: any) {
        await supabaseAdmin.from('agent_logs').insert({
          event_type: 'audio_error',
          description: `Erro ao processar áudio: ${audioError.message}`,
          metadata: { customerPhone, error: audioError.message }
        });
      }
    } else {
      // Text message
      messageText = data?.message?.conversation ||
        data?.message?.extendedTextMessage?.text ||
        data?.conversation ||
        data?.text ||
        '';
    }

    let pushName = data?.pushName || '';
    let profilePicUrl = data?.profilePicUrl || '';

    // If name or photo is missing, try to fetch from API
    if (!pushName || (!profilePicUrl && !profilePicUrl.startsWith('http'))) {
      try {
        const profile = await whatsappService.getContactProfile(instance, customerPhone);
        if (profile.name && !pushName) pushName = profile.name;
        if (profile.picture && (!profilePicUrl || !profilePicUrl.startsWith('http'))) profilePicUrl = profile.picture;
      } catch (err) {
        console.error('Failed to fetch profile during webhook:', err);
      }
    }

    await supabaseAdmin.from('agent_logs').insert({
      tenant_id: tenantId,
      event_type: 'webhook_parsed',
      description: `${isAudio ? '🎤 Áudio' : '💬 Texto'} de ${pushName || customerPhone}: "${messageText.substring(0, 50)}"`,
      metadata: { customerPhone, pushName, messageText, instance, isAudio, profilePicUrl }
    });

    if (!messageText || !customerPhone) {
      return NextResponse.json({ status: 'ignored', reason: isAudio ? 'transcription_failed' : 'invalid_payload' });
    }

    if (!tenantId) {
      await supabaseAdmin.from('agent_logs').insert({
        event_type: 'webhook_error',
        description: `Tenant não encontrado para a instância: ${instance}`,
        metadata: { instance, connError }
      });
      return NextResponse.json({ status: 'error', message: 'Tenant not found' }, { status: 404 });
    }

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
      history: [],
      instanceName: instance,
      customerName: pushName,
      customerPicture: profilePicUrl
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
      const result = await whatsappService.sendMessage(instance, customerPhone, aiResponse);
      await supabaseAdmin.from('agent_logs').insert({
        tenant_id: tenantId,
        event_type: 'message_sent',
        description: `Mensagem enviada para ${customerPhone}`,
        metadata: { customerPhone, instance, apiResponse: result }
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


