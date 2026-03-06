import { NextResponse } from 'next/server';
import { dashboardService } from '@/services/dashboard.service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id');

    if (!tenantId) {
        return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 });
    }

    try {
        const appointments = await dashboardService.getTodayAppointments(tenantId);
        return NextResponse.json(appointments);
    } catch (error) {
        console.error('API Error refreshing today appointments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
