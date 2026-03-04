import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { whatsappService } from '@/services/whatsapp.service';
import { format, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function GET(req: Request) {
    try {
        // Authenticate via Authorization header instead of query parameter
        const authHeader = req.headers.get('Authorization');
        const expectedKey = process.env.CRON_SECRET || process.env.EVOLUTION_API_KEY;

        if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const fourHoursFromNow = addHours(now, 4);

        // 1. Fetch appointments starting in the next 4 hours
        const { data: appts, error } = await supabaseAdmin
            .from('appointments')
            .select('*, service:services(name)')
            .eq('status', 'scheduled')
            .eq('reminder_sent', false)
            .gte('start_time', now.toISOString())
            .lte('start_time', fourHoursFromNow.toISOString());

        if (error) throw error;

        if (!appts || appts.length === 0) {
            return NextResponse.json({ status: 'no_reminders_needed' });
        }

        const results = [];

        // 2. Send reminders
        for (const appt of appts) {
            try {
                // Find the active WhatsApp connection for this tenant
                const { data: conn } = await supabaseAdmin
                    .from('whatsapp_connections')
                    .select('instance_name')
                    .eq('tenant_id', appt.tenant_id)
                    .eq('status', 'connected')
                    .single();

                if (!conn) {
                    console.warn(`[reminders] No connected instance for tenant ${appt.tenant_id}`);
                    continue;
                }

                const dateObj = new Date(appt.start_time);
                const timeStr = format(dateObj, 'HH:mm');
                const dayStr = format(dateObj, "d 'de' MMMM", { locale: ptBR });

                const firstName = appt.customer_name?.split(' ')[0] || 'cliente';
                const message = `Oi ${firstName}! 😊 Passando para lembrar do seu agendamento de *${appt.service?.name || 'serviço'}* hoje, às *${timeStr}*. Te esperamos! 🕒✨`;

                // Send message
                await whatsappService.sendMessage(conn.instance_name, `${appt.customer_phone}@s.whatsapp.net`, message);

                // Update appointment
                await supabaseAdmin
                    .from('appointments')
                    .update({ reminder_sent: true })
                    .eq('id', appt.id);

                results.push({ id: appt.id, customer: appt.customer_name, status: 'sent' });

            } catch (apptError: any) {
                console.error(`[reminders] Error processing appt ${appt.id}:`, apptError.message);
                results.push({ id: appt.id, status: 'error', error: apptError.message });
            }
        }

        return NextResponse.json({ status: 'finished', processed: results.length, details: results });

    } catch (error: any) {
        console.error('[reminders] Critical error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
