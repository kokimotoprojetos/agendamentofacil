import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { whatsappService } from '@/services/whatsapp.service';

export async function POST(req: Request) {
    try {
        // 1. Validate webhook secret
        const url = new URL(req.url);
        const webhookSecret = url.searchParams.get('webhookSecret');

        if (webhookSecret !== process.env.ABACATEPAY_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Log webhook event
        await supabaseAdmin.from('agent_logs').insert({
            event_type: 'abacatepay_webhook',
            description: `AbacatePay webhook: ${body.event || 'unknown'}`,
            metadata: { body },
        });

        // 2. Handle billing.paid event
        if (body.event === 'billing.paid') {
            const billingData = body.data?.billing || body.data?.pixQrCode;
            const billingId = billingData?.id;

            if (!billingId) {
                return NextResponse.json({ error: 'Missing billing ID' }, { status: 400 });
            }

            // 3. Find appointment by payment_id
            const { data: appointment, error: findError } = await supabaseAdmin
                .from('appointments')
                .select('*, tenant:tenants(id, business_name), service:services(name)')
                .eq('payment_id', billingId)
                .single();

            if (findError || !appointment) {
                await supabaseAdmin.from('agent_logs').insert({
                    event_type: 'payment_webhook_no_match',
                    description: `No appointment found for billing ${billingId}`,
                    metadata: { billingId, error: findError?.message },
                });
                return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
            }

            // 4. Update appointment payment status
            await supabaseAdmin
                .from('appointments')
                .update({
                    payment_status: 'paid',
                    status: 'scheduled',
                })
                .eq('id', appointment.id);

            // 5. Log payment confirmation
            await supabaseAdmin.from('agent_logs').insert({
                tenant_id: appointment.tenant_id,
                event_type: 'payment_confirmed',
                description: `Pagamento confirmado para ${appointment.customer_name} - ${appointment.service?.name}`,
                metadata: {
                    appointmentId: appointment.id,
                    billingId,
                    amount: billingData.amount,
                },
            });

            // 6. Send WhatsApp confirmation to customer
            if (appointment.customer_phone) {
                try {
                    // Find WhatsApp instance for this tenant
                    const { data: connection } = await supabaseAdmin
                        .from('whatsapp_connections')
                        .select('instance_name')
                        .eq('tenant_id', appointment.tenant_id)
                        .single();

                    if (connection?.instance_name) {
                        const customerPhone = appointment.customer_phone;
                        const serviceName = appointment.service?.name || 'serviço';
                        const dateFormatted = new Date(appointment.start_time).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                        });
                        const timeFormatted = new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        });

                        const confirmMsg = `✅ *Pagamento confirmado!*\n\nSeu agendamento de *${serviceName}* está confirmado para *${dateFormatted}* às *${timeFormatted}*.\n\nTe esperamos! 😊`;

                        await whatsappService.sendMessage(
                            connection.instance_name,
                            customerPhone,
                            confirmMsg
                        );
                    }
                } catch (sendErr: any) {
                    console.error('[payment-webhook] Error sending WhatsApp confirmation:', sendErr.message);
                }
            }

            return NextResponse.json({ status: 'success', message: 'Payment confirmed' });
        }

        // Other events — just acknowledge
        return NextResponse.json({ status: 'received' });
    } catch (error: any) {
        console.error('[payment-webhook] Fatal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
