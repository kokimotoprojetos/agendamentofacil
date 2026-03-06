import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function getTenantId(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single();

    return profile?.tenant_id || null;
}

// GET - List appointments
// Accepts optional ?date=YYYY-MM-DD query param to filter by date
export async function GET(req: Request) {
    try {
        const tenantId = await getTenantId();
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');

        let query = supabaseAdmin
            .from('appointments')
            .select('*, service:services(name, duration, price)')
            .eq('tenant_id', tenantId)
            .neq('status', 'cancelled')
            .order('start_time', { ascending: true });

        if (date) {
            // Brazil is UTC-3. To get the full day in Brazil:
            // Start: Day T00:00 BRT = Day T03:00 UTC
            // End: Day T23:59 BRT = Day+1 T02:59 UTC
            const startStr = `${date}T03:00:00.000Z`;
            const dateObj = new Date(date + 'T12:00:00Z');
            dateObj.setUTCDate(dateObj.getUTCDate() + 1);
            const nextDay = dateObj.toISOString().split('T')[0];
            const endStr = `${nextDay}T02:59:59.999Z`;

            query = query.gte('start_time', startStr).lte('start_time', endStr);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new appointment
export async function POST(req: Request) {
    try {
        const tenantId = await getTenantId();
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const body = await req.json();
        const { service_id, customer_name, customer_phone, start_time, notes } = body;

        if (!service_id || !customer_name || !start_time) {
            return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 });
        }

        // Fetch service duration to calculate end_time
        const { data: service } = await supabaseAdmin
            .from('services')
            .select('duration')
            .eq('id', service_id)
            .single();

        const duration = service?.duration || 60;
        const endDate = new Date(new Date(start_time).getTime() + duration * 60 * 1000);

        const { data, error } = await supabaseAdmin
            .from('appointments')
            .insert({
                tenant_id: tenantId,
                service_id,
                customer_name,
                customer_phone: customer_phone || '',
                start_time,
                end_time: endDate.toISOString(),
                status: 'scheduled',
                notes: notes || ''
            })
            .select('*, service:services(name, duration, price)')
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update an appointment (status, notes, reschedule)
export async function PUT(req: Request) {
    try {
        const tenantId = await getTenantId();
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const body = await req.json();
        const { id, status, notes, start_time, service_id, customer_name, customer_phone } = body;

        if (!id) return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });

        const updateData: Record<string, any> = {};
        if (status !== undefined) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (customer_name !== undefined) updateData.customer_name = customer_name;
        if (customer_phone !== undefined) updateData.customer_phone = customer_phone;
        if (service_id !== undefined) updateData.service_id = service_id;

        if (start_time !== undefined) {
            updateData.start_time = start_time;
            // Recalculate end_time based on service duration
            const { data: service } = await supabaseAdmin
                .from('services')
                .select('duration')
                .eq('id', service_id || body.service_id)
                .single();
            const duration = service?.duration || 60;
            updateData.end_time = new Date(new Date(start_time).getTime() + duration * 60 * 1000).toISOString();
        }

        const { data, error } = await supabaseAdmin
            .from('appointments')
            .update(updateData)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select('*, service:services(name, duration, price)')
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove an appointment
export async function DELETE(req: Request) {
    try {
        const tenantId = await getTenantId();
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });

        const { error } = await supabaseAdmin
            .from('appointments')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
