import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // 1. Get user profile and tenant
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // 2. Get conversations
        const { data: conversations, error: convsError } = await supabaseAdmin
            .from('conversations')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
            .order('last_message_at', { ascending: false });

        if (convsError) {
            return NextResponse.json({ error: convsError.message }, { status: 500 });
        }

        return NextResponse.json(conversations || []);
    } catch (error: any) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
