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

// GET /api/appointments/month?year=2026&month=2
// Returns { "2026-02-25": 3, "2026-02-27": 1 } — count of appointments per day
export async function GET(req: Request) {
    try {
        const tenantId = await getTenantId();
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const year = parseInt(searchParams.get('year') || '');
        const month = parseInt(searchParams.get('month') || '');

        if (isNaN(year) || isNaN(month)) {
            return NextResponse.json({ error: 'year e month são obrigatórios' }, { status: 400 });
        }

        // Adjust boundaries to ensure we don't miss appointments near the edges due to timezone
        // Start of month (00:00 BRT) = 03:00 UTC
        const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01T03:00:00.000Z`;

        // End of month (23:59 BRT) = Next month T02:59 UTC
        let nextYear = year;
        let nextMonthNum = month + 1;
        if (nextMonthNum > 12) {
            nextMonthNum = 1;
            nextYear++;
        }
        const nextMonth = `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-01T02:59:59.999Z`;

        const { data, error } = await supabaseAdmin
            .from('appointments')
            .select('start_time')
            .eq('tenant_id', tenantId)
            .neq('status', 'cancelled')
            .gte('start_time', startOfMonth)
            .lt('start_time', nextMonth);

        if (error) throw error;

        // Count per day, adjusting for Brazil (UTC-3)
        const counts: Record<string, number> = {};
        for (const row of data || []) {
            const dateUTC = new Date(row.start_time);
            // Subtract 3 hours for Brazil
            const dateBR = new Date(dateUTC.getTime() - 3 * 60 * 60 * 1000);
            const day = dateBR.toISOString().substring(0, 10); // YYYY-MM-DD in local time
            counts[day] = (counts[day] || 0) + 1;
        }

        return NextResponse.json(counts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
